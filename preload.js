const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld('electronAPI',{
    closeWindow:()=>ipcRenderer.send('close-window'),
    captureScreen:()=>ipcRenderer.invoke('capture-screen'),
    saveImage:(dataUrl)=>ipcRenderer.invoke('save-image',dataUrl),
    onTriggerCapture: (callback) => ipcRenderer.on('trigger-capture', () => callback())
})