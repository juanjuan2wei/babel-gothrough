"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (_ref) {
  var types = _ref.types;

  var plugins = null;

  // Only for test
  global.__clearBabelAntdPlugin = function () {
    plugins = null;
  };

  function applyInstance(method, args, context) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = plugins[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var plugin = _step.value;

        if (plugin[method]) {
          plugin[method].apply(plugin, [].concat(_toConsumableArray(args), [context]));
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }

  var Program = {
    enter: function enter(path, _ref2) {
      var _ref2$opts = _ref2.opts,
          opts = _ref2$opts === undefined ? {} : _ref2$opts;

      // Init plugin instances once.
      if (!plugins) {
        if (Array.isArray(opts)) {
          console.log("enter -> opts", opts);
          plugins = opts.map(function (_ref3, index) {
            var libraryName = _ref3.libraryName,
                libraryDirectory = _ref3.libraryDirectory,
                style = _ref3.style,
                styleLibraryDirectory = _ref3.styleLibraryDirectory,
                customStyleName = _ref3.customStyleName,
                camel2DashComponentName = _ref3.camel2DashComponentName,
                camel2UnderlineComponentName = _ref3.camel2UnderlineComponentName,
                fileName = _ref3.fileName,
                customName = _ref3.customName,
                transformToDefaultImport = _ref3.transformToDefaultImport;

            (0, _assert2.default)(libraryName, "libraryName should be provided");
            return new _Plugin2.default(libraryName, libraryDirectory, style, styleLibraryDirectory, customStyleName, camel2DashComponentName, camel2UnderlineComponentName, fileName, customName, transformToDefaultImport, types, index);
          });
        } else {
          (0, _assert2.default)(opts.libraryName, "libraryName should be provided");
          plugins = [new _Plugin2.default(opts.libraryName, opts.libraryDirectory, opts.style, opts.styleLibraryDirectory, opts.customStyleName, opts.camel2DashComponentName, opts.camel2UnderlineComponentName, opts.fileName, opts.customName, opts.transformToDefaultImport, types)];
        }
      }
      applyInstance("ProgramEnter", arguments, this); // eslint-disable-line
    },
    exit: function exit() {
      applyInstance("ProgramExit", arguments, this); // eslint-disable-line
    }
  };

  var methods = ["ImportDeclaration", "CallExpression", "MemberExpression", "Property", "VariableDeclarator", "ArrayExpression", "LogicalExpression", "ConditionalExpression", "IfStatement", "ExpressionStatement", "ReturnStatement", "ExportDefaultDeclaration", "BinaryExpression", "NewExpression", "ClassDeclaration"];

  var ret = {
    visitor: { Program: Program }
  };

  var _loop = function _loop(method) {
    ret.visitor[method] = function () {
      // eslint-disable-line
      applyInstance(method, arguments, ret.visitor); // eslint-disable-line
    };
  };

  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = methods[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var method = _step2.value;

      _loop(method);
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  return ret;
};

var _assert = require("assert");

var _assert2 = _interopRequireDefault(_assert);

var _Plugin = require("./Plugin");

var _Plugin2 = _interopRequireDefault(_Plugin);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }