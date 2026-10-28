---
title: 静态站部署，为什么我最后选了 HashRouter
date: 2026-10-28
tags: 前端工程, 部署
summary: 刷新就 404、子路径部署白屏——这两个问题都能靠一个路由模式的选择消掉，代价只是 URL 里多一个井号。
---

个人网站上线后第一件事通常是发给别人看。然后就会收到一句：「你发的那个链接打不开，白屏。」

这是单页应用部署在纯静态托管上的典型问题，而且和你写得好不好没关系。

## 问题从哪来

单页应用只有一个 `index.html`，`/blog/xxx` 这种路径在前端是路由，在服务器上却是「去找一个不存在的文件」。用户直接在地址栏回车，或者刷新页面，服务器返回 404。

## 三种解法

| 方案 | 做法 | 代价 |
|---|---|---|
| 服务端 rewrite | 配置所有路径回落到 `index.html` | 每个平台配置都不一样，换平台要重配 |
| BrowserRouter + 404 hack | 复制 `index.html` 为 `404.html` | 需要构建后处理，且回落后 URL 语义混乱 |
| HashRouter | 路由放在 `#` 后面，服务器只请求 `/` | URL 里带一个 `#` |

我选了第三种。原因很直接：这个站点不需要 SEO 友好的路径，也不需要被别人以「深链接」的方式引用到具体文章以外的地方。

## HashRouter 解决了什么

服务器眼里，`https://example.com/#/blog/mv3-extension-notes` 就是请求 `https://example.com/`，永远命中 `index.html`。所以：

- 刷新不 404；
- 直接粘贴链接给别人，对方能打开；
- 部署到任意子路径（比如 `https://example.com/portfolio/`）也能跑；
- 换托管平台不用改任何配置。

配合 Vite 的 `base: './'`，产物里所有资源都是相对路径，连子目录都不用管：

```ts
export default defineConfig({
  base: './',
  build: { outDir: 'dist' },
})
```

## 代价是什么

**URL 里多一个 `#`。** 有些场合不希望看到它，比如要对外宣传的落地页、或者需要搜索引擎收录的内容页。

还有一个更实际的坑：**页面内的锚点跳转会失效**。传统写法 `<a href="#section">` 在 HashRouter 下会被当成一次路由跳转，直接把页面导航到 `/section`，报 404。

解决办法是放弃 `href="#id"`，改用方法调用：

```tsx
<button onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })}>
  跳到章节
</button>
```

配合标题上的 `scroll-margin-top`，滚动后不会被吸顶导航挡住：

```css
.prose h2 { scroll-margin-top: 7rem; }
```

我的博客目录就是这么实现的——看起来是锚点跳转，实际一次路由都没触发。

## 什么时候别用

需要满足下面任一条，就老老实实用 BrowserRouter 加 rewrite：

- 页面要被搜索引擎收录，且路径要干净；
- 需要对外的短链接（`/p/abc` 比 `/#/p/abc` 好看）；
- 已经有一套成熟的部署流程，配置 rewrite 不构成负担。

换句话说，HashRouter 是**在「部署配置成本」和「URL 美观度」之间选了前者**。个人站、内部工具、原型演示，这个交换通常划算；对外产品则相反。

## 小结

路由模式不是风格偏好，是部署方式的约束。先确定「托管在哪、能不能配 rewrite」，再决定用哪个路由——顺序反了，就要在上线前一晚改全局代码。
