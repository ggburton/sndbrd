const { app, BrowserWindow, ipcMain, Menu, MenuItem, dialog } = require('electron');
const { saveSounds, loadSounds, removeSounds } = require('./sounds');
const path = require('path');
const fs = require('fs');

let win
url = `file://${__dirname + '/index.html'}`

let soundlist = [{
        "name": "911",
        "file": "911.wav",
        "hotkey": "1"
    },
    {
        "name": "mommy",
        "file": "mommy.wav",
        "hotkey": "2"
    }
]

template = [{
    label: 'Edit Sounds',
    submenu: [
        { label: 'Add Sound', click() { addSound() } }
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

function setSounds(sounds) {
    sounds.forEach(function(sound) {
        console.log(sound.hotkey)
    })
    win.webContents.send('set', sounds)
}


app.on('ready', () => {
    Menu.setApplicationMenu(menu);
    createWindow();
});

function setupSounds() {
    saveSounds(soundlist);
    loadSounds().then(sounds => {
        setSounds(sounds);
    })
}

function addSound() {
    dialog.showOpenDialog({
        filters: [
            { name: 'Sounds', extensions: ['mp3', 'wav'] }
        ]
    }, saveNewSound);
}

function saveNewSound(files) {
    filename = path.basename(files[0]);
    sound = fs.open(files[0], 'r', function(err, file) {
        newFilePath = path.join(__dirname, '..',
            'assets', filename);
        console.log(newFilePath);
        fs.writeFile(newFilePath, file, function(err) {
            if (err) {
                console.log('error: ', err);
            } else {
                console.log('saved');
            }
        });
    });

}