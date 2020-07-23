const type = require("babel-types");
module.exports = function ({ types: type }) {
  return {
    visitor: {
      ImportDeclaration(path, ref = { opts: {} }) {
        const specifiers = path.node.specifiers;
        const source = path.node.source;
        const libraryName = source.value;
        const component_reg = /^-\/components/;
        const is_component = component_reg.test(libraryName);
        if (
          is_component &&
          specifiers.find((specifier) => type.isImportSpecifier(specifier))
        ) {
          const declarationNodes = [];

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
                    ref.opts.business.some((x) => x === specifier.imported.name)
                      ? `-/component/business/${specifier.imported.name}`
                      : `-/component${ref.opts.modulePath.replace(
                          "{moduleName}",
                          specifier.imported.name
                        )}`
                  )
                )
              );
            }
          });
          // 一个节点替换成多个
          path.replaceWithMultiple(declarationNodes);
        }
      },
    },
  };
};
