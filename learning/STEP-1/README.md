## STEP - 1

在写 babel 插件之前，首先得了解一下这个东西是干森么的。

我来贴一句官方的解释：

`Babel 是一个工具链，主要用于将采用 ECMAScript 2015+ 语法编写的代码转换为向后兼容的 JavaScript 语法，以便能够运行在当前和旧版本的浏览器或其他环境中。`

也就是说我们现在写的代码，如果不做语法转换的话，很多浏览器根本就不支持，这里 babel 作为一个好帮手，主动的帮我们解决了这个问题，让你写的代码，在大部分主流浏览器中得以呈现。

以下有几项重要概念需要我们作为前置基础掌握：

### 1 - Presets (预设)

上面不是说如果你写的代码不经过 babel 插件的转换，很多浏览器都莫法跑嘛。 那我们想一想：

如果我使用的 es6,es7.... 的语法，我希望我的编译后的代码都转化成 es5 的代码 (还不是为了让浏览器兼容)，那这里得使用一种 babel 插件来做这个事情吧。

如果我的项目是用 typeScript 来写的，我希望我转化出来的代码还是 js(js 亲儿子，虽然你只是穿了层 ts 的外衣，但你爹[浏览器]他就是不认你，气不气？)

如果我项目是用 react 来写的， 我也需要将一些 react 特殊的语法 转化为 es5 的代码。

等等。。

这时候，我们就需要提供一些预设，这些预设其实可以被看作是一组 babel 插件集合，帮你来处理上述那一系列问题。

来看看，我们常用的预设：

```
@babel/preset-env   // 我就是为转化成 ES2015而生的。

@babel/preset-typescript  // 我是为转化 typescript而生。

@babel/preset-react  // 我是转化react 而生的。
```

现在大概对这个【预设】有一定了解了吧。

通常我们使用 预设 [Presets]时，我们是写到一个数组里面。

```
{
  "presets": ["@babel/preset-env"，"@babel/preset-typescript"]
}
```

同样，创建一个预设也十分简单：

```
module.exports = () => ({
  presets: ["env"], // 这个就是预设了
});

// 其实你除了env，还会经常看到: es2015, es2016 等等
// babel-preset-env 与 babel-preset-latest
// （或者  babel-preset-es2015，babel-preset-es2016 和 babel-preset-es2017 全部）

```

你可能还会看到类似这种代码:

```
  {
    "presets": [
      "react",
      "stage-2"
    ]
  }
```

这个`stage-2`就是一些提案，正在通过 TC39ECMAScript 标准背后的技术委员会）的流程成为标准的一部分。

这个流程分为 5（0－4）个阶段。 随着提案得到越多的关注就越有可能被标准采纳，于是他们就继续通过各个阶段，最终在阶段 4 被标准正式采纳。

以上每种预设都依赖于紧随的后期阶段预设。例如，babel-preset-stage-1 依赖于 babel-preset-stage-2，后者又依赖 于 babel-preset-stage-3。

在讲一下预设的顺序问题：

```
{
  "presets": ["a", "b", "c"]
}
```

将按如下顺序执行： c、b 然后是 a。

### 2- Polyfill

在上述中我们已经知道了 babel 可以做语法转换，比如将 ES6 转化成 ES5, 但我们看下面这种情况:

```
function addAll() {
  return Array.from(arguments).reduce((a, b) => a + b);
}


转化后：

function addAll() {
  return Array.from(arguments).reduce(function(a, b) {
    return a + b;
  });
}
```

然后，不是所有`javascript`环境都支持`Array.from`的。转换完了都还不支持，这时候就需要 `Polyfill` 闪亮登场了。

但这个东西有个很大的问题，`babel-polyfill`通过向`全局对象和内置对象`的`prototype`上添加方法来实现的。这造成全局空间污染。而且引入的是一个全量的包，打包出来单个 js 体积会很大。

其实`babel-polyfill`还有他的兄弟: `babel-runtime`, `babel-plugin-transform-runtime`,这两个主要是就是为了解决`Polyfill`按需加载的问题。这里仅做了解。

https://astexplorer.net/

https://github.com/jamiebuilds/babel-handbook/blob/master/translations/zh-Hans/plugin-handbook.md#toc-asts

https://github.com/jamiebuilds/babel-handbook/blob/master/translations/zh-Hans/user-handbook.md#toc-babel-polyfill

https://github.com/babel/website/blob/main/docs/types.md

https://github.com/babel/babel/blob/master/packages/babel-parser/ast/spec.md#node-objects
