// Modules to control application life and create native browser window
const { app, BrowserWindow, crashReporter, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const uuidv1 = require('uuid/v1');
var ncp = require('ncp').ncp;
//var sleep = require('system-sleep');
var base64Img = require('base64-img');
const { Console } = require('console');
const { SlowBuffer } = require('buffer');
const { resolve } = require('dns');

const appFilePATH = app.getPath('userData');
const appDataStore = appFilePATH + '\\AppData';
const appLogsStore = appFilePATH + '\\AppData\\logs\\';

//Load device config
var dataPath = path.resolve(__dirname, 'device.json');
var getDevice = fs.readFileSync(dataPath);
var APP_DEVICE = JSON.parse(getDevice);

//Set ibnterval var
var appTimeInterval = {};

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow, installer

//Import Store
const Store = require(path.resolve(__dirname, 'store.js'));
const APP_STORE = new Store({
    configName: 'app-store',
    defaults: {
        install: 0,
        device: null
    }
});

const APP_STAT_STORE = new Store({
    configName: 'app-stat-store',
    defaults: {
        device: '',
        globalClick: 0,
        stats: null
    }
});


/**
 * function SET Interval 
 * @param action is a function to callback
 * @param time is the time for interval
 * @param inteval is the name of specific inerval to initialize
 */
function appSetInterval(name = 'downloadjson', callback, time = 600000) {
    if (appTimeInterval[name] != null) {
        clearInterval(appTimeInterval[name]);
    }
    appTimeInterval[name] = setInterval(callback, time);
}

/**
 * function CREATE DIR 
 * @param fileName
 * @param response
 */
function createAppDataDir($path = appDataStore) {
    //CTRL IF DIR EXIST AND CREATE
    if (!fs.existsSync($path)) {
        fs.mkdirSync($path, { recursive: true }, (err) => {
            console.log(err);
        });
    }
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function printLog(mess) {
    let date = new Date();

    let stringD = date.toLocaleDateString("en-gb", {
        hour: "numeric",
        minute: "2-digit", second: 'numeric'
    });
    console.log('[' + stringD + '] ' + mess);
}

function register_error_log(action, content) {
    let date = new Date();
    let stringD = date.getHours() + "-" + date.getMinutes() + "-" + date.getSeconds();
    let fileName = appLogsStore + '\\' + stringD + '-' + action + '.txt';
    fs.writeFile(fileName, content, (err) => {
        let date = new Date();
        console.log(stringD + ' The error log has been succesfully saved');
    });
}

/**
 * function save file Json
 * @param fileName
 * @param response
 */
async function saveFile(fileName, response) {
    return new Promise(function (resolve, reject) {

        //Ctrl AppDataDir And Create It if necessary
        createAppDataDir(appLogsStore);

        var content = [];

        response.data.forEach(function (element) {
            content.push(element);
        });

        if (fileName === undefined) {
            reject(Error('fileName is undefined!'));
        }

        // fileName is a string that contains the path and filename created in the save file dialog.
        fs.writeFile(fileName, JSON.stringify(content), (err) => {
            if (err) {
                reject(Error("An error ocurred creating the file " + err.message));
            }
            let mess = "- The file " + fileName + " has been succesfully saved ";
            resolve(mess)
        });

    });

}

async function saveData(url, fileStore) {
    return new Promise((resolve) => {
        axios.get(url).then(function (response) {
            saveFile(fileStore, response).then(function (val) {
                resolve(val);
            }).catch(function (error) {
                reject(Error("Failed!", error))
            });
        })
    });
}

/**
 * function get data webservice
 * @param data
 * @returns {Promise<void>}
 */
function getWebservice(data, key, actionType) {
    return new Promise(function (resolve, reject) {
        printLog('Start downloading Json files...')
        let i = 'exposants'
        let url = data[i] + '?key=' + key
        let fileStore = appDataStore + '\\' + i + '.json';
        saveData(url, fileStore).then((mess) => {
            printLog(mess);
            let i = 'programmes'
            let url = data[i] + '?key=' + key
            let fileStore = appDataStore + '\\' + i + '.json';
            return saveData(url, fileStore);
        }).then(function (mess) {
            printLog(mess);
            let i = 'stands'
            let url = data[i] + '?key=' + key
            let fileStore = appDataStore + '\\' + i + '.json';
            return saveData(url, fileStore);
        }).then((mess) => {
            printLog(mess);
            resolve('All json file are imported!');
        }).catch((err) => {
            console.error(err);
            reject(err);
        });
    });
}

/**
 * save image base 64
 * npm install base64-img --save
 * https://www.npmjs.com/package/base64-img
 */
async function decode_base64(base64str, path, filename) {
    return new Promise(function (resolve, reject) {
        base64Img.img('data:image/png;base64,' + base64str, appDataStore + '/img/' + path, filename, function (err, filepath) {
            if (err) {
                reject(err);
            } else {
                resolve(1);
            }
        });
    });
}

/**
 * recuperer les images en base 64
 */
async function getImageBase64(data, key) {
    return new Promise(function (resolve, reject) {
        printLog('Starting getImageBase64, get json file ...');
        axios.get(data + '?key=' + key).then(function (response) {
            printLog('Json files are loaded !');
            printLog('Stating creating imgaes form base64 string ...');
            const images = response.data;
            let totalGroup = Object.keys(images).length
            try {
                let countG = 1;
                for (let group in images) {

                    let value = images[group];
                    let totalGroupImg = Object.keys(value).length
                    if (totalGroupImg == 0) { totalGroup-- }
                    let countImg = 1;
                    for (let key in value) {
                        let idImage = value[key].id;
                        let imageBase64 = value[key].image;
                        decode_base64(imageBase64, group, idImage).then(function (n) {
                            countImg = countImg + n;
                            if (countImg == totalGroupImg) {
                                printLog(countG + '/' + totalGroup + ' - ' + countImg + ' ' + group + ' images created');
                                if (countG == totalGroup) {
                                    resolve('All images are created !');
                                }
                                countG++
                            }
                        });
                    }
                }
            } catch (error) {
                reject(error);
            }
        });
    });

}

function setDefaultPubs() {
    return new Promise(function (resolve, reject) {
        printLog('Start set default video pubs');
        let source = path.resolve(__dirname, 'src/assets/pubs/');
        let destination = appFilePATH + '\\AppData\\pubs\\';
        createAppDataDir('setDefaultPubs', destination);
        ncp.limit = 16;
        ncp(source, destination, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve('Set Default Pubs - Done!');
            }
        });
    })
}

function startApp() {

    var appStartPath;
    var install = APP_STORE.get('install');

    if (!install || install == 0) {

        installer = new BrowserWindow({
            width: 800,
            height: 650,
            webPreferences: {
                nodeIntegration: true
            },
            resizable:false,
            show: false,
            backgroundColor:"#2e2e2e"
        })
        installer.loadFile('src/mod/installer/index.html')
        //installer.removeMenu();
        installer.once('ready-to-show', () => {
            installer.show()
        })

    } else {

        appSetting = APP_STORE.get('device');
        appStartPath = 'src/mod/app-salon/' + appSetting.module + '/index.html';
        console.log('A1/1 - Set module ', appSetting.module);
        createWindow(appStartPath);
        
        /**
         * Télechargement automatique des jsons et Ping toutes le 5 minutes
         */
        appSetInterval('synch_devices', function () {
            //updateData();
        }, 60000);
        
        appSetInterval('restartApp', function () {
            BrowserWindow.getAllWindows().forEach(window => {
                window.close()
            });
            console.log('D - Restart App');
            restart();
        }, 3600000);

    }
}

function createWindow(appStartPath) {

    let indexPath = path.resolve(__dirname, appStartPath);
    let appSetting = APP_DEVICE.params;
    console.log('B1/5 - get start path ', indexPath);

    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: appSetting.screen.width,
        height: appSetting.screen.height,
        backgroundColor: appSetting.screen.backgroundColor,
        webPreferences: {
            nodeIntegration: true
        },
        show: false
    });

    console.log('B2/5 - set mainWindow');

    // and load the index.html of the app.
    mainWindow.loadFile(indexPath);

    console.log('B3/5 - mainWindow loadFile');

    console.log('B4/5 - Set kiosk e menu', APP_DEVICE.eviroment);
    if (APP_DEVICE.eviroment === 'dev') {
        mainWindow.webContents.openDevTools();
        mainWindow.kiosk = false;
    } else {
        mainWindow.removeMenu();
        mainWindow.setKiosk(appSetting.screen.kiosk);
    }

    mainWindow.once('ready-to-show', () => {
        mainWindow.show()
    });


    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', startApp)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    app.quit();
});

app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) createWindow()
});



/**
 * Rédemmarage automatique de l'application
 */
function restart() {
    app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) })
    app.exit(0)
}

const alertOnlineStatus = () => {
    window.alert(navigator.onLine ? 'online' : 'offline')
}

/**
 * Main events listener
 */
ipcMain.on('my-closeallwindowsasap-channel', (event, arg) => {
    BrowserWindow.getAllWindows().forEach(window => {
        window.close()
    })
    restart();
})


ipcMain.on('close-all-windows', (event, arg) => {
    BrowserWindow.getAllWindows().forEach(window => {
        window.close()
    })
})


/**
 * Register device on DB and take Token && ID
 */
async function pingDevice() {

    const install = APP_STORE.get('install');

    if (install && install == 1) {

        let appSetting = APP_STORE.get('device');
        let connection = APP_STORE.get('connections');
        let appStat = APP_STAT_STORE.get('stats');

        const data = {
            "key": APP_DEVICE.acceskey,
            'id': connection.id,
            'token': connection.token,
            'dconf': JSON.stringify(appSetting),
            'dstat': JSON.stringify(appStat)
        }

        axios.post(APP_DEVICE.webservices.device.ping, data).then(function (response) {
            return response.data;
        }).catch(function (error) {
            let message = 'An error occurred during the ping of the device  :' + error + '/n/n' + JSON.stringify(appSetting) + '/n/n' + JSON.stringify(appStat);
            register_error_log('ping_device', message);
            var response = {
                "status": 'error',
                "data": { 'message': message }
            }
        });
    }
}

//Installer
ipcMain.on('launch-installer', (event, arg) => {
    let options = {};
    event.sender.send('reply-installer', {mess:"Start install process", step:0, type:'info'});
    event.sender.send('reply-installer', {mess:"- Enviroment is : "+ APP_DEVICE.eviroment, step:0, type:'white'});
    event.sender.send('reply-installer', {mess:"Start download Json data", step:1, type:'info'});
    getWebservice(APP_DEVICE.webservices.appdata, APP_DEVICE.acceskey, 'sync').then(function (mess) {
        event.sender.send('reply-installer', {mess:'- '+mess, step:1, type:'white'});
        event.sender.send('reply-installer', {mess:"Start download images", step:2, type:'info'});
        return getImageBase64(APP_DEVICE.webservices.imageBase64, APP_DEVICE.acceskey);
    }).then((mess) => {
        event.sender.send('reply-installer', {mess:'- '+mess, step:2, type:'white'});
        event.sender.send('reply-installer', {mess:"Start set default pubs videos", step:3, type:'info'});
        return setDefaultPubs();
    }).then((mess) => {
        event.sender.send('reply-installer', {mess:'- '+mess, step:3, type:'white'});
        event.sender.send('reply-installer', {mess:'The process is now completed, now go to device settings', step:4, type:'white'});
    }).catch((err) => {
        console.error(err);
        event.sender.send('reply-installer', {mess:'- '+err, step:'error', type:'danger'});
    });
})

ipcMain.on('go-to-device-settings', (event, arg)=>{
    installer.loadFile('src/mod/install/index.html')
})

//Register Devices after Install
ipcMain.on('connect-device-to-server', (event, arg) => {

    var data = {
        "key": APP_DEVICE.acceskey,
        "device": JSON.stringify(arg)
    }
    axios.post(APP_DEVICE.webservices.device.register, data).then(function (response) {
       
        event.sender.send('reply-connect-device-to-server', response.data);

    }).catch(function (error) {

        let message = 'An error occurred during the registration of the device :' + error;
        register_error_log('register_device', message);

        //console.log('arg: ', data);

        var response = {
            "status": 'error',
            "data": { 'message': message, 'key': APP_DEVICE.acceskey, 'arg': arg }
        }

        event.sender.send('reply-connect-device-to-server', response);

    });

})

//Register Devices after Install
ipcMain.on('register-device-stat', (event, arg) => {

    var save = {};
    var date = new Date();

    //Universally Unique IDentifier
    var uuid = uuidv1();

    //Get registered statistics
    let stats = APP_STAT_STORE.get('stats');
    let global_click = APP_STAT_STORE.get('globalClick');

    //Increments global click :
    global_click = global_click + 1;
    APP_STAT_STORE.set('globalClick', global_click);

    //Set device ID
    APP_STAT_STORE.set('device', APP_STORE.get('id'));

    //Increment Stats 
    if (stats != null) {
        stats[uuid] = arg;
    } else {
        stats = {};
        stats[uuid] = arg;
    }

    //save on local storage
    APP_STAT_STORE.set('stats', stats);

});


ipcMain.on('close-app', (event, arg) => {
    console.log('closa-app', event)
    BrowserWindow.getAllWindows().forEach(window => {
        window.close()
    })
})
