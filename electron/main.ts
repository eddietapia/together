import {
  app,
  BrowserWindow,
  Tray,
  nativeImage,
  ipcMain,
  screen,
  clipboard,
} from 'electron';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRELOAD_PATH = path.join(__dirname, 'preload.js');

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let trayWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 620,
    resizable: true,
    frame: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: PRELOAD_PATH,
    },
    backgroundColor: '#fefdf8',
    center: true,
    titleBarStyle: 'default',
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5174');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../frontend/dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTrayWindow() {
  trayWindow = new BrowserWindow({
    width: 300,
    height: 380,
    frame: false,
    resizable: false,
    movable: false,
    alwaysOnTop: true,
    show: false,
    skipTaskbar: true,
    vibrancy: 'popover',
    visualEffectState: 'active',
    transparent: true,
    hasShadow: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: PRELOAD_PATH,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    trayWindow.loadURL('http://localhost:5174/?tray=1');
  } else {
    trayWindow.loadFile(path.join(__dirname, '../frontend/dist/index.html'), {
      query: { tray: '1' },
    });
  }

  trayWindow.on('blur', () => {
    trayWindow?.hide();
  });
}

function createTray() {
  // In dev: go up two directories from electron/dist → repo root → frontend/src/assets
  const iconPath = path.join(
    __dirname,
    '../../frontend/src/assets/Biomni Lab Logo Icon.png',
  );
  const icon = nativeImage.createFromPath(iconPath).resize({ width: 18, height: 18 });

  tray = new Tray(icon);
  tray.setToolTip('Checkpoints');

  tray.on('click', (_event, bounds) => {
    if (!trayWindow) return;

    if (trayWindow.isVisible()) {
      trayWindow.hide();
      return;
    }

    const windowWidth = trayWindow.getBounds().width;
    const { x, y, height } = bounds;
    const display = screen.getDisplayNearestPoint({ x, y });

    // Center under the tray icon, clamped to screen edges
    let windowX = Math.round(x - windowWidth / 2);
    windowX = Math.max(
      display.bounds.x,
      Math.min(windowX, display.bounds.x + display.bounds.width - windowWidth),
    );
    const windowY = Math.round(y + height);

    trayWindow.setPosition(windowX, windowY, false);
    trayWindow.show();
    trayWindow.focus();
  });
}

// IPC: open main window at a specific submission
ipcMain.on('tray:review', (_event, id: string) => {
  trayWindow?.hide();
  if (!mainWindow) {
    createWindow();
  } else {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  }
  if (id) mainWindow?.webContents.send('navigate:submission', id);
});

// IPC: just bring the main window into focus
ipcMain.on('tray:open-app', () => {
  trayWindow?.hide();
  if (!mainWindow) createWindow();
  else {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  }
});

// IPC: copy submission title to clipboard
ipcMain.on('tray:share', (_event, title: string) => {
  clipboard.writeText(title);
});

// IPC: hide tray window
ipcMain.on('tray:close', () => {
  trayWindow?.hide();
});

app.whenReady().then(() => {
  createWindow();
  createTrayWindow();
  createTray();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});
