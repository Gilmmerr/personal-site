---
title: MV3 插件踩坑：Service Worker、跨域与 Canvas 转 PNG
date: 2026-10-27
tags: Chrome 扩展, 调试
summary: 写图片下载插件时踩到的五个坑，每一个都能让功能「看起来正常但结果不对」。
---

Manifest V3 把 background 从常驻页面换成了 Service Worker，很多写法就跟着变了。下面五个坑都是我在图片提取插件里真实撞到的，按踩到的顺序写。

## 一、Service Worker 会休眠，内存变量靠不住

MV3 的 background 空闲几十秒就会被回收。把采集结果存在模块级变量里，用户切个标签页回来就没了。

```js
// 错：重启就丢
let collected = []

// 对：放 storage.session
await chrome.storage.session.set({ collected })
const { collected } = await chrome.storage.session.get('collected')
```

`storage.session` 在浏览器会话内有效，正好符合「这次采集的结果」这个生命周期。

## 二、Service Worker 里没有 URL.createObjectURL

预览页要把图片转成 PNG 再交给下载接口，很自然会想在 background 里创建 blob URL——那里没有 DOM，也就没有 `URL.createObjectURL`。

正确做法是**在预览页创建 blob URL，把字符串传给 background**：

```js
// gallery.js（有 DOM 的页面）
const blob = await canvas.convertToBlob({ type: 'image/png' })
const url = URL.createObjectURL(blob)
await chrome.runtime.sendMessage({ type: 'download', url, filename })
```

注意这个 URL 的作用域绑定在创建它的页面。预览页一关，URL 就失效，所以下载要在页面还活着的时候发起。

## 三、chrome.downloads 不会帮你转格式

这是最隐蔽的一个。把 jpg 的地址传给 `chrome.downloads.download` 并指定 `.png` 文件名，下载下来确实是 `.png`——但里面还是 jpg 的字节，双击打不开。

```js
// 只是改了扩展名
chrome.downloads.download({ url: jpgUrl, filename: 'image.png' })
```

真正的转换必须在 Canvas 里做：

```js
const bitmap = await createImageBitmap(blob)
const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
const ctx = canvas.getContext('2d')
ctx.fillStyle = '#ffffff' // 透明底必须填白，否则变黑
ctx.fillRect(0, 0, canvas.width, canvas.height)
ctx.drawImage(bitmap, 0, 0)
const png = await canvas.convertToBlob({ type: 'image/png' })
bitmap.close() // 大图不释放会 OOM
```

两个细节：`fillRect` 那一步不能省，PNG 透明区域在部分查看器里会渲染成黑色；`bitmap.close()` 也要调，批量处理几十张大图时内存涨得很快。

## 四、跨域：先把权限写够

扩展页 `fetch` 图片不受 CORS 限制的前提是 `host_permissions` 覆盖了目标域名。只写站点域名不够，图片在 CDN 上：

```json
"host_permissions": [
  "https://*.alicdn.com/*",
  "https://*.360buyimg.com/*",
  "https://*.pddpic.com/*"
]
```

漏了 CDN，表现是预览页图片一片裂开，控制台报 `net::ERR_BLOCKED_BY_CLIENT` 或 403，很容易误判成防盗链。

## 五、防盗链挡的是 Referer，不是 IP

有些 CDN 校验 `Referer`。展示层加一行就能过：

```html
<img src="..." referrerpolicy="no-referrer">
```

取字节时如果还是 403，就得在请求头层面处理（`declarativeNetRequest` 改 Referer），或者退回页面上下文用 `XMLHttpRequest` 发请求——页面自己的 Referer 通常是被允许的。

## 小结

这五个坑有个共同点：**都不会报错**。功能看着跑通了，结果是丢数据、坏文件、裂图。所以写完一定要验证产物本身——下载下来的图能不能打开、尺寸对不对、数量对不对——而不是看控制台有没有红字。
