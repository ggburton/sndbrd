const { ipcRenderer } = require('electron')

ipcRenderer.on('set', (event, args) => {
    console.log('setSounds fired')
    const html = document.getElementById('')
    args.forEach(function(element) {
        var soundDiv = document.getElementById('sounddiv');
        document.body.appendChild(soundDiv.content.cloneNode(true));
    });
})

ipcRenderer.send('hello', 'hello')