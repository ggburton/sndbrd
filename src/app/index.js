const { ipcRenderer } = require('electron');
const path = require('path');

ipcRenderer.on('set', (event, args) => {
    args.forEach(function(element) {
        var soundDiv = document.getElementById('sounddiv');
        var button = soundDiv.content.querySelector('button');
        button.setAttribute("id", element.name);
        button.textContent = element.name;
        document.body.appendChild(soundDiv.content.cloneNode(true));
    });
});

function play(buttonid) {
    file = buttonid + '.wav';
    const soundPath = path.join('../assets/', file)
    let audio = new Audio(soundPath);
    audio.currentTime = 0;
    audio.play();
}