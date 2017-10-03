const { ipcRenderer } = require('electron');
const path = require('path');
require('devtron').install()

ipcRenderer.on('set', (event, args) => {
    var soundcontainer = document.getElementById('soundcontainer')
    while (soundcontainer.hasChildNodes()) {
        soundcontainer.removeChild(soundcontainer.lastChild);
    }
    args.forEach(function(element) {
        var soundtemplate = document.getElementById('soundtemplate');
        var soundDiv = soundtemplate.content.querySelector('div');
        soundDiv.setAttribute("id", element);
        soundDiv.textContent = element;
        soundcontainer.appendChild(soundtemplate.content.cloneNode(true));
    });
});

ipcRenderer.on('ping', (event, args) => console.log('ping'));

ipcRenderer.on('play', (event, args) => {
    play(args);
})

function play(buttonid) {
    let button = document.getElementById(buttonid)
    button.classList.add('playing');
    file = buttonid + '.wav';
    const soundPath = path.join('../assets/', file)
    let audio = new Audio(soundPath);
    audio.currentTime = 0;
    audio.play();
    setTimeout(() => {
        button.classList.remove('playing')
    }, 1500)
}