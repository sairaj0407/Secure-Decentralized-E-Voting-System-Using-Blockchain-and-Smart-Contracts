const { contextBridge, ipcRenderer } = require("electron");

// Expose safe, context-isolated Electron APIs to React UI renderer
contextBridge.exposeInMainWorld("electronAPI", {
    getAppInfo: () => ipcRenderer.invoke("get-app-info"),
    getServiceLogs: (service) => ipcRenderer.invoke("get-service-logs", service),
    restartServices: () => ipcRenderer.invoke("restart-services"),
    getDiagnostics: () => ipcRenderer.invoke("get-diagnostics"),
    openLogFolder: () => ipcRenderer.invoke("open-log-folder"),
    exitApp: () => ipcRenderer.invoke("exit-app")
});
