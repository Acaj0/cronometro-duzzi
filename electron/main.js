const { app, BrowserWindow, ipcMain, protocol } = require("electron")
const path = require("path")
const fs = require("fs")
const isDev = process.env.NODE_ENV === "development"

const userDataPath = app.getPath("userData")
const dataPath = path.join(userDataPath, "data")

// Ensure data directory exists
if (!fs.existsSync(dataPath)) {
  fs.mkdirSync(dataPath, { recursive: true })
}

let mainWindow = null
let splashWindow = null
let timerWindow = null

// Register protocol for serving local files
function registerLocalResourceProtocol() {
  protocol.registerFileProtocol("app", (request, callback) => {
    const url = request.url.replace("app://", "")
    try {
      return callback(path.join(__dirname, "renderer", url))
    } catch (error) {
      console.error("ERROR:", error)
      return callback(404)
    }
  })
}

function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 500,
    height: 400,
    transparent: false,
    frame: false,
    resizable: false,
    center: true,
    alwaysOnTop: true,
    autoHideMenuBar: true,
    icon: path.join(__dirname, "assets", "icon.ico"), // Usando o ícone .ico na pasta assets

    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  splashWindow.loadFile(path.join(__dirname, "splash.html"))
  splashWindow.on("closed", () => (splashWindow = null))
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    icon: path.join(__dirname, "assets", "icon.ico"), // Usando o ícone .ico na pasta assets
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
      webSecurity: false, // Allows loading local resources
    },
  })

  // Load the Next.js app in Electron
  const appURL = isDev ? "http://localhost:3001" : `file://${path.join(__dirname, "renderer/index.html")}`

  console.log(`Loading app from: ${appURL}`)
  mainWindow.loadURL(appURL)

  mainWindow.webContents.on("did-finish-load", () => {
    if (splashWindow) splashWindow.close()
    mainWindow.show()
    console.log("Main window loaded successfully")
  })

  mainWindow.webContents.on("did-fail-load", (event, errorCode, errorDescription) => {
    console.error(`Failed to load: ${errorDescription} (${errorCode})`)

    // Retry loading after a short delay
    setTimeout(() => {
      console.log("Retrying to load the app...")
      if (mainWindow) mainWindow.loadURL(appURL)
    }, 1000)
  })

  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on("closed", () => {
    mainWindow = null
  })
}

// Função para criar a janela de timers destacada
function createTimerWindow(timers) {
  // Fechar janela existente se houver
  if (timerWindow) {
    timerWindow.close()
    timerWindow = null
  }

  timerWindow = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    icon: path.join(__dirname, "assets", "icon.ico"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
      webSecurity: false,
    },
  })

  // Carregar a mesma URL que a janela principal, mas com um parâmetro para indicar que é a janela de timers
  const appURL = isDev
    ? "http://localhost:3001?timerWindow=true"
    : `file://${path.join(__dirname, "renderer/index.html?timerWindow=true")}`

  timerWindow.loadURL(appURL)

  // Quando a janela carregar, enviar os timers atuais
  timerWindow.webContents.on("did-finish-load", () => {
    timerWindow.webContents.send("init-timer-window", {
      timers,
      // Você pode adicionar mais dados aqui se necessário
      windowTitle: "Monitoramento de Cronômetros",
    })
    console.log("Timer window loaded successfully")

    // Definir o título da janela
    timerWindow.setTitle("Monitoramento de Cronômetros")
  })

  timerWindow.on("closed", () => {
    timerWindow = null
    // Notificar a janela principal que a janela de timers foi fechada
    if (mainWindow) {
      mainWindow.webContents.send("timer-window-closed")
    }
  })

  return timerWindow
}

// Create window when Electron is ready
app.whenReady().then(() => {
  console.log("Electron app is ready")

  // Register protocol
  if (!isDev) {
    registerLocalResourceProtocol()
  }

  createSplashWindow()
  createMainWindow()

  app.on("activate", () => {
    if (mainWindow === null) createMainWindow()
  })
})

// Quit when all windows are closed
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit()
})

// Handle IPC messages for data persistence
ipcMain.handle("save-data", async (event, { key, data }) => {
  try {
    const filePath = path.join(dataPath, `${key}.json`)
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error(`Error saving data for ${key}:`, error)
    return false
  }
})

ipcMain.handle("load-data", async (event, { key }) => {
  try {
    const filePath = path.join(dataPath, `${key}.json`)
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf8")
      return JSON.parse(data)
    }
    return null
  } catch (error) {
    console.error(`Error loading data for ${key}:`, error)
    return null
  }
})

// Manipular solicitação para destacar timers
ipcMain.handle("detach-timers", async (event, timers) => {
  try {
    const window = createTimerWindow(timers)
    return { success: true }
  } catch (error) {
    console.error("Error creating timer window:", error)
    return { success: false, error: error.message }
  }
})

// Manipular atualização de timers
ipcMain.handle("update-timers", async (event, timers) => {
  try {
    // Enviar atualização para a janela de timers se existir
    if (timerWindow && !timerWindow.isDestroyed()) {
      timerWindow.webContents.send("timers-updated", timers)
    }
    return { success: true }
  } catch (error) {
    console.error("Error updating timers:", error)
    return { success: false, error: error.message }
  }
})

