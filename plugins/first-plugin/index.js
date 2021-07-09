const type = require("babel-types");
module.exports = function ({ types: type }) {
  return {
    visitor: {
      ImportDeclaration(path, ref = { opts: {} }) {
        // ref.opts 可以拿到.babelrc里面配置的字段
        const specifiers = path.node.specifiers;
        const source = path.node.source;
        const libraryName = source.value;
        const getFileName = ref.opts.libraryDirectory;
        const libraryDirectory =
          typeof getFileName === "undefined" ? "lib" : getFileName;

        const declarationNodes = [];

        if (libraryName === ref.opts.libraryName) {
          specifiers.forEach((specifier) => {
            if (!type.isImportDefaultSpecifier(specifier)) {
              // 是否使用别名
              declarationNodes.push(
                type.importDeclaration(
                  // 判断是否使用别名
                  specifier.imported.name == specifier.local.name
                    ? [type.importDefaultSpecifier(specifier.imported)]
                    : [
                        type.importSpecifier(
                          specifier.local,
                          type.identifier("default")
                        ),
                      ],
                  type.stringLiteral(
                    `${libraryName}/${libraryDirectory}/${specifier.imported.name}`
                  )
                )
              );
              // 添加样式
              if (ref.opts.style) {
                declarationNodes.push(
                  type.importDeclaration(
                    [],
                    type.stringLiteral(
                      `${libraryName}/${libraryDirectory}/style/${specifier.imported.name}.${ref.opts.style}`
                    )
                  )
                );
              }
            }
          });

          // 一个节点替换成多个
          path.replaceWithMultiple(declarationNodes);
        }
      },
    },
  };
};
