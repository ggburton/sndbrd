const { ipcRenderer } = require('electron')

ipcRenderer.on('set', (event, args) => {
    console.log('setSounds fired')
    const html = document.getElementById('html')
    args.forEach(function(element) {
        var sounddiv = document.createElement('div')
        sounddiv.innerHTMl = element.name
        html.appendChild(sounddiv)
    });
})

ipcRenderer.send('hello', 'hello')