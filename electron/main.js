const { app, BrowserWindow, ipcMain, protocol } = require("electron");
const path = require("path");
const fs = require("fs");
const isDev = process.env.NODE_ENV === "development";

const userDataPath = app.getPath("userData");
const dataPath = path.join(userDataPath, "data");

// Garante que o diretório de dados exista
if (!fs.existsSync(dataPath)) {
  fs.mkdirSync(dataPath, { recursive: true });
}

let mainWindow = null;
let splashWindow = null;
let timerWindow = null;
let timers = [];

// Registro de protocolo para arquivos locais
function registerLocalResourceProtocol() {
  protocol.registerFileProtocol("app", (request, callback) => {
    const url = request.url.replace("app://", "");
    try {
      return callback(path.join(__dirname, "renderer", url));
    } catch (error) {
      console.error("ERROR:", error);
      return callback(404);
    }
  });
}

function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 500,
    height: 400,
    frame: false,
    resizable: false,
    center: true,
    alwaysOnTop: true,
    autoHideMenuBar: true,
    icon: path.join(__dirname, "assets", "icon.ico"),
    webPreferences: { nodeIntegration: false, contextIsolation: true },
  });

  splashWindow.loadFile(path.join(__dirname, "splash.html"));
  splashWindow.on("closed", () => (splashWindow = null));
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    icon: path.join(__dirname, "assets", "icon.ico"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
      webSecurity: false,
    },
  });

  const appURL = isDev ? "http://localhost:3001" : `file://${path.join(__dirname, "renderer/index.html")}`;
  mainWindow.loadURL(appURL);

  mainWindow.webContents.on("did-finish-load", () => {
    if (splashWindow) splashWindow.close();
    mainWindow.show();
  });

  mainWindow.on("closed", () => (mainWindow = null));
}

// Criação da janela de timers destacados
function createTimerWindow() {
  if (timerWindow) {
    return; // Se a janela já existir, não cria outra
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
  });

  const appURL = isDev
    ? "http://localhost:3001?timerWindow=true"
    : `file://${path.join(__dirname, "renderer/index.html?timerWindow=true")}`;

  timerWindow.loadURL(appURL);

  timerWindow.webContents.on("did-finish-load", () => {
    timerWindow.webContents.send("init-timer-window", { timers });
  });

  timerWindow.on("closed", () => {
    timerWindow = null;
    if (mainWindow) {
      mainWindow.webContents.send("timer-window-closed");
    }
  });

  return timerWindow;
}

// Sincroniza os timers entre as janelas
function syncWindows() {
  if (mainWindow) {
    mainWindow.webContents.send("timers-updated", timers);
  }
  if (timerWindow) {
    timerWindow.webContents.send("timers-updated", timers);
  }
}

app.whenReady().then(() => {
  if (!isDev) {
    registerLocalResourceProtocol();
  }

  createSplashWindow();
  createMainWindow();

  app.on("activate", () => {
    if (mainWindow === null) createMainWindow();
  });
});

// Fecha o app se todas as janelas forem fechadas
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// Manipula IPC para salvar e carregar dados
ipcMain.handle("save-data", async (event, { key, data }) => {
  try {
    const filePath = path.join(dataPath, `${key}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Erro ao salvar ${key}:`, error);
    return false;
  }
});

ipcMain.handle("load-data", async (event, { key }) => {
  try {
    const filePath = path.join(dataPath, `${key}.json`);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf8"));
    }
    return null;
  } catch (error) {
    console.error(`Erro ao carregar ${key}:`, error);
    return null;
  }
});

// Destacar os timers
ipcMain.handle("detach-timers", async (event, timersList) => {
  timers = timersList;
  if (!timerWindow) {
    createTimerWindow();
  }
  return { success: true };
});

// Atualiza os timers
ipcMain.handle("update-timers", async (event, timersList) => {
  timers = timersList;
  syncWindows();
  return { success: true };
});

// Remove um timer e sincroniza as janelas
ipcMain.on("stop-timer", (event, timerId) => {
  timers = timers.filter((t) => t.id !== timerId);
  syncWindows();
});
