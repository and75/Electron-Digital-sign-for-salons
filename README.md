# Présentation

"AppSalon" est une application "Multitouch" JQuery/Bootstrap de type OOP (Object-oriented programming)
avec un système de gabarits (géré avec Mustache.js) qui séparent la visualisation depuis le contrôle (un système presque de type MVC).
L'application est composée d'un objet Core qui fournit des services et fonctionnalités global: 
- initialisation de l'application
- initialisation de modules
- lecture de modèles html
- exécution de fonctions chronométrées
- utilitaires de lecture et de formatage de données telles que: json, tableau, images et objets
- interface avec les processus "main" et "render" d'Electron

et une série d'objets modules spécialisés pour l'implémentation de fonctions specifique et la gestion de modules d'affichage dédiés (totem et mur).

### A propos de la version 2.4

La version 2.4 implémente la fonctionnalité multitouch en introduisant l'utilisation de la bibliothèque Hammer.js
- https://hammerjs.github.io/

## Bibliothèques utilisées
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
Dans cette version, l'application est implémentée dans Electron pour permettre son exécution hors ligne sur les appareils tactiles sous le système d'exploitation Windows.
Electron gère:
- L'installation
- Récupération et stockage de données (json, images)
- Écriture en temps réel de données statistiques (stocage de type Json)
- Envoi de données statiques et de donnes concernat l'état de l'application au serveur via cron

Note: If you're using Linux Bash for Windows, [see this guide](https://www.howtogeek.com/261575/how-to-run-graphical-linux-desktop-applications-from-windows-10s-bash-shell/) or use `node` from the command prompt.


## Comment installer et utiliser l'application

### Install Node 
Pour une utilisation correcte de l'application, vous avez besoin de:

- NodeJs v14.15.1
- Npm 6.14.8

Pour ceux qui ne connaissent pas il est tout à fait possible d'avoir différentes versions de node et donc de npm

Une fois Node installé, vous devez vous rendre dans le dossier de votre projet.

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
