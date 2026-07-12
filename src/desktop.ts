import path from "node:path";
import type { Server } from "node:http";
import {
  app as electronApp,
  BrowserWindow,
  dialog,
  Menu,
  shell
} from "electron";

const APP_NAME = "PrintVisual";
const LOOPBACK_HOST = "127.0.0.1";
const SERVER_CLOSE_TIMEOUT_MS = 10_000;

electronApp.setName(APP_NAME);

let appUrl: URL | null = null;
let localServer: Server | null = null;
let mainWindow: BrowserWindow | null = null;
let allowQuit = false;
let shutdownPromise: Promise<void> | null = null;

function isExternalHttpUrl(rawUrl: string): boolean {
  try {
    const url = new URL(rawUrl);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isAppUrl(rawUrl: string): boolean {
  if (!appUrl) return false;

  try {
    return new URL(rawUrl).origin === appUrl.origin;
  } catch {
    return false;
  }
}

async function startLocalServer(): Promise<URL> {
  const appRoot = electronApp.getAppPath();
  process.env.HOST = LOOPBACK_HOST;
  process.env.PUBLIC_DIR = path.join(appRoot, "public");
  process.env.DATA_DIR = electronApp.getPath("userData");

  const { createApp } = await import("./app.js");
  const expressApp = createApp();

  return new Promise<URL>((resolve, reject) => {
    const server = expressApp.listen(0, LOOPBACK_HOST);
    localServer = server;

    const onError = (error: Error): void => {
      server.off("listening", onListening);
      reject(error);
    };

    const onListening = (): void => {
      server.off("error", onError);
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Не удалось определить локальный порт PrintVisual."));
        return;
      }

      resolve(new URL(`http://${LOOPBACK_HOST}:${address.port}/`));
    };

    server.once("error", onError);
    server.once("listening", onListening);
  });
}

function openExternalUrl(rawUrl: string): void {
  if (!isExternalHttpUrl(rawUrl) || isAppUrl(rawUrl)) return;
  void shell.openExternal(rawUrl);
}

function createMainWindow(url: URL): BrowserWindow {
  const window = new BrowserWindow({
    title: APP_NAME,
    width: 1440,
    height: 900,
    minWidth: 960,
    minHeight: 640,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: "#111827",
    icon: path.join(electronApp.getAppPath(), "build", "icon.png"),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      devTools: true
    }
  });

  window.webContents.on("before-input-event", (event, input) => {
    const isDevToolsShortcut =
      input.type === "keyDown" &&
      input.control &&
      input.shift &&
      !input.alt &&
      !input.meta &&
      input.key.toLowerCase() === "i";

    if (!isDevToolsShortcut) return;
    event.preventDefault();
    window.webContents.toggleDevTools();
  });

  window.webContents.setWindowOpenHandler(({ url: targetUrl }) => {
    openExternalUrl(targetUrl);
    return { action: "deny" };
  });

  window.webContents.on("will-navigate", (event, targetUrl) => {
    if (isAppUrl(targetUrl)) return;
    event.preventDefault();
    openExternalUrl(targetUrl);
  });

  window.once("ready-to-show", () => window.show());
  window.on("closed", () => {
    if (mainWindow === window) mainWindow = null;
  });

  void window.loadURL(url.toString());
  return window;
}

function closeLocalServer(): Promise<void> {
  if (shutdownPromise) return shutdownPromise;
  if (!localServer) return Promise.resolve();

  const server = localServer;
  localServer = null;

  shutdownPromise = new Promise<void>(resolve => {
    const timeout = setTimeout(() => {
      server.closeAllConnections();
      resolve();
    }, SERVER_CLOSE_TIMEOUT_MS);
    timeout.unref();

    server.close(() => {
      clearTimeout(timeout);
      resolve();
    });
  });

  return shutdownPromise;
}

const hasSingleInstanceLock = electronApp.requestSingleInstanceLock();

if (!hasSingleInstanceLock) {
  allowQuit = true;
  electronApp.quit();
} else {
  electronApp.on("second-instance", () => {
    if (!mainWindow) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  });

  electronApp.on("before-quit", event => {
    if (allowQuit) return;
    event.preventDefault();

    void closeLocalServer().finally(() => {
      allowQuit = true;
      electronApp.quit();
    });
  });

  electronApp.on("window-all-closed", () => electronApp.quit());

  electronApp.on("activate", () => {
    if (!mainWindow && appUrl) mainWindow = createMainWindow(appUrl);
  });

  void electronApp.whenReady()
    .then(async () => {
      Menu.setApplicationMenu(null);
      appUrl = await startLocalServer();
      mainWindow = createMainWindow(appUrl);
    })
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      dialog.showErrorBox(APP_NAME, `Не удалось запустить приложение.\n\n${message}`);
      allowQuit = true;
      electronApp.quit();
    });
}
