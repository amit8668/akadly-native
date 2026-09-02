# Akadly (native) - desktop wrapper

Electron wrapper around the built `dist/` output of the Vite app in the
project root. Same approach as the Akadly (BIPES-fork) desktop app - see
that project's `BUILD.md` for the full rationale (local static server to
avoid `file://` fetch restrictions, serial/Bluetooth permission handling,
the custom device picker). One difference: because this project is a Vite
app (bare module imports like `blockly/core` only resolve through Vite's
bundler), the desktop app serves the **built** output, not raw source.

## Building

```
# from the project root
npm install
npm run build          # produces ../dist

cd desktop
npm install
npm start                # run unpacked, for testing
npm run dist:win          # Windows installer
npm run dist:linux        # Linux AppImage + .deb
```

If you see `Cannot create symbolic link` errors from `winCodeSign` during
`dist:win`, that's electron-builder trying to prepare macOS code-signing
tools we don't need - it doesn't block packaging itself (a complete
unpacked app still lands in `dist-electron/win-unpacked/`), only the NSIS
installer step. Enable Windows Developer Mode or run from an Administrator
terminal to get past it and produce the actual installer.

Linux builds need Linux packaging tools, so `dist:linux` won't work
directly from Windows without WSL/Docker - the project's GitHub Actions
workflow (`.github/workflows/build-desktop.yml`) builds both platforms
automatically on push.
