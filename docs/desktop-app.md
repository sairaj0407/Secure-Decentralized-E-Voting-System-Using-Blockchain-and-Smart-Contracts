# Electron Desktop Integration

The web application is converted into a native desktop container using Electron, utilizing context isolation to secure file system structures and IPC messaging bridges.

## 1. Security Configuration

Desktop security constraints are enforced inside [`main.cjs`](file:///d:/Secure%20Decentralized%20E-Voting%20System%20Using%20Blockchain%20and%20Smart%20Contracts/frontend/main.cjs):
* **`contextIsolation: true`**: Isolates the main Electron backend context from the React UI context.
* **`nodeIntegration: false`**: Disables direct access to Node.js native APIs (such as `child_process`, `fs`, `require`) inside the React UI renderer threads.
* **Preload Bridging:** Uses [`preload.cjs`](file:///d:/Secure%20Decentralized%20E-Voting%20System%20Using%20Blockchain%20and%20Smart%20Contracts/frontend/preload.cjs) to define explicit, safe IPC APIs exposed under a global `window.electronAPI` bridge object.

---

## 2. Programmatic Build Wrapper

To resolve EPERM rename locking issues caused by Windows Defender and system indexers scanning newly unpacked folders inside `dist-desktop`, a programmatic build wrapper script is configured:
* **Script:** [`build-desktop.cjs`](file:///d:/Secure%20Decentralized%20E-Voting%20System%20Using%20Blockchain%20and%20Smart%20Contracts/frontend/build-desktop.cjs)
* **Functionality:**
  * Monkey-patches `fs.promises.rename` and `fs.rename` before invoking `electron-builder`.
  * If a file-lock `EPERM` exception is caught during directory compression, intercepts it, displays a diagnostic log, waits 1 second for system locks to release, and retries up to 15 times before failing.
  * Successfully outputs the NSIS standalone installer `.exe`.
