$(function() {
    var options = {
        salle_name: '',
        from_salle: '',
        map: true,
        modal: false,
        map_setting: {
            minZoom: 1,
            maxZoom: 4,
            center: [-112, 117],
            zoom: 1.75,
            touchZoom: false,
            scrollWheelZoom: true,
            doubleClickZoom: true,
            dragging: true,
            img: {

                planWidth: 1880,
                planHeight: 1886.7
            }
        }
    };
    AppSalon.init(options);
    AppSalon.TotemInit();
    AppSalon.TotemMapExt.init();
});