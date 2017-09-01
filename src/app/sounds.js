const storage = require('electron-storage')

exports.saveSounds = saveSounds
exports.loadSounds = loadSounds
exports.removeSounds = removeSounds


function saveSounds(sounds) {
    storage.set('/data/sounds.json', sounds)
}

function loadSounds() {
    return storage.get('/data/sounds.json')
}

function removeSounds() {
    return storage.remove('/data/sounds.json')
}