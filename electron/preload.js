const { contextBridge, ipcRenderer } = require("electron")

// Expõe métodos protegidos que permitem ao processo de renderização usar
// o ipcRenderer sem expor o objeto inteiro
contextBridge.exposeInMainWorld("electron", {
  invoke: (channel, data) => {
    // Lista branca de canais
    const validChannels = ["save-data", "load-data"]
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, data)
    }
  },
})

