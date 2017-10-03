const {
    app,
    BrowserWindow,
    ipcMain,
    Menu,
    MenuItem,
    dialog,
    globalShortcut
} = require('electron');
const path = require('path');
const fs = require('fs');
require('electron-reload')(__dirname, {
    electron: path.join(__dirname, 'node_modules', 'bin', 'electron'),
    hardResetMethod: 'exit'
});

const ASSETS_PATH = path.join(__dirname, '..', 'assets');

let win
let keymap
let optionswin
let sounds = [];

url = `file://${__dirname + '/index.html'}`
optionsurl = `file://${__dirname + '/options.html'}`

template = [{
    label: 'Edit Sounds',
    submenu: [
        { label: 'Add Sound', click() { addSound() } },
        { label: 'Add Hotkey', click() { addHotkey() } }
    ]
}]

const menu = Menu.buildFromTemplate(template)

function createWindow() {
    win = new BrowserWindow({
        height: 600,
        width: 800
    })

    win.loadURL(url)
    win.webContents.openDevTools({ mode: 'detach' })

    win.webContents.on('did-finish-load', () => {
        setupSounds()
    })

    win.on('closed', () => {
        win = null
    })
}

app.on('ready', () => {
    Menu.setApplicationMenu(menu);
    createWindow();
    getKeymap();
});

function setupSounds() {
    sounds = [];
    fs.readdir(ASSETS_PATH, (err, files) => {
        files.forEach(file => {
            name = file.split('.');
            if (name[1] !== undefined) {
                console.log('ext:', name[1]);
                sounds.push(name[0]);
            }
        })
        win.webContents.send('set', sounds);
    })
}

function saveNewSound(files) {
    if (files) {
        console.log(keymap);
        filename = path.basename(files[0]);
        name = filename.split('.');
        outfilepath = path.join(ASSETS_PATH, filename);
        sound = fs.createReadStream(files[0]).pipe(fs.createWriteStream(outfilepath));
        keymap.push({ hotkey: null, name: name[0] });
        setupSounds();
        saveKeymap();
    }
}

function addSound() {
    dialog.showOpenDialog({
        filters: [
            { name: 'Sounds', extensions: ['wav'] }
        ]
    }, saveNewSound);
}

function addHotkey() {
    optionswin = new BrowserWindow({
        height: 300,
        width: 200
    });
    optionswin.webContents.openDevTools({ mode: 'detach' });
    optionswin.loadURL(optionsurl);

    optionswin.webContents.on('did-finish-load', () => {
        optionswin.webContents.send('send-current-shortcuts', keymap);
    });
}

function getKeymap() {
    fs.readFile(path.join(ASSETS_PATH, 'settings', 'hotkeys.json'), 'utf-8', (err, data) => {
        if (err) throw err;
        keymap = JSON.parse(data);
        registerGlobalShortcuts(keymap);
    });
}

function saveKeymap() {
    fs.writeFile(path.join(ASSETS_PATH, 'settings', 'hotkey.json'), keymap, (err) => {
        if (err) {
            console.log('opps error:', err);
        }
        console.log('saved file');
    })
}

function registerGlobalShortcuts(shortcuts) {
    globalShortcut.unregisterAll();
    shortcuts.forEach(function(element) {
        if (element.hotkey !== null) {
            globalShortcut.register(element.hotkey, () => {
                remotePlay(element.name);
            })
        }
    })
}

function remotePlay(soundName) {
    win.webContents.send('play', soundName);
}

ipcMain.on('setShortcuts', (event, args) => {
    console.log('received shortcuts', args);
    registerGlobalShortcuts(args);
    let newshortcuts = JSON.stringify(args);
    optionswin.close();
    fs.writeFile(path.join(ASSETS_PATH, 'settings', 'hotkeys.json'), newshortcuts, (err) => {
        if (err) console.log('cannot write to file');
    })
})