// Este serviço lida com a persistência de dados usando o IPC do Electron
// Em um aplicativo Electron real, isso se comunicaria com o processo principal

// Para desenvolvimento/preview no Next.js, usaremos localStorage como fallback
const isElectron = typeof window !== "undefined" && window.process?.type === "renderer"

export async function saveData<T>(key: string, data: T): Promise<void> {
  if (isElectron) {
    // Em um aplicativo Electron real, isso usaria IPC para se comunicar com o processo principal
    // window.electron.invoke('save-data', { key, data })
    console.log(`Salvando dados ${key} via IPC do Electron (simulado)`)
    localStorage.setItem(`duzzi_${key}`, JSON.stringify(data))
  } else {
    // Fallback para localStorage para desenvolvimento/preview
    localStorage.setItem(`duzzi_${key}`, JSON.stringify(data))
  }
}

export async function loadData<T>(key: string, defaultValue: T): Promise<T> {
  if (isElectron) {
    // Em um aplicativo Electron real, isso usaria IPC para se comunicar com o processo principal
    // const result = await window.electron.invoke('load-data', { key })
    // return result || defaultValue
    console.log(`Carregando dados ${key} via IPC do Electron (simulado)`)
    const data = localStorage.getItem(`duzzi_${key}`)
    return data ? JSON.parse(data) : defaultValue
  } else {
    // Fallback para localStorage para desenvolvimento/preview
    const data = localStorage.getItem(`duzzi_${key}`)
    return data ? JSON.parse(data) : defaultValue
  }
}

