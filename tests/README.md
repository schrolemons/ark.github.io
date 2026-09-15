# 验证

- `node --test tests/hash-route.test.mjs`：链接分段、英文空格、中文编码、非法输入、分页与选项往返。需要支持直接运行 TypeScript 的 Node.js（22.18+ 或 24+）。
- `npm run build`：Astro 类型检查与静态构建。
- `node tests/browser-smoke.mjs`：使用 Playwright 和本机 Edge，无头检查人物、翻页、八种粒子、剪贴板、刷新、浏览器后退、画廊键盘与手机截图。先启动 `npm run dev -- --host 127.0.0.1`。

浏览器脚本默认从 `playwright` 包加载；也可把 `PLAYWRIGHT_MODULE` 设置为已有 Playwright `index.mjs` 的 `file:///` URL。`TEST_URL` 可指定测试服务器，默认 `http://127.0.0.1:4321/`。截图输出到忽略提交的 `.screens/`。

## 链接示例

- `#operator/lifeng`
- `#world/CIV_DB`
- `#world?page=2`
- `#media/web_modules`
- `#media/visual_archive/Starry_Sky`
- `#information/events?slide=The_Ninth_World`

有英文名称或 ID 时优先使用英文，空格替换为下划线。轮播自动前进使用替换历史记录，避免每次自动切图都增加一条后退记录。
