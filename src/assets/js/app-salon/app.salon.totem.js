(function (that) {
	
	that.setPubTotem = function(){
		that.GetData
	}

	that.TotemGoTo = function (url){
		window.location.href = url;
	}
	
	that.TotemScrollElement = function(elem, move){
		let body =  $('body').hasClass('map');
		let element = $('.'+elem );
		let parent = element.parent();
		let parentPos = parent.scrollTop();

		if(move=='up' && Math.abs(parentPos)<= $('.'+elem).height()){
			position = parentPos+500;
		}
		if(move=='down'){
			position = parentPos-500;
		}
		parent.stop().animate({scrollTop:position}, 500, 'swing');

	}
	
	that.TotemSetKeyboard = function(obj, identifiant='.simple-keyboard-percour'){
        $(identifiant).jkeyboard({
            input: obj,
            layout : 'numbers_only'
        });
        $(identifiant).addClass('active');
        $(identifiant+' .jkeyboard-close').click(function() {
           that.TotemCloseKeyboard(identifiant);
        });
        
	}
	
    that.TotemCloseKeyboard = function (identifiant='.simple-keyboard-percour') {
        $(identifiant).removeClass('active');
    }
	
	that.setMenuTotem = function (data){
		let map = null;
		let map_pannel = null;
		let map_active = null;
		let exibitor = null;
		let programme = null;
		let programme_active = null;
		let salle = null;
		let salle_active = null;
		let parcour = null;
		let parcour_active = null;
		let programme_parcour = null;
		let modal = null;
		
		let module = AppSalon.config.module;
		if(data.type=='salle'){
			map = true;
		}

		if(data.type=='totem'){
			programme = true;
			programme_parcour=true;
			map_pannel=true;
			map_active = true;
			if(that.GetUrlParameterByName('exhib')){
				parcour_active = true;
				map_active = false;
			}
			if(module=='totem-salle'){
				programme = false;
				salle=true;
				salle_active = false;
			}
		}
		
		if(data.type=='programme'){
			programme=true;
			map=true;
			programme_active = true;
			parcour = true;
		}
		
		if(data.type=='salle'){
			salle=true;
			salle_active = true;
			programme=false;
			map=true;
			parcour = true;
		}

		if(data.type=='modal'){
			modal = true;
			salle = true;
			parcour = true;
			if(that.config_module=='programme'){
				salle = false;
				programme=true;
			}
		}
		let options = {
			type : data.type,
			map : map,
			map_active:map_active,
			map_pannel: map_pannel,
			programme: programme,
			programme_active: programme_active,
			exibitor : exibitor, 
			salle : salle,
			salle_active : salle_active,
			parcour : parcour,
			parcour_active : parcour_active,
			programme_parcour : programme_parcour,
			modal:modal
		}
		return that.RenderTemplate('totem-menu', options);
	
	}
	
	that.TotemSetMapMenu = function(data){
		let reponse = {
				"html" : that.RenderTemplate('map-menu'),
		};
		return reponse;
	}
	
	that.TotemSetMarker = function (number){
		//Set value for remeber marker
		APP_STORE.set('percour-items', number);
	
		if(!number || number==0){
			$('.bliwe-percours-marker').removeClass('active');
		}
		else{
			$('.bliwe-percours-marker').addClass('active');
			$('.bliwe-percours-marker').html(number);
		}
		
	}
	
	that.TotemSetMess = function(mess='', error= null){
		var type = 'text-success';
		if(error){
			type = 'text-danger';
		}
		
		$('.bliwe-percour-panel .form-message')
        .addClass('active '+type)
        .html(mess);
		
        that.SetTimeOut('percour-form-message', function(){
       	 	$('.bliwe-percour-panel .form-message').removeClass('active '+type);
        }, 5000);
        return false;
	}
	
	that.TotemUnsetPercourItem =function (stand, exhib){

		that.global.exposantsParcours = that.DeleteOnArray(that.global.exposantsParcours, stand, 'stand-id');
		that.global.standParcours = that.DeleteOnArray(that.global.standParcours, stand);
		that.TotemSetMarker(that.global.standParcours.length);
		
		$('.bliwe-table-percour li#'+exhib).remove();
		if($('.bliwe-percour-panel .tbe-body li').length==0){
			$('.bliwe-table-percour .tbe-message').html("Aucun exposant n'a été ajouté"); 
		};
		
		APP_STORE.set('exposantsParcours', that.global.exposantsParcours);
		APP_STORE.set('standParcours', that.global.standParcours);
		
	}
	
	that.TotemSetPercourItem = function(stand, exhib){
		
		var data = that.GetData('exposants', 'exposants', false);
	
		if(!that.FindInArray(that.global.exposantsParcours, stand, 'stand-id')){
			
			that.global.exposantsParcours.push(data[exhib]);
		}
		
		that.TotemSetPercourPanel(null, that.global.exposantsParcours, false);
		
		if(!that.FindInArray(that.global.standParcours, stand)){
			that.global.standParcours.push(stand);
		}
		that.TotemSetMarker(that.global.standParcours.length);
		
		APP_STORE.set('exposantsParcours', that.global.exposantsParcours);
		APP_STORE.set('standParcours', that.global.standParcours);

	}
	
	that.TotemPercourReset = function(){
		that.SetTimeOut('percour-form-message', function(){
			that.TotemReset();
        }, 6000);
	}
	
	that.TotemSendPercour = function(){
		var error = null;
		var mess= '';
		var settedStand = that.global.standParcours;
		var list = settedStand.toString();
		var url = that.config.services.sendPercours.url;
		
		//Get phone number
		var phone = $('input.phone-number').val();
        phone = phone.trim();
       
        if (!phone || settedStand.length==0) {
            error = true
            if (settedStand.length==0) mess += 'Vous devez sélectionner des exposants!<br>';
            if (!phone) mess += 'Telephone number required!<br>';
        }
        
		var token = that.GetAppToken();
	    var data ={
	    			phone : phone,
	    			url   : that.config.services.sendPercours.mapUrl+list, 
	    			token : token
	    };
		
        if(error){
        	that.TotemSetMess(mess, error);
        	that.TotemCloseKeyboard();
        	return false;
        }
       
        $.ajax({
            type: "POST",
            url: url,
            data: data,
            beforeSend : function(){},
            success: function(response) {
                that.TotemSetMess('Message sent correctly');
                that.TotemPercourReset();
            },
            fail: function(xhr, status, error) {
                print_debug("Ajax request failed to " + url + "<br>Status: " + xhr.status + " (" + status + "), Error: " + error);
                that.TotemSetMess("Error send sms", true);
            }
        });
		
	}
	
	that.TotemSetPlanMenu = function(data){
		var parts = '';
		var reponse = {
			"html" : that.RenderTemplate('totem-panel-menu'),
		};
		return reponse;
	}

	that.TotemLoadFilter = function(){
		$(".bliwe-expo-multifilter .filter-content").css({"right":"15px"});
	}
	
	that.TotemCloseFilter = function(){
		that.SetTimeOut('Totem-close-filter', function(){
			/*$( ".bliwe-expo-multifilter .filter-content" ).animate({
				right: "-100vw"
			  }, 500, function() {
				// Animation complete.
			  });*/
			  $( ".bliwe-expo-multifilter .filter-content" ).css({right: "-100vw"});
		}, 600);
		$( ".bliwe-expo-multifilter .filter-content" ).css({right: "-100vw"});
	}
	
	that.TotemLoadPage = function(page){
		$(".bliwe-totem-menu li").removeClass('active');
		$(".bt-totem-menu-"+page).addClass('active');
		$(".module-content-left").addClass('open');
		$(".bliwe-slide-content").removeClass('active');
		$(".bliwe-slide-content."+page).addClass('active');
		$(".module-content-left").css({"left":"0",});
		$(".module-content-main").css("left","1080px");

	}
	
	that.TotemClosePage = function(page){
		$(".module-content-left").removeClass('open');
		$(".module-content-left").css({"left":"-1080px",});
		$(".module-content-main").css("left","0");
		that.SetTimeOut('totem-close-page', function(){
		  $(".bliwe-slide-content").removeClass('active');
		  $(".bliwe-totem-menu li").removeClass('active');
		  $(".bt-totem-menu-map").addClass('active');
		}, 500);
	}
	
	that.TotemSetPercourPanel = function(data, exhibitors= null, is_components= true){
		var parts = '';
		var mess= '';
		var list = null;

		if(!exhibitors){
			mess= "<div>Aucun exposant n'a été ajouté</div>";
		} else {
			list = Object.assign({}, exhibitors);
			list = Object.values(list);
		}

		var options = {
	        	"title" : false,
	        	"filter_alfa":false,
	        	"exhibitors" : list,
	        	"hasspercour":true,
	        	"message" : mess
	    }
	
		var reponse = {
			"html" : that.RenderTemplate('totem-percour-panel', options),
			"call_back" : function(){
				AppSalon.TotemSetKeyboard($('.form-control.phone-number'), '.simple-keyboard-percour');
			} 
		};
		
		if(is_components){
        	return reponse;
        } else{
        	$('.bliwe-percour-panel').html(' ');
			$('.bliwe-percour-panel').html(reponse.html);
			AppSalon.TotemSetKeyboard($('.form-control.phone-number'), '.simple-keyboard-percour');
		}
		
	}
	
	that.TotemReset = function(){
		
       	that.TotemClosePage();
       	that.TotemSetMarker(null);
       	that.global.exposantsParcours = [];
 		that.global.standParcours = [];
 		that.TotemSetPercourPanel(null, null, true);
		that.global.exposantsParcours = [];
		that.global.standParcours = [];
		
		//Reset store data
		APP_STORE.set('percour-items', null);
		APP_STORE.set('standParcours',null);
		APP_STORE.set('exposantsParcours',null);
	
	}
	
	that.TotemInit = function(){
		
		/*var marker = APP_STORE.get('percour-items');
		var exposantsParcours = APP_STORE.get('exposantsParcours');
		var standParcours = APP_STORE.get('standParcours');*/
		var is_exhib = that.GetUrlParameterByName('exhib');

		that.PrintDebug('is_exhib', true);
		
		/*if(exposantsParcours) that.global.exposantsParcours = exposantsParcours;
		if(standParcours) that.global.standParcours = standParcours;*/
		
		/*if(marker && marker>0){
			that.TotemSetMarker(marker);
			that.TotemSetPercourPanel(null, exposantsParcours, false);
		}*/
		
		if(is_exhib){
			that.TotemLoadPage('exposant-list');
		}
				
		//Register library action for reset map
		that.RegisterResetFunction(that.TotemReset);
		
	}	

})(AppSalon);