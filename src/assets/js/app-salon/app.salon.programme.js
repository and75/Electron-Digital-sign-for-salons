const { data } = require("jquery");

(function(that) {

    that.ProgramCtrlResult = function(search) {
        $(".bliwe-sroller-container").scrollTop(0);
        let ctrl = $(".bliwe-program-card" + search).length;
        if (ctrl == 0) {
            $(".bliwe-program-message").addClass("active");
        } else {
            $(".bliwe-program-message").removeClass("active");
        }
    }
    that.ProgramGoToDayOne = function(day) {
        var search_day = '.DAY-' + day;
        that.PrintDebug('Search Day : ' + search_day);
        that.global.settDay = search_day;
        var filter = that.global.settFilter;
        var search = search_day + filter;
        var cssClass = $(this).data("class");
        $(".menu-days-item").removeClass('active')
        $(".menu-days-item" + search_day).addClass('active')
        $(".bliwe-program-card").hide();
        $(".bliwe-program-card" + search).show();
        that.ProgramCtrlResult(search);

    }

    that.ProgramSetFilter = function(filter) {
        var day = that.global.settDay;
        filter = '.' + filter;
        that.global.settFilter += filter;
        var search = day + filter;
        $(".bliwe-program-card").hide();
        $(".bliwe-program-card" + search).show();
        that.ProgramCtrlResult(search);
    }

    that.ProgramCloseFilter = function() {
        $('#collapseOne').collapse('toggle');
    }

    that.ProgramCloseModal = function() {
        $('#program-modal').modal('hide');
    }

    that.ProgramSetFilterElement = function(filter) {
        var day = that.global.settDay;
        filter = '.' + filter;
        that.global.settFilter = filter;
        var search = day + filter;
        that.PrintDebug('ProgramSetFilterElement search : ' + search);
        $(".bliwe-program-card").hide();
        $(".bliwe-program-card" + search).show();
        that.ProgramCtrlResult(search);
    }

    that.ProgramShowBox = function(id) {
        var modal_content = null;
        var conferences = that.GetData('programme', 'conferences', true);
        var img_path = that.config.img.system_path;

        if (conferences) {
            conferences.forEach(function(val) {
                if (val['id'] == id) {
                    val['img_path'] = img_path;
                    if (val['intervenants'].length) {
                        val['ctrlIntervenant'] = true;
                    }
                    if (val['partenaires'].length) {
                        val['ctrlPartenaires'] = true;
                    }
                    that.PrintDebug('Conference val', val);
                    modal_content = that.RenderTemplate('program-modal', val);
                }
            });
        }
        if (modal_content) {
            $('#program-modal .modal-content').html(modal_content);
            $('#program-modal').modal();
        }
    }

    that.ProgramShowLabBox = async function(id) {
        let options = {};
        let modal_content = null;
        let stpContent = "";
        let startups = await that.ExhibFilterExhibitors('hostedBy', id, true);
        var img_path = that.config.img.system_path;
        let key = Math.floor(Math.random() * startups.length);
        let hiline = [startups[key]];
        delete startups[key];
        if (hiline) {
            options.img_path = img_path;
            options.hiline = hiline;
            options.secteurs = [];
            hiline.forEach(function(v, i) {
                if (v && v.hasOwnProperty("secteur")) {
                    for (const [key, value] of Object.entries(v.secteur)) {
                        options.secteurs.push("#" + value.libelle + " ");
                    }
                }
            });
            if (startups) {
                startups.forEach(function(v, i) {
                    stpContent += '<li class="list-inline-item">' + v.label + '</li>';
                });
                options.startups = stpContent;
                modal_content = that.RenderTemplate('lab-modal', options);
            }

        }

        if (modal_content) {
            $('#program-modal .modal-content').html(modal_content);
            $('#program-modal').modal();
        }
        AppSalon.SetTimeOut('labs', function() { $('#program-modal').modal('hide') }, 15000);
    }

    that.ProgramResetFiltre = function() {
        let day = that.global.settDay;
        let search = day;
        that.global.settFilter = '';
        $(".bliwe-program-card").hide();
        $(".bliwe-program-card" + search).show();
        that.ProgramCtrlResult(search);

    }

    that.ProgramSetMenuDay = function(data) {
        var html = "";
        var items = "";
        var days = that.config.programme.days;

        days.forEach(function(val) {
            var options = {
                num: val.num.trim(),
                label: val.label.trim()
            }
            items += that.RenderTemplate('parts/menu-day-item', options);
        })
        if (items) {
            var options = {
                items: items
            }
            html = that.RenderTemplate('program-menu-day', options);
            return html
        }
    }

    that.ProgramSetFilterType = function(data) {

        var parts = "";
        var html = "";

        json = that.GetData('programme', null, false);
        data = json['conference_type_filtre'];

        data.forEach(function(val) {
            parts += that.RenderTemplate('parts/conference-type-item', val);
        });

        if (parts) {
            var options = {
                items: parts
            }
            html = that.RenderTemplate('program-filter-type', options);
            return html
        }

    }

    that.ProgramSetFilterAccordeon = function(data) {

        var html = "";
        var programme = that.GetData('programme', null, false);
        var options = {
            "types": {
                "location": true,
                "type": true,
                "themes": true,
                "profil": false,
                "parcours" : true,
                "partenaires":true
            },
            "items": {
                "type": programme.conference_type_filtre,
                "thematique": programme.thematique_filtre,
                "location": programme.location_filtre,
                "profil": programme.profil_filtre,
                "parcours": programme.parcours_filtre,
                "profil": programme.profil_filtre,
                "partenaires" : programme.partenaire_filtre
            }
        }
        html = that.RenderTemplate('program-filter-accordeon-2', options);
        return html

    }

    that.ProgramSetList = function(data) {

        let salleId = that.config.salle.id;
        let salleName = that.config.salle.name;
        //console.log(salleName);
        var programItems = "";
        var nextOne = "";
        var html = "";
        let dateNow = new Date(that.DateNow.fulldate_time).getTime();
        //that.PrintDebug('dateNow', dateNow);

        var conferences = that.GetData('programme', 'conferences');

        if (conferences) {
            let count = 1;
            conferences.forEach(function(val, index) {
                let ctrlDate = new Date(val.date_fin_en).getTime();
                //that.PrintDebug('ctrlDate', ctrlDate);
                if (ctrlDate >= dateNow) {
                    val.isFirst = false;
                    val.ctrlIntervenants = null;
                    val.ctrlPartenaires = null;
                    val.ctrlMission = null;
                    val.img_path = that.config.img.system_path;
                    if (val.intervenants && val.intervenants.length > 0) {
                        val.ctrlIntervenants = true;
                    }
                    if (val.partenaires && val.partenaires.length > 0) {
                        val.ctrlPartenaires = true;
                    }
                    if (val.mission && val.mission.length > 0) {
                        val.ctrlMission = true;
                    }
                    if (data.context == "salle" && salleId) {
                        if (val.day == that.DateNow.fulldate && val.salle_id == salleId) {
                            if (val.societe) {
                                val.logo = val.societe + '.jpg';
                            }
                            if (count == 1) {
                                val.isFirst = true;
                                nextOne = that.RenderTemplate('parts/program-item-salle', val);
                                if (that.config.module == 'totem-lab') {
                                    AppSalon.SetInterval('labs', function() { that.ProgramShowLabBox(val.societe) }, 30000);
                                }
                            } else {
                                programItems += that.RenderTemplate('parts/program-item-salle', val);
                            }
                            count++;
                        }
                        if (!nextOne) {
                            nextOne = that.RenderTemplate('parts/program-item-null', that.config.salle);
                        }
                    } else {
                        programItems += that.RenderTemplate('parts/program-item', val);
                    }
                }
            });
        }

        var options = {
            "nextOne": nextOne,
            "programItems": programItems
        }

        if (data.context == 'salle') {
            html = that.RenderTemplate('program-list-salle', options);
        } else {
            html = that.RenderTemplate('program-list', options);
        }

        return html;
    }

    that.ProgramReset = function() {
        that.ProgramResetFiltre();
        $('#program-modal').modal('hide');

        let options = {};
        if (AppSalon.config.module == 'totem-salle') {
            options.context = 'salle'
        }
        that.ProgramSetList(options);
    }

    that.ProgramInit = function(options) {

        var marker = APP_STORE.get('percour-items');
        
        that.ProgramGoToDayOne(that.DateNow.day);

        if (marker && marker > 0) {
            that.TotemSetMarker(marker);
        }

        if (AppSalon.config.module != 'totem-salle') {
            //AppSalon.SetInterval('labs', that.ProgramShowLabBox(), 10000);
        }

        //Register library action for reset map
        that.RegisterResetFunction(that.ProgramReset);
        that.PrintDebug('that.Program is ready !');

    };

})(AppSalon);