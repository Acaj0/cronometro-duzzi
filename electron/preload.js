const { contextBridge, ipcRenderer } = require("electron")

// Expõe métodos protegidos que permitem ao processo de renderização usar
// o ipcRenderer sem expor o objeto inteiro
contextBridge.exposeInMainWorld("electron", {
  // Métodos existentes
  invoke: (channel, data) => {
    // Lista branca de canais
    const validChannels = ["save-data", "load-data", "detach-timers", "update-timers"]
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, data)
    }
  },

  // Novos métodos para funcionalidade de destacar timers
  detachTimers: (timers) => {
    return ipcRenderer.invoke("detach-timers", timers)
  },

  isTimerWindow: () => {
    // Verificar se a URL tem o parâmetro timerWindow=true
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get("timerWindow") === "true"
  },

  onTimerUpdate: (callback) => {
    const listener = (_, data) => callback(data)
    ipcRenderer.on("timers-updated", listener)
    return () => {
      ipcRenderer.removeListener("timers-updated", listener)
    }
  },

  onInitTimerWindow: (callback) => {
    const listener = (_, data) => callback(data)
    ipcRenderer.on("init-timer-window", listener)
    return () => {
      ipcRenderer.removeListener("init-timer-window", listener)
    }
  },

  onTimerWindowClosed: (callback) => {
    const listener = () => callback()
    ipcRenderer.on("timer-window-closed", listener)
    return () => {
      ipcRenderer.removeListener("timer-window-closed", listener)
    }
  },

  updateTimers: (timers) => {
    return ipcRenderer.invoke("update-timers", timers)
  },
})

