"use strict";

var type = require("babel-types");
module.exports = function (_ref) {
  var type = _ref.types;

  return {
    visitor: {
      ImportDeclaration: function ImportDeclaration(path) {
        var ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { opts: {} };

        // ref.opts 可以拿到.babelrc里面配置的字段
        var specifiers = path.node.specifiers;
        var source = path.node.source;
        var libraryName = source.value;
        var getFileName = ref.opts.libraryDirectory;
        var libraryDirectory = typeof getFileName === "undefined" ? "lib" : getFileName;

        var declarationNodes = [];

        if (libraryName === ref.opts.libraryName) {
          specifiers.forEach(function (specifier) {
            if (!type.isImportDefaultSpecifier(specifier)) {
              // 是否使用别名
              declarationNodes.push(type.importDeclaration(
              // 判断是否使用别名
              specifier.imported.name == specifier.local.name ? [type.importDefaultSpecifier(specifier.imported)] : [type.importSpecifier(specifier.local, type.identifier("default"))], type.stringLiteral(libraryName + "/" + libraryDirectory + "/" + specifier.imported.name)));
              // 添加样式
              if (ref.opts.style) {
                declarationNodes.push(type.importDeclaration([], type.stringLiteral(libraryName + "/" + libraryDirectory + "/style/" + specifier.imported.name + "." + ref.opts.style)));
              }
            }
          });

          // 一个节点替换成多个
          path.replaceWithMultiple(declarationNodes);
        }
      }
    }
  };
};