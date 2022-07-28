$(function() {
    //Basic Config
    var options = {
        salle_name: '',
        from_salle: '',
        map: true,
        modal: false,
        map_setting: {
            minZoom: 1,
            maxZoom: 4,
            center: [-90, 115],
            zoom: 2.748,
            touchZoom: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            dragging: false,
            img: {
                //planWidth: 2154,
                // planHeight: 2160.7,
                planWidth: 1880,
                planHeight: 1886.7
            }
        }
    };

    AppSalon.init(options);

    AppSalon.PlanXlExt.init();

});