"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _path = require("path");

var _helperModuleImports = require("@babel/helper-module-imports");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function transCamel(_str, symbol) {
  var str = _str[0].toLowerCase() + _str.substr(1);
  return str.replace(/([A-Z])/g, function ($1) {
    return "" + symbol + $1.toLowerCase();
  });
}

function winPath(path) {
  return path.replace(/\\/g, "/");
}

function normalizeCustomName(originCustomName) {
  // If set to a string, treat it as a JavaScript source file path.
  if (typeof originCustomName === "string") {
    var customNameExports = require(originCustomName);
    return typeof customNameExports === "function" ? customNameExports : customNameExports.default;
  }

  return originCustomName;
}

var Plugin = function () {
  function Plugin(libraryName, libraryDirectory, style, styleLibraryDirectory, customStyleName, camel2DashComponentName, camel2UnderlineComponentName, fileName, customName, transformToDefaultImport, types) {
    var index = arguments.length > 11 && arguments[11] !== undefined ? arguments[11] : 0;

    _classCallCheck(this, Plugin);

    this.libraryName = libraryName;
    this.libraryDirectory = typeof libraryDirectory === "undefined" ? "lib" : libraryDirectory;
    this.camel2DashComponentName = typeof camel2DashComponentName === "undefined" ? true : camel2DashComponentName;
    this.camel2UnderlineComponentName = camel2UnderlineComponentName;
    this.style = style || false;
    this.styleLibraryDirectory = styleLibraryDirectory;
    this.customStyleName = normalizeCustomName(customStyleName);
    this.fileName = fileName || "";
    this.customName = normalizeCustomName(customName);
    this.transformToDefaultImport = typeof transformToDefaultImport === "undefined" ? true : transformToDefaultImport;
    this.types = types;
    this.pluginStateKey = "importPluginState" + index;
  }

  _createClass(Plugin, [{
    key: "getPluginState",
    value: function getPluginState(state) {
      if (!state[this.pluginStateKey]) {
        state[this.pluginStateKey] = {}; // eslint-disable-line
      }
      return state[this.pluginStateKey];
    }
  }, {
    key: "importMethod",
    value: function importMethod(methodName, file, pluginState) {
      if (!pluginState.selectedMethods[methodName]) {
        var libraryDirectory = this.libraryDirectory;
        var style = this.style;
        var transformedMethodName = this.camel2UnderlineComponentName // eslint-disable-line
        ? transCamel(methodName, "_") : this.camel2DashComponentName ? transCamel(methodName, "-") : methodName;
        var path = winPath(this.customName ? this.customName(transformedMethodName) : (0, _path.join)(this.libraryName, libraryDirectory, transformedMethodName, this.fileName) // eslint-disable-line
        );
        pluginState.selectedMethods[methodName] = this.transformToDefaultImport // eslint-disable-line
        ? (0, _helperModuleImports.addDefault)(file.path, path, { nameHint: methodName }) : (0, _helperModuleImports.addNamed)(file.path, methodName, path);
        if (this.customStyleName) {
          var stylePath = winPath(this.customStyleName(transformedMethodName));
          (0, _helperModuleImports.addSideEffect)(file.path, "" + stylePath);
        } else if (this.styleLibraryDirectory) {
          var _stylePath = winPath((0, _path.join)(this.libraryName, this.styleLibraryDirectory, transformedMethodName, this.fileName));
          (0, _helperModuleImports.addSideEffect)(file.path, "" + _stylePath);
        } else if (style === true) {
          (0, _helperModuleImports.addSideEffect)(file.path, path + "/style");
        } else if (style === "css") {
          (0, _helperModuleImports.addSideEffect)(file.path, path + "/style/css");
        } else if (typeof style === "function") {
          var _stylePath2 = style(path, file);
          if (_stylePath2) {
            (0, _helperModuleImports.addSideEffect)(file.path, _stylePath2);
          }
        }
      }
      return Object.assign({}, pluginState.selectedMethods[methodName]);
    }
  }, {
    key: "buildExpressionHandler",
    value: function buildExpressionHandler(node, props, path, state) {
      var _this = this;

      var file = path && path.hub && path.hub.file || state && state.file;
      var types = this.types;
      var pluginState = this.getPluginState(state);
      props.forEach(function (prop) {
        if (!types.isIdentifier(node[prop])) return;
        if (pluginState.specified[node[prop].name] && types.isImportSpecifier(path.scope.getBinding(node[prop].name).path)) {
          node[prop] = _this.importMethod(pluginState.specified[node[prop].name], file, pluginState); // eslint-disable-line
        }
      });
    }
  }, {
    key: "buildDeclaratorHandler",
    value: function buildDeclaratorHandler(node, prop, path, state) {
      var file = path && path.hub && path.hub.file || state && state.file;
      var types = this.types;
      var pluginState = this.getPluginState(state);
      if (!types.isIdentifier(node[prop])) return;
      if (pluginState.specified[node[prop].name] && path.scope.hasBinding(node[prop].name) && path.scope.getBinding(node[prop].name).path.type === "ImportSpecifier") {
        node[prop] = this.importMethod(pluginState.specified[node[prop].name], file, pluginState); // eslint-disable-line
      }
    }
  }, {
    key: "ProgramEnter",
    value: function ProgramEnter(path, state) {
      var pluginState = this.getPluginState(state);
      pluginState.specified = Object.create(null);
      pluginState.libraryObjs = Object.create(null);
      pluginState.selectedMethods = Object.create(null);
      pluginState.pathsToRemove = [];
    }
  }, {
    key: "ProgramExit",
    value: function ProgramExit(path, state) {
      this.getPluginState(state).pathsToRemove.forEach(function (p) {
        return !p.removed && p.remove();
      });
    }
  }, {
    key: "ImportDeclaration",
    value: function ImportDeclaration(path, state) {
      var node = path.node;

      // path maybe removed by prev instances.

      if (!node) return;

      var value = node.source.value;

      var libraryName = this.libraryName;
      var types = this.types;
      var pluginState = this.getPluginState(state);
      if (value === libraryName) {
        node.specifiers.forEach(function (spec) {
          if (types.isImportSpecifier(spec)) {
            pluginState.specified[spec.local.name] = spec.imported.name;
          } else {
            pluginState.libraryObjs[spec.local.name] = true;
          }
        });
        pluginState.pathsToRemove.push(path);
      }
    }
  }, {
    key: "CallExpression",
    value: function CallExpression(path, state) {
      var _this2 = this;

      var node = path.node;

      var file = path && path.hub && path.hub.file || state && state.file;
      var name = node.callee.name;

      var types = this.types;
      var pluginState = this.getPluginState(state);

      if (types.isIdentifier(node.callee)) {
        if (pluginState.specified[name]) {
          node.callee = this.importMethod(pluginState.specified[name], file, pluginState);
        }
      }

      node.arguments = node.arguments.map(function (arg) {
        var argName = arg.name;

        if (pluginState.specified[argName] && path.scope.hasBinding(argName) && path.scope.getBinding(argName).path.type === "ImportSpecifier") {
          return _this2.importMethod(pluginState.specified[argName], file, pluginState);
        }
        return arg;
      });
    }
  }, {
    key: "MemberExpression",
    value: function MemberExpression(path, state) {
      var node = path.node;

      var file = path && path.hub && path.hub.file || state && state.file;
      var pluginState = this.getPluginState(state);

      // multiple instance check.
      if (!node.object || !node.object.name) return;

      if (pluginState.libraryObjs[node.object.name]) {
        // antd.Button -> _Button
        path.replaceWith(this.importMethod(node.property.name, file, pluginState));
      } else if (pluginState.specified[node.object.name] && path.scope.hasBinding(node.object.name)) {
        var scope = path.scope.getBinding(node.object.name).scope;
        // global variable in file scope
        if (scope.path.parent.type === "File") {
          node.object = this.importMethod(pluginState.specified[node.object.name], file, pluginState);
        }
      }
    }
  }, {
    key: "Property",
    value: function Property(path, state) {
      var node = path.node;

      this.buildDeclaratorHandler(node, "value", path, state);
    }
  }, {
    key: "VariableDeclarator",
    value: function VariableDeclarator(path, state) {
      var node = path.node;

      this.buildDeclaratorHandler(node, "init", path, state);
    }
  }, {
    key: "ArrayExpression",
    value: function ArrayExpression(path, state) {
      var node = path.node;

      var props = node.elements.map(function (_, index) {
        return index;
      });
      this.buildExpressionHandler(node.elements, props, path, state);
    }
  }, {
    key: "LogicalExpression",
    value: function LogicalExpression(path, state) {
      var node = path.node;

      this.buildExpressionHandler(node, ["left", "right"], path, state);
    }
  }, {
    key: "ConditionalExpression",
    value: function ConditionalExpression(path, state) {
      var node = path.node;

      this.buildExpressionHandler(node, ["test", "consequent", "alternate"], path, state);
    }
  }, {
    key: "IfStatement",
    value: function IfStatement(path, state) {
      var node = path.node;

      this.buildExpressionHandler(node, ["test"], path, state);
      this.buildExpressionHandler(node.test, ["left", "right"], path, state);
    }
  }, {
    key: "ExpressionStatement",
    value: function ExpressionStatement(path, state) {
      var node = path.node;
      var types = this.types;

      if (types.isAssignmentExpression(node.expression)) {
        this.buildExpressionHandler(node.expression, ["right"], path, state);
      }
    }
  }, {
    key: "ReturnStatement",
    value: function ReturnStatement(path, state) {
      var node = path.node;

      this.buildExpressionHandler(node, ["argument"], path, state);
    }
  }, {
    key: "ExportDefaultDeclaration",
    value: function ExportDefaultDeclaration(path, state) {
      var node = path.node;

      this.buildExpressionHandler(node, ["declaration"], path, state);
    }
  }, {
    key: "BinaryExpression",
    value: function BinaryExpression(path, state) {
      var node = path.node;

      this.buildExpressionHandler(node, ["left", "right"], path, state);
    }
  }, {
    key: "NewExpression",
    value: function NewExpression(path, state) {
      var node = path.node;

      this.buildExpressionHandler(node, ["callee", "arguments"], path, state);
    }
  }, {
    key: "ClassDeclaration",
    value: function ClassDeclaration(path, state) {
      var node = path.node;

      this.buildExpressionHandler(node, ["superClass"], path, state);
    }
  }]);

  return Plugin;
}();

exports.default = Plugin;