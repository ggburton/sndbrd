const { ipcRenderer } = require('electron');

var form = document.getElementById('formInputDiv')
let hotkeyMap = [];

ipcRenderer.on('send-current-shortcuts', (event, args) => {
    args.forEach(function(element) {
        let keystring = null;
        if (element.hotkey != null) {
            keystring = element.hotkey.substr(23, 1);
            console.log('keysting:', keystring);
        }
        var formGroup = document.getElementById('hotkeyInput')
        var label = formGroup.content.querySelector('label')
        var input = formGroup.content.querySelector('input')
        input.setAttribute('name', element.name)
        label.textContent = element.name
        input.value = keystring
        form.appendChild(formGroup.content.cloneNode(true));
    }, this);
})

function saveShortcuts() {
    var inputs = document.getElementsByClassName('inputtext')
    for (i = 0, len = inputs.length; i < len; i++) {
        let hotkey = null;
        if (inputs[i].value !== "") {
            hotkey = "CommandOrControl+Shift+" + inputs[i].value;
        }
        keybinding = {
            "name": inputs[i].name,
            "hotkey": hotkey
        }
        hotkeyMap.push(keybinding)
    }
    ipcRenderer.send('setShortcuts', hotkeyMap)
    return true
}