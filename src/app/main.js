const { app, BrowserWindow, ipcMain } = require('electron')
const { saveSounds, loadSounds, removeSounds } = require('./sounds')

let win
url = `file://${__dirname + '/index.html'}`

let soundlist = [{
        "name": "911",
        "file": "911.wav",
        "hotkey": "1"
    },
    {
        "name": "hello",
        "file": "hello.wav",
        "hotkey": "2"
    }
]


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
    console.log('add ready');
    createWindow();
});

function setupSounds() {
    saveSounds(soundlist)
    loadSounds().then(sounds => {
        setSounds(sounds)
    })
}