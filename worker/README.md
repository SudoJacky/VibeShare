# Cloudflare Worker Runtime
<!-- vibeshare-module-fingerprint: sha256:0948e0df5ac24c490afeecebe7efa4b3c07df6a56d61b506464920a39c4d5581 -->

`worker` 是 Vinext 应用在 Cloudflare Workers 上的请求入口，负责平台专属的图片优化分支，并把其他请求交给 App Router。

## 请求流程

1. `/_vinext/image` 请求进入图片优化器。
2. 原始资源通过 `ASSETS` binding 获取，图片变换通过 `IMAGES` binding 执行。
3. 允许的宽度仅来自 Vinext 的默认设备与图片尺寸列表。
4. 其他路径原样交给 `vinext/server/app-router-entry`。

## 不变量

- Worker 环境必须提供 `ASSETS` 和 `IMAGES` binding。
- 图片优化只接受预先允许的宽度，不能把任意变换参数直接传给 Cloudflare Images。
- SVG 默认绕过优化端点；若以后允许 SVG，必须同时配置并保留对应安全响应头。
- 非图片请求不得在 Worker 层复制 App Router 的路由逻辑。
