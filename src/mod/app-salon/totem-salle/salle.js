/* 
 * You can extend the App modular structure easily by creating your own modules like this:
 * Vous pouvez facilement étendre l'application de structure modulaire en créant vos propres modules, comme ceci:
 */
$(function(){
    //Basic Config
    var options = {
        map : false,
    };
    AppSalon.init(options);
    AppSalon.SalleExt.init();
});