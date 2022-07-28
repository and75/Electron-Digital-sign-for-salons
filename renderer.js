// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
var electron = require('electron');
const {ipcRenderer} = require('electron');
const Store = require('./store.js');
const { windowsStore } = require('process');

//Set window global function
window.SLEEP = require('system-sleep');
window.IPCRENDER = ipcRenderer;
window.SESSION= require('electron').remote.session;
window.USER_DATA_PATH = (electron.app || electron.remote.app).getPath('userData');
window.APP_PATH = require('path');
window.FS = require('fs');
window.APP_STORE = new Store({
	configName: 'app-store',
	defaults: {
	    install: 0,
	    device : null
	}
});
window.APP_STAT_STORE = new Store({
    configName: 'app-stat-store',
    defaults: {
      device : '',
	  stat : '',
	  globalClick:0,
    }
});
window.JsSearch = require('js-search');
window.MUSTACHE = require('mustache');
window.$ = window.jQuery = require('jquery');
window.HAMMER = require('hammerjs');

/*Include libraries*/
require('leaflet');
require('leaflet-search');
require('leaflet-draw');
require('popper.js');
require('bootstrap');
require('./src/assets/js/vendors/jkeyboard.js');
require('./src/assets/js/app.salon.starter.js');
