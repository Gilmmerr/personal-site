---
title: 图片 403 的三层排查法
date: 2026-10-20
tags: 调试, 跨域
summary: 裂图、403、下载失败看着像同一个问题，其实是三层不同的故障，混在一起查只会越改越乱。
---

抓页面图片时最容易被绕住的一类问题：图片在页面上看得见，一进到自己的预览页就裂了；或者能显示但下载失败；或者下载下来打不开。表面都是「图片不对」，实际坏在不同的层。

## 先分层，再动手

| 现象 | 出问题的层 | 先查什么 |
|---|---|---|
| 预览页全裂，原页面正常 | 展示层 | Referer 校验、CSP |
| 预览能看，下载 403 | 取字节层 | host_permissions、请求头 |
| 下载得到文件但打不开 | 转码层 | 是否真的重新编码过 |
| 部分图裂、部分正常 | 数据层 | URL 归一化、懒加载属性 |

先看现象落在哪一行，再动手。跳过这一步，很容易出现「为了修 403 把下载逻辑改了一遍」这种事。

## 第一层：展示层

最常见的原因是 CDN 校验 `Referer`。浏览器在跨站请求图片时会带上来源页地址，CDN 发现不是自家域名就返回 403。

最低成本的解法是在标签上加属性：

```html
<img src="https://img.alicdn.com/xxx.jpg" referrerpolicy="no-referrer" />
```

这一行只影响展示，不解决下载。而且它对某些「连空 Referer 都拒绝」的 CDN 无效，那就得看下一层。

## 第二层：取字节层

浏览器扩展里 `fetch` 图片，能不能绕开 CORS 取决于 `host_permissions`：

```json
"host_permissions": ["https://*.alicdn.com/*"]
```

**权限要写到 CDN 域名，写站点域名没用**——图片根本不在站点服务器上。漏配的典型表现是控制台出现 `ERR_BLOCKED_BY_CLIENT`，容易误判成防盗链。

如果权限配好了还是 403，说明对方要求一个「合法的 Referer」。两条路：

1. 用 `declarativeNetRequest` 在请求头里改 Referer；
2. 退回页面上下文，用页面自己的 `XMLHttpRequest` 取——页面的 Referer 天然是合法的。

方案 2 更稳但受页面 CSP 限制，方案 1 更干净但要额外声明权限。我一般先用 2 验证，确认有效再换 1。

## 第三层：转码层

这一层的问题最隐蔽：文件下载成功了，大小也对，就是打不开。

原因是 `chrome.downloads.download` 只负责下载，**不会转码**。把 jpg 的 URL 存成 `.png` 只是改了扩展名。

真正的转换要做三件事：

```js
const bitmap = await createImageBitmap(blob)
const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
const ctx = canvas.getContext('2d')
ctx.fillStyle = '#ffffff'      // 透明底填白，否则变黑
ctx.fillRect(0, 0, canvas.width, canvas.height)
ctx.drawImage(bitmap, 0, 0)
const png = await canvas.convertToBlob({ type: 'image/png' })
bitmap.close()                  // 及时释放，批量处理容易 OOM
```

验证方式很简单：下载一张图，用图片查看器打开，看文件头是不是 PNG。别只看文件名。

## 顺带一个数据层的问题

「部分图裂、部分正常」通常是同一个原因的不同表现：URL 没归一化。

同一张主图在页面里可能有多个尺寸：

```
https://img.alicdn.com/imgextra/i1/xxx_100x100.jpg
https://img.alicdn.com/imgextra/i1/xxx_800x800Q90.jpg
https://img.alicdn.com/imgextra/i1/xxx.jpg
```

抓的时候三条都进了列表，去重失败，还混进一堆缩略图。做法是剥离尺寸后缀再比较：

```js
const normalize = (url) =>
  url.replace(/_\d+x\d+(Q\d+)?\.(jpg|png|webp)$/i, '.$2')
     .replace(/\/s\d+x\d+_jfs\//, '/jfs/')
```

不同 CDN 规则不同，但思路一致：**先归一化，再判断是否重复**。

## 一点经验

排查这类问题，最有效的一步是「先定位到层」，而不是先想解法。想解法的时候你会同时改三个地方，改完不知道哪一步起了作用；定位到层之后，每次只动一处，结果就是确定的。
