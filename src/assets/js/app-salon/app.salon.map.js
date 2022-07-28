(function(that) {

    that.MapLoadIndicator = function() {

        $('.bliwe-map-indicator').show();
        that.SetTimeOut('map_indicator', function() {
            $('.bliwe-map-indicator').fadeOut();
        }, 3000)

    }

    that.MapReset = function() {

    }

    that.MapShowStand = function(stand) {

        that.global.map.closePopup();
        that.MapLoadIndicator();
        that.global.mapSearch.searchText(stand);
        that.SetTimeOut('time-out-showExp', function() {
            if (document.getElementsByClassName("search-tip") && document.getElementsByClassName("search-tip")[0]) {
                var element = document.getElementsByClassName("search-tip")[0];
                element.click();
                var elementInput = document.getElementsByClassName("search-input")[1];
                elementInput.blur();
            }
        }, 700);
    }

    that.MapReset = function() {
        that.global.map.closePopup();
        that.global.map.setView(that.config.map_setting.center)
    }

    that.MapInit = function() {

        var config = that.config;
        var global = that.global;
        var myFeatureGroup;
        const exposant = that.GetData('exposants', "exposants", false);

        function get_stands_list(key = null, ret_array = true) {
            var json = that.GetData('stands', key, ret_array);
            return json;
        }

        function get_exposants_data() {
            var json = that.GetData("exposants", "exposants", false);
            return json;
        }

        function get_exposant_detail(search) {

            var data = exposant;
            var finded = [];

            if (search.length == 1) {
                finded = data['exp_' + search[0].id];
            } else if (search.length > 1) {
                $.each(search, function(i, v) {
                    finded[i] = data['exp_' + v.id];
                });
            }

            return finded
        }

        //PREPARE STANDS !!AFTER MAP INIT!!
        function set_stand() {

            $.each(get_stands_list(), function(k, v) {

                var position = null;

                if (v.areaposition && v.areaposition.length > 0) {
                    var position = JSON.parse(v.areaposition);
                }

                if (position && position[0].length > 0) {

                    var dataPolygon = [];

                    //Handle click on polygon
                    var onPolyClick = function(event) {
                        var stand = event.target.options.Name;
                        if (event.target.options.stats) {
                            that.StoreStats(null, event.target.options.stats);
                        }
                    };

                    position[0].forEach(element => {
                        dataPolygon.push([element.lat, element.lng]);
                    });
                    var contenu = null;
                    var optionContent = {
                        standsName: v.label,
                        exposants: get_exposant_detail(v.exposants),
                        img_path: that.config.img.system_path
                    }
                    if (v.exposants.length == 1) {
                        contenu = that.RenderTemplate('map-popup-single', optionContent);
                    } else if (v.exposants.length > 1) {
                        contenu = that.RenderTemplate('map-popup-multi', optionContent);
                    }

                    var color = '',
                        fillColor = '',
                        opacity = 0;

                    if (that.config.debug_val.show_poligon) {
                        var color = '#06ff3f';
                        var fillColor = '#06ff3f';
                        var opacity = 0.5;
                    }

                    var exp = L.polygon(dataPolygon, {
                        Name: v.id,
                        color: color,
                        fillColor: fillColor,
                        fillOpacity: opacity,
                        stats: { "origin": "map", "action": 'schow-on-map', "search": "stand_" + v.id }

                    }).addTo(myFeatureGroup).bindPopup(
                        contenu, {
                            maxWidth: '100%',
                            closeOnClick: false,
                            autoClose: true,
                            keepInView: true
                        }
                    ).on('click', onPolyClick).on("popupclose", function(e) {
                        global.map.setView(that.config.map_setting.center)
                    });
                }

            });

        }

        function map_custom_tip(text, val) {
            return '<a href="#">' + text + '<em style="background:' + text + '; width:14px;height:14px;float:right"></em></a>';
        }

        //PREPARE MAP VIEW
        function set_map() {

            //Using leaflet.js to pan and zoom a big image.
            //See also: http://kempe.net/blog/2014/06/14/leaflet-pan-zoom-image.html
            //create the slippy map
            global.map = L.map(config.map_setting.mapId, {
                crs: L.CRS.Simple,
                minZoom: config.map_setting.minZoom,
                maxZoom: config.map_setting.maxZoom,
                center: config.map_setting.center,
                zoom: config.map_setting.zoom,
                zoomSnap: config.map_setting.zoomSnap,
                zoomDelta: config.map_setting.zoomDelta
            });

            var w = config.map_setting.img.planWidth,
                h = config.map_setting.img.planHeight,
                url = config.map_setting.img.plan; //'fond_old1.jpg';

            //calculate the edges of the image, in coordinate space
            var southWest = global.map.unproject([0, h], global.map.getMaxZoom() - 1);
            var northEast = global.map.unproject([w, 0], global.map.getMaxZoom() - 1);
            var bounds = new L.LatLngBounds(southWest, northEast);

            //add the image overlay,
            //so that it covers the entire map
            L.imageOverlay(url, bounds).addTo(global.map);

            if (config.map_setting.setMaxBounds == true) {
                //tell leaflet that the map is exactly as big as the image
                global.map.setMaxBounds(bounds);
            }

            if (config.map_setting.touchZoom == false) {
                global.map.touchZoom.disable();
            }

            if (config.map_setting.doubleClickZoom == false) {
                global.map.doubleClickZoom.disable();
            }

            if (config.map_setting.scrollWheelZoom == false) {
                global.map.scrollWheelZoom.disable();
            }

            if (config.map_setting.dragging == false) {
                global.map.dragging.disable();
            }

            //Add Marker Position
            L.marker(config.position).addTo(global.map);

            myFeatureGroup = new L.LayerGroup();
            global.map.addLayer(myFeatureGroup);

            global.mapSearch = new L.Control.Search({
                position: 'topright',
                layer: myFeatureGroup,
                initial: false,
                propertyName: 'Name',
                buildTip: that.customTip,
                marker: false,
                moveToLocation: function(latlng, title, map) {
                    //map.setView(new L.LatLng(lat,lon), 9 );   // set the zoom
                    //map.panTo(new L.LatLng(0, 0));
                }
            }).on('search:locationfound', function(e) {
                e.layer.openPopup();
            });

            global.map.addControl(global.mapSearch);

            set_stand();

            //ZOOM BTM
            $('.bliwe-map-menu li a').click(function(e) {
                e.preventDefault();
                var zoom = $(this).data('zoom');
                global.map.setView(config.map_setting.center, zoom, { 'reset': true });
            });

        }

        //Set the map
        set_map();

        //Register library action for reset app
        that.RegisterResetFunction(that.MapReset);

        that.PrintDebug('that.Map is ready !');

    }

})(AppSalon);