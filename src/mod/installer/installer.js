$(function () {
    var progressVal=0;
    function progress(increment) {
        var maxprogress = 100; // when to leave stop running the animation
        progressVal += increment;
        if (progressVal <= maxprogress) {
            $(".progress-bar")
            .animate({
                "width": "+="+progressVal+"%"
            }, {
                duration: 250,
                easing: 'linear'
            });
        }
    }
    //Basic Config
    $('#install-action').click(function () {
        if($(this).hasClass('installed')){
            IPCRENDER.send('go-to-device-settings');
        } else {
            IPCRENDER.send('launch-installer');
        }

    })
    $('#install-cancel').click(function () {
        IPCRENDER.send('close-all-windows');
    })
    IPCRENDER.on('reply-installer', (event, res) => {
        console.log(res);
        $('#install-action').attr('disabled', true);
        if (res.step == 0) {$('.progress-bar').show();}
        $('#install-report .step-' + res.step).append('<div class="text-' + res.type + '">' + res.mess + '</div>');
        if(res.type=="white" && res.step<4){progress(25)};
        if (res.step == 4){
            $('#install-action').removeAttr('disabled')
                .html('Device settings')
                .removeClass('btn-primary')
                .addClass('btn-success installed');
            $(".progress-bar").removeClass('progress-bar-striped progress-bar-animated');
            $(".progress-bar").addClass('progress-bar-success');
        }
   
    })
});