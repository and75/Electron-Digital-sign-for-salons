/*!
 * App-salon v1.0.0
 *
 * Copyright (c) 2019 Bliwe
 */
window.AppSalon = (function($) {

    'use strict';

    //Basic Config
    let config = {
        map: true,
        modal: true,
        salle: {
            id: '', //option defined in device.json
            name: '', //option defined in device.json
        },
        salle: {
            id: "", //option defined in device.json
            name: "" //option defined in device.json
        },
        position: {
            longitude: "-68.56640625", //option defined in device.json
            latitude: "205.53599579611142" //option defined in device.json
        },
        programme: {
            date: "", //option defined in device.json
            day: "", //option defined in device.json
            days: "" //option defined in device.json
        },

        totem_position: [, ], //option defined in device.json

        map_setting: {
            mapId: 'mapid',
            minZoom: 1,
            maxZoom: 4,
            center: [600, 300],
            zoom: 1.45,
            zoomSnap: 0.5,
            zoomDelta: 0.5,
            setMaxBounds: false,
            touchZoom: true,
            scrollWheelZoom: true,
            doubleClickZoom: true,
            dragging: true,
            img: {
                plan: APP_PATH.resolve(__dirname, '../../map/plan-map.svg'),
                planWidth: 4000,
                planHeight: 1000,
                marker: APP_PATH.resolve(__dirname, '../../map/point.png'),
            },
        },
        templates: {
            path: APP_PATH.resolve(__dirname, '../../../templates/'),
        },
        img: {
            path: APP_PATH.resolve(__dirname, '../../../_assets/img/'),
            system_path: USER_DATA_PATH + '/AppData/img/'
        },
        services: {
            sendPercours: {
                url: 'http://goentrepreneur.napsy.com/webservice/sms-send',
                mapUrl: 'http://goentrepreneur.napsy.com/webservice/map/sms/'
            },
            devices: {
                getList: "http://goentrepreneur.napsy.com/webservice/app-salon-list-device"
            }
        },
        data: {
            exposants: USER_DATA_PATH + '/AppData/exposants.json',
            programme: USER_DATA_PATH + '/AppData/programmes.json',
            stands: USER_DATA_PATH + '/AppData/stands.json',
            developper: APP_PATH.resolve(__dirname, '../../../../developper.json'),
            device: APP_PATH.resolve(__dirname, '../../../../device.json')
        },
        debug: false, //option defined in device.json and at last on app init
        debug_val: {
            DateNow: {
                day: '', //option defined in developper.json and at last on app init
                time: '', //option defined in developper.json and at last on app init
                month: '', //option defined in developper.json and at last on app init
                year: '', //option defined in developper.json and at last on app init
                fulldate: '', //option defined in developper.json and at last on app init
                fulldate_time: '' //option defined in developper.json and at last on app init
            },
            show_poligon: false //option defined in developper.json and at last on app init
        },
        settFilter: "",
        settDay: "",
        standParcours: [],
        exposantsParcours: [],
        spots: []
    };

    let global = { //NOT DELETE AND NOT USE
        map: null,
        mapSearch: null,
        mapSearchText: '',
        standParcours: [],
        exposantsParcours: [],
        exhibSearch: null,
        exhibSearchResult: { 'filter': {}, 'result': '', 'message': '' },
        programSearch: null,
        programSearchResult: { 'filter': {}, 'result': '', 'message': '' },
        settFilter: "",
        settDay: "",
        storeClick: 0,
    };

    //Timer and resetaction val
    let appReset = [],
        appTimeInterval = [],
        appTimeOut = [];


    //FUNCTION TO PRINT ON DEBUG TRUE
    function app_print_debug(value, mess = null) {
        console.log('debug', config.debug);
        if (config.debug == 'true') {
            console.log(value, mess);
        }
    }

    /**
     * FUNCTION TO GET SIZE AND POSITION OF WINDOW OR HTML ELEMENT	 
     */
    function app_get_elements_infos(element = null) {
        let element_infos = {
            appScreen: {
                width: window.innerWidth,
                height: window.innerHeight,
            },
            elementSize: {},
            elementPosition: {}
        }
        if (element) {
            element_infos.elementSize = {
                offsetWidth: element.offsetWidth,
                offsetHeight: element.offsetHeight,
                clientWidth: element.clientWidth,
                clientHeight: element.clientHeight,
            };
            element_infos.elementPosition = {
                offsetTop: element.offsetTop,
                offsetLeft: element.offsetLeft,
                offsetParent: element.offsetParent
            }
        }

        if (element == 'window') {
            return element_infos.appScreen;
        }

        //console.log(element_infos);
        return element_infos;

    }

    /**
     * FUNCTION TO REGISTER STATISTIC FOR GLOBAL CLICK	 
     */
    function app_store_stats(events = null, options = null) {

        let stats_value = null;

        if (events) {
            let element = events.target;
            stats_value = $(element).data('stats');
            if (!stats_value) {
                stats_value = $(element).parent().data('stats');
            } else if (!stats_value) {
                stats_value = $(element).parent().parent().data('stats');
            } else if (!stats_value) {
                stats_value = $(element).parent().parent().parent().data('stats');
            }
        } else if (options != null) {
            stats_value = options;
        }

        if (stats_value) {
            //console.log('stat_value : ', stats_value);
            //Send to main for register devices
            IPCRENDER.send('register-device-stat', stats_value);
        }

    }

    /**
     * FUNCTION TO GET VARIABLE FROM URL
     * @param name of specific parameter to find in url	 
     */
    function app_get_url_parameter_by_name(name) {
        name = name.replace(/[\[\]]/g, "\\$&");
        let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(window.location.href);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    /**
     * FUNCTION TO INITIALIZE TIMEINTERVAL
     * @param name of specific inerval to initialize	 
     * @param callback is a function to callback
     * @param time is the time for interval
     */
    function app_set_interval(name = null, callback = null, time = 600000) {
        if (!name || !callback || !time) {
            return false;
        }
        app_clear_interval(name);
        appTimeInterval[name] = setInterval(callback, time);
    }

    /**
     * FUNCTION TO CLEAR TIMEINTERVAL 
     * @param name  : the name of specific inerval to initialize. default 'all'	 
     */
    function app_clear_interval(name = null) {
        if (name == '') { return false; }
        if (name == 'all') {
            $.each(appTimeInterval, function(i, v) {
                clearInterval(appTimeInterval[i]);
            });
        } else if (appTimeInterval[name] != null) {
            clearInterval(appTimeInterval[name]);
        }
    }

    /**
     * FUNCTION TO INITIALIZE TIMEOUT 
     * @param name of specific inerval to initialize	 
     * @param callback is a function to callback
     * @param time is the time for interval
     */
    function app_set_timeout(name = '', callback = null, time = 600000) {
        if (!name || !callback || !time) {
            return false;
        }
        app_clear_timeout(name);
        appTimeOut[name] = setTimeout(callback, time);
    }

    /**
     * FUNCTION TO ClEAR TIMEOUT 
     * @param name  : the name of specific inerval to initialize. default 'all'	 
     */
    function app_clear_timeout(name = 'all') {
        if (!name) { return false; }
        if (name == 'all') {
            $.each(appTimeOut, function(i, v) {
                clearTimeout(appTimeOut[i]);
            });
        } else if (appTimeOut[name] != null) {
            clearTimeout(appTimeOut[name]);
        }
    }

    /**
     * FUNCTION TO FIND IN ARRAY 
     */
    function app_find_on_array(data, elem, key) {
        Array.prototype.contains = function(elem, key = null) {
            for (let i in this) {
                if (key == null) {
                    if (this[i] == elem) return true;
                } else {
                    if (this[i][key] == elem) return true;
                }
            }
            return false;
        }
        return data.contains(elem, key);
    }

    /**
     * FUNCTION TO DELETE IN ARRAY 
     */
    function app_delete_on_array(data, elem, key = null) {

        //create function for check array
        Array.prototype.remove = function(elem, key) {
            for (let i in this) {
                if (key == null) {
                    if (this[i] == elem) {
                        this.splice(i, 1);
                    }
                } else {
                    if (this[i][key] == elem) {
                        this.splice(i, 1);
                    }
                }
            }
            return this;
        }
        return data.remove(elem, key);
    }

    /**
     * FUNCTION TO CREATE APP TOKEN 
     */
    function app_get_token() {
        function get_rand() {
            let rand = (Math.random().toString(36).substr(2));
            return rand
        }
        return get_rand() + get_rand(); // to make it longer
    }

    /**
     * FUNCTION TO LOAD JSON DATA
     */
    function app_set_json_data(app) {
        app.DB = {};
        for (const [key, value] of Object.entries(config.data)) {
            if (key != 'developper' && key != 'device') {
                let data = FS.readFileSync(value);
                let json = JSON.parse(data);
                app.DB[key] = json[0];
            }
        }
    }

    /**
     * FUNCTION TO LOAD JSON DATA
     */
    function app_get_json_data(path, key = null, ret_array = true) {
        let json = null;
        if (path && !key) {
            json = AppSalon.DB[path];
        } else if (path && key) {
            json = AppSalon.DB[path][key];
        }
        if (ret_array == true) {
            json = Object.values(json);
        }
        return json;
    }

    function app_get_json_sync_data(type, key = null, ret_array = true) {
        let path = '';
        if (type == "exposants") {
            path = this.config.data.exposants
        } else if (type == "programme") {
            path = this.config.data.programme
        } else if (type == "stands") {
            path = this.config.data.stands
        }

        let data = FS.readFileSync(path);
        let json = JSON.parse(data);
        json = json[0];
        if (key) {
            json = json[key];
        }
        if (ret_array == true) {
            json = Object.values(json);
        }
        return json;
    }

    /**
     * FUNCTION REGISTER FUNCTIONS FOR RESET APP 
     */
    function app_register_reset_function(callback) {
        let action = [callback];
        appReset.push(action);
    }

    /**
     * FUNCTION TO RESET APP 
     */
    function app_reset() {
        $.each(appReset, function(k, fn) {
            if (typeof fn[0] === 'function') {
                fn[0](AppSalon);
            }
        });
    }

    /**
     * FUNCTION TO RENDER TEMPLATE
     */
    function app_render_template(name = 'template_test', obj, base = 'app') {
        let path = config.templates.path + '/' + base + '/' + name + '.mst';
        let template = FS.readFileSync(path, 'utf8');
        MUSTACHE.parse(template);
        return MUSTACHE.render(template, obj);
    }

    /*PRELOADER AND VIDEO SPOST CONTROLL*/
    function app_set_page_refresh() {
        app_set_interval('app-page-refresh', function() {
            app_reset();
            location.reload();
        }, 600000); //10 minuti
    }

    function app_set_spot_video() {

        let spot = config.spots;
        let position, order, count, items;
        let n = config.spots.group;
        if(config.module=='wall'){
            position = spot.module.wall.position[n].order;
            order = position.split(',');
            count = order.length;
        } else{
            position = spot.module.totem.position[n].order;
            order = position.split(',');
            count = order.length;
            items = spot.module.totem.items
        }
        if (spot.current == count) {
            spot.current = 0;
        }

        let videoToplay = items[order[spot.current]].filename;
        //console('Video items :', spot.items);
        app_print_debug('Video Order: ', order);
        app_print_debug('Video current : ', spot.current);
        app_print_debug('Set video URL : ', videoToplay);
        spot.current = spot.current + 1;

        return videoToplay;

    }

    function app_set_spot_loader() {
        
        app_set_interval('spot-start-loader', function() {

            let videoToplay = app_set_spot_video();
            let myVideo = document.getElementById("videoPlayer");
            videoToplay
            myVideo.src = APP_PATH.resolve(__dirname, '../../../assets/pubs/' + videoToplay);
            if (config.module == 'totem-map' || config.module == 'totem-programme') {
                myVideo.width = '1080';
                myVideo.height = '1920';
            }
            myVideo.play();
            app_reset();
            $('.bliwe-spot').fadeIn(function() {
                $('.bliwe-spot').addClass('active');
                app_set_timeout('spot-stop-loader', function() {
                    app_stop_spot_loader();
                }, 20000); //15 secondi
            });

        }, 60000); //normal set to 2 minuti
    }

    function app_stop_spot_loader() {
        if ($('.bliwe-spot').hasClass('active')) {
            $('.bliwe-spot').fadeOut('200', function() {
                let myVideo = document.getElementById("videoPlayer");
                myVideo.pause();
                $('.bliwe-spot').removeClass('active');
            });
        }
        app_set_spot_loader();
    }

    function app_click_spot_and_preloader() {
        app_set_spot_loader();
        app_set_page_refresh();
    }

    function app_set_preloader() {
        app_set_timeout('page-refresh', function() {
            $('.bliwe-preloader').fadeOut('200', function() {
                app_set_spot_loader();
                app_set_page_refresh();
            });
        }, 2000);
    }

    function app_set_buttonStop(){

        $('body').append('<div class="bliwe-close-app" style="z-index:1000;position: absolute;right: 0;width: 50px;height: 50px;bottom: 0;"></div>');

        $('.bliwe-close-app').on('click', function(){
            IPCRENDER.send('close-app');
        })
    }

    //EVENTS LISTENERS
    function set_events_listeners() {

        //stop refresch of page
        $(window).click(function(e) {
            app_click_spot_and_preloader();
            app_store_stats(e);
        });

        //stop refresch of page
        $('.bliwe-spot').click(function(e) {
            app_stop_spot_loader();
        });

    }

    function app_update_component(idTemplate, options) {
        
        let html = options.html;
        let fncallback = options.call_back;
        if (html) {
            if (options.reset === true) {
                $(idTemplate).html(html);
            } else {
                $(idTemplate).append(html);
            }
        }
        if (fncallback) {
            if (typeof fncallback === 'function') {
                fncallback();
            }
        }
    }

    function load_components(obj) {
        let html = '';
        let data = $(obj).data();
        let action = data.action;
        let callback = (data.callback) ? data.callback : null;
        let ctrlAction = null;
        let fn = null;
        let reponse = '';
        let call_back = null;
        let img = data.img;
        let video = data.video;
        if (action) {
            if (action.indexOf(".") >= 0) {
                ctrlAction = action.split('.');
                fn = AppSalon[ctrlAction[0]][ctrlAction[1]];
            } else {
                fn = AppSalon[action];
            }
            if (typeof fn === 'function') {
                reponse = fn(data);
                if (typeof reponse === 'object') {
                    html = reponse.html;
                    callback = reponse.call_back;
                } else {
                    html = reponse;
                }
            }
        }
        if (img) {
            let options = {
                src: img,
                class: data.class,
                style: data.style
            }
            html = app_render_template('img', options)
        }
        if (video) {
            if (data.path == 'app') {
                video = USER_DATA_PATH + '/AppData/pubs/' + video;
            }
            let options = {
                src: video,
                width: $(window).width(),
                height: $(window).height()
            }
            if (data.width) {
                options.width = data.width;
            }
            if (data.height) {
                options.height = data.height;
            }
            if (data.settings) {
                options.settings = data.settings;
            } else {
                options.settings = "loop muted control"
            }
            html = app_render_template('video-html5', options)
        }

        if (html) {
            $(obj).append(html)
        }

        if (callback) {
            if (typeof callback === 'function') {
                callback();
            }
        }


    }

    function set_app_view(app) {

        if ($('.appsalon-components').length) {
            $('.appsalon-components').each(function() {
                load_components($(this));
            });
        }

    }

    function set_app(app) {
        app.DateNow = get_date_now();
        app.GetData = app_get_json_data;
        app.RenderTemplate = app_render_template;
        app.UpdateComponent = app_update_component;
        app.GetAppToken = app_get_token;


        set_app_view(app);

        app.EventsManagerInit();

        if (app.module == 'totem-map') {
            app.TotemInit();
        }

        if (app.module == 'totem-map' || app.device.module == 'wall') {
            app.ExhibitorInit();
            app.ProgramInit();
        }

        if (app.module == 'totem-programme' || app.module == "totem-salle" || app.module == "totem-lab") {
            app.ProgramInit();
            app.ExhibitorInit();
        }

        if (config.map == true) {
            app_set_timeout('loadMap', function() {
                app.MapInit()
            }, 2000);
        }

        app_set_buttonStop();

    }

    function get_date_now() {
        let date = new Date();
        let time = date.getHours() + ':' + date.getMinutes();
        let day = date.getDate();
        let month = (date.getMonth() + 1);
        if (month < 10) { month = '0' + month }
        let year = date.getFullYear();
        let fulldate = year + '-' + month + '-' + day;
        let fulldate_time = year + '-' + month + '-' + day + ' ' + time;
        let now = {
            "time": time,
            "day": day,
            "month": month,
            "year": year,
            "fulldate": fulldate,
            "fulldate_time": fulldate_time,
        };
        
        if (config.debug == 'true') {
            return config.debug_val.DateNow;
        }
        return now;
    }

    function get_developper_data() {
        let getDevice = FS.readFileSync(config.data.developper);
        let data = JSON.parse(getDevice);
        return data;
    }

    function get_device_data() {

        if (APP_STORE.get('install') == 1) {
            let device = APP_STORE.get('device');
            return device;
        } else {
            let getDevice = FS.readFileSync(config.data.device);
            let data = JSON.parse(getDevice);
            return data.params;
        }

    }

    function get_app_module() {
        let data = get_device_data();
        return data.module;
    }

    return {

        //General data
        config: config,
        device: get_device_data(),
        module: get_app_module(),
        global: global,

        //Methods
        SetInterval: app_set_interval,
        SetTimeOut: app_set_timeout,
        FindInArray: app_find_on_array,
        DeleteOnArray: app_delete_on_array,
        RegisterResetFunction: app_register_reset_function,
        GetUrlParameterByName: app_get_url_parameter_by_name,
        PrintDebug: app_print_debug,
        GetElementInfos: app_get_elements_infos,
        StoreStats: app_store_stats,

        //Init function
        init: function(options) {

            //Inport device setting on config
            $.extend(true, this.config, get_device_data());

            //Inport developper setting on config
            $.extend(true, this.config, get_developper_data());

            //console.log(this.config);

            //Extends basic config with options
            $.extend(true, this.config, options);

            app_set_json_data(this);

            set_app(this);

            set_events_listeners();

            app_set_preloader();

            /*Bind plugins on hidden elements*/
            /*Tooltips*/
            $('[data-toggle="tooltip"]').tooltip();

            /*Popover*/
            $('[data-toggle="popover"]').popover();

            /*Bootstrap modal scroll top fix*/
            $('.modal').on('show.bs.modal', function() {
                $("html").addClass('bliwe-appsalon-modal-open');
            });

            $('.modal').on('hidden.bs.modal', function() {
                $("html").removeClass('bliwe-appsalon-modal-open');
            });

            app_print_debug('AppSalon is ready : ');
            app_print_debug(this);
        }

    };

})(jQuery);