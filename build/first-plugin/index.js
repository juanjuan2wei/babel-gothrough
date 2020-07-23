"use strict";

var type = require("babel-types");
module.exports = function (_ref) {
  var type = _ref.types;

  return {
    visitor: {
      ImportDeclaration: function ImportDeclaration(path) {
        var ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { opts: {} };

        var specifiers = path.node.specifiers;
        var source = path.node.source;
        var libraryName = source.value;
        var component_reg = /^-\/components/;
        var is_component = component_reg.test(libraryName);
        if (is_component && specifiers.find(function (specifier) {
          return type.isImportSpecifier(specifier);
        })) {
          var declarationNodes = [];

          specifiers.forEach(function (specifier) {
            if (!type.isImportDefaultSpecifier(specifier)) {
              // 是否使用别名
              declarationNodes.push(type.importDeclaration(
              // 判断是否使用别名
              specifier.imported.name == specifier.local.name ? [type.importDefaultSpecifier(specifier.imported)] : [type.importSpecifier(specifier.local, type.identifier("default"))], type.stringLiteral(ref.opts.business.some(function (x) {
                return x === specifier.imported.name;
              }) ? "-/component/business/" + specifier.imported.name : "-/component" + ref.opts.modulePath.replace("{moduleName}", specifier.imported.name))));
            }
          });
          // 一个节点替换成多个
          path.replaceWithMultiple(declarationNodes);
        }
      }
    }
  };
};