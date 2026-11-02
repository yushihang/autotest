# 站点

无框架、无构建步骤、无 CDN、无外链字体的静态站。直接读 `index.html`，样式与模块都按纯 HTML / CSS / ES Module 加载。

## 本地预览

在仓库根目录运行：

```bash
python3 -m http.server -d site
```

然后打开 <http://localhost:8000/>。

请用本地服务器预览，不要直接双击 `index.html`：脚本里的动态 `import()` 在 `file://` 协议下会被浏览器拦截。

## 目录说明

```text
site/
├── index.html          # 唯一页面：页头目录、十二个 section、页脚
├── styles.css          # 设计 token 与全站骨架样式
├── content/
│   └── copy.md         # 全站唯一文案来源（区块 id、标题、结论以它为准）
├── css/
│   └── <id>.css        # 每个区块自己的样式，目前只有一行占位注释
└── js/
    ├── main.js         # 入场效果 + 动态加载各区块模块
    └── <id>.js         # 每个区块自己的交互模块，导出 init(root)
```

`<id>` 为 `opening`、`web2`、`web3`、`wallet`、`tx`、`contract`、`cost`、`safety`、`did`、`vc`、`didflow`、`closing`。

## 新增或填充一个区块

1. 先改 `content/copy.md`，确定区块 id、标题与一句话结论；id 一旦发布不再改名。
2. 在 `index.html` 的 `<main>` 中按顺序添加 `<section id="<id>">`，并保留成对注释：
   `<!-- section:<id>:start -->` 与 `<!-- section:<id>:end -->`。section 内的标题与结论直接取自 `copy.md`。
3. 新建 `css/<id>.css` 与 `js/<id>.js`，并在 `<head>`、`js/main.js` 的 `SECTION_MODULES` 里登记（`index.html` 的目录导航也要加一项）。
4. 模块统一导出 `export function init(root) {}`，`root` 是对应的 `<section>` 元素；模块内部只操作自己的区块。
5. 颜色、字号、间距、圆角、阴影、阅读宽度一律引用 `styles.css` 中 `:root` 的 CSS 变量，不在区块样式里写死颜色。
6. 新样式和新模块必须能被安全加载：文件缺失或模块报错时，页面静态内容仍要完整可读。

## 约定

- 正文 17px、行高 1.8，单行不超过约 40 个汉字（由 `--measure` 控制）。
- 375 / 768 / 1280 三档都不出现横向滚动；所有可聚焦元素保留可见的 `:focus-visible` 样式。
- 系统开启「减少动态效果」时不播放任何进入视口动画。
- 不引入框架、构建工具、CDN 资源或外链字体。
