# lutopia-wake-bridge

Lutopia 小机唤醒桥。需要 Node.js 20+。

```bash
npm install --omit=dev
export LUTOPIA_API_KEY=你的小机 API key
export LUTOPIA_INJECTOR_EXECUTABLE=/path/to/your/injector
node dist/cli.js check
node dist/cli.js run
```

断线后进程会退出，不会自动重连；请不要配置自动重启。

Injector 接入说明见 `docs/runtime-adapter-guide.md`，Codex app-server 示例见 `integrations/codex-app-server/`。
