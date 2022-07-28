# Présentation

"AppSalon" is a "Multitouch" JQuery/Bootstrap OOP (Object-oriented programming) application
with a system of templates (managed with Mustache.js) that separate visualization from control (an almost MVC-like system).
The application is composed of a Core object which provides global services and functionalities:

- application initialization
- module initialization
- reading html templates
- performing timed functions
- utilities for reading and formatting data such as: json, array, images and objects
- interface with Electron's "main" and "render" processes

and a series of specialized module objects for the implementation of specific functions and the management of dedicated display modules (totem and wall).

### About version 2.4

Version 2.4 implements multitouch functionality by introducing the use of the Hammer.js library
- https://hammerjs.github.io/

## Dependencies
**JS**
- "axios": "^0.21.1",
- "base64-img": "^1.0.4",
- "bootstrap": "^4.1.3",
- "electron": "^5.0.2",
- "electron-log": "^3.0.6",
- "electron-packager": "^13.1.1",
- "hammerjs": "^2.0.8",
- "js-search": "^2.0.0",
- "leaflet": "^1.5.1",
- "leaflet-draw": "^1.0.4",
- "leaflet-search": "^2.9.8",
- "lightslider": "^1.1.6",
- "masonry-layout": "^4.2.2",
- "mustache": "^3.0.1",
- "ncp": "^2.0.0",
- "popper.js": "^1.14.4",
- "system-sleep": "^1.3.6",
- "uuid": "^3.3.3"


**CSS**
- "bootstrap": "^4.1.3"
- "masonry-layout": "^4.2.2"


### Electron
In this version, the application is implemented in Electron to allow its execution offline on touch devices under the Windows operating system.
- Installation
- Data recovery and storage (json, images)
- Real-time writing of statistical data (Json type storage)
- Sending static data and application state data to the server via cron

Note: If you're using Linux Bash for Windows, [see this guide](https://www.howtogeek.com/261575/how-to-run-graphical-linux-desktop-applications-from-windows-10s- bash-shell/) or use `node` from the command prompt.


## How to install and use the app

### Install Node 
For correct use of the application you need:

- NodeJs v14.15.1
- Npm 6.14.8

For those who do not know it is quite possible to have different versions of node and therefore of npm

Once Node is installed, you need to go to your project folder.

#### Install dependencies
`npm install`

#### Run the app
`npm start`


## Build the application
```bash

#Build for windows run
npm run build-win

#Build for linux 
npm run build-linux
npm run build-debian (on linux machine)

#Build for Os
npm run build-os

Les fichiers se trouvent dans le dossier : "builds"

```

## Resources 

### Learning Electron

- [electronjs.org/docs](https://electronjs.org/docs) - all of Electron's documentation
- [electronjs.org/community#boilerplates](https://electronjs.org/community#boilerplates) - sample starter apps created by the community
- [electron/electron-quick-start](https://github.com/electron/electron-quick-start) - a very basic starter Electron app
- [electron/simple-samples](https://github.com/electron/simple-samples) - small applications with ideas for taking them further
- [electron/electron-api-demos](https://github.com/electron/electron-api-demos) - an Electron app that teaches you how to use Electron
- [hokein/electron-sample-apps](https://github.com/hokein/electron-sample-apps) - small demo apps for the various Electron APIs

## License

[CC0 1.0 (Public Domain)](LICENSE.md)
