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


const SOUND_DIR = path.join(app.getPath('userData'), 'sounds')
const SETTINGS = app.getPath('userData')

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
        width: 800,
        minHeight: 350,
        minWidth: 300
    })

    win.loadURL(url)

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

function checkSoundHasKeymap(sound) {
    let obj = keymap.find(item => item.name === sound);
    if (obj === undefined) {
        let key = {
            name: sound,
            hotkey: null
        }
        keymap.push(key)
    }
};


function setupSounds() {
    sounds = [];
    if (!fs.existsSync(SOUND_DIR)) {
        fs.mkdirSync(SOUND_DIR)
    }
    fs.readdir(SOUND_DIR, (err, files) => {
        files.forEach(file => {
            name = file.split('.');
            if (name[1] === 'wav') {
                checkSoundHasKeymap(name[0]);
                console.log('ext:', name[1]);
                sounds.push(name[0]);
            }
        })
        win.webContents.send('set', sounds);
    })
}

function saveNewSound(files) {
    if (files) {
        filename = path.basename(files[0]);
        name = filename.split('.');
        outfilepath = path.join(SOUND_DIR, filename);
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
        width: 500,
        minHeight: 300,
        minWidth: 500,
        maxWidth: 500
    });
    optionswin.loadURL(optionsurl);

    optionswin.webContents.on('did-finish-load', () => {
        optionswin.webContents.send('send-current-shortcuts', keymap);
    });
}


function getKeymap() {
    fs.readFile(path.join(app.getPath('userData'), 'hotkeys.json'), 'utf-8', (err, data) => {
        if (err) {
            keymap = [];
        } else {
            keymap = JSON.parse(data);
            keymap.forEach(item => {
                const filename = item.name + '.wav';
                fs.stat(path.join(SOUND_DIR, filename), (err, stat) => {
                    if (err) {
                        if (err.code == 'ENOENT') {
                            keymap.splice(keymap.indexOf(item), 1);
                        }
                    };
                });
            });
            registerGlobalShortcuts(keymap);
        }
    });
}

function saveKeymap() {
    let jsonkeymap = JSON.stringify(keymap)
    fs.writeFile(path.join(SETTINGS, 'hotkeys.json'), jsonkeymap, (err) => {
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
    registerGlobalShortcuts(args);
    let newshortcuts = JSON.stringify(args);
    optionswin.close();
    saveKeymap();
})