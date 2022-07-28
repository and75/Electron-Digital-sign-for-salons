(function (that) {
    
    that.AdvSimpleRotateBanners = function () {

        function rotateBanners(elem) {
            var active = $(elem + " div.item.active");
            var next = active.next();
            if (next.length == 0)
                next = $(elem + " div.item:first-child");
            active.removeClass("active").hide();
            next.addClass("active").show();
        }

        function prepareRotator(elem) {
            $(elem + " div.item").hide();
            $(elem + " div.item:first-child").fadeIn(0).addClass("active");
        }

        function startRotator(elem) {
            prepareRotator(elem);
            setInterval(function(){
                rotateBanners(elem);
            }, 16000);
        }

        if($('.bliwe-banners.bliwe-banner-zone-1 div.item').length>0){
            startRotator('.bliwe-banners.bliwe-banner-zone-1');
        }
    }

    that.AdvInit = function () {
        that.AdvSimpleRotateBanners();
        that.PrintDebug('that.Banners is ready !');
    }

})(AppSalon);