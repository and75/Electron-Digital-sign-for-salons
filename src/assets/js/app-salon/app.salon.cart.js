(function (that) {

	that.CartReset = function () {

		that.TotemCloseKeyboard();
		that.TotemClosePage();
		that.TotemSetMarker(null);
		that.global.exposantsParcours = [];
		that.global.standParcours = [];
		that.CartSetPercourPanel(null, null, true);
		that.global.exposantsParcours = [];
		that.global.standParcours = [];

		//Reset store data
		APP_STORE.set('percour-items', null);
		APP_STORE.set('standParcours',null);
		APP_STORE.set('exposantsParcours',null);

	}

	that.CartSearchExhibitors = function (key, value) {

		var list_return = [];
		var message = '';
		var exposants_list = that.GetData( 'exposants', 'exposants');

		$.each(exposants_list, function (i, v) {
			var finded = null;
			if (typeof v[key] === 'object' || typeof v[key] === 'array') {

				$.each(v[key], function (i2, v2) {
					if (v2['id'] == value) {
						finded = true;
					}
				});
			} else {
				var searchVal = new RegExp(value, "i");
				if (v[key].search(searchVal) == 0) {
					finded = true;
				}
			}
			if (finded == true) {
				list_return.push(v);
			}
		});

		if (list_return.length > 0) {
			return list_return;
		} else {
			return null;
		}

	}

	that.CartSetMarker = function (number) {

		//Set value for remeber marker
		APP_STORE.set('percour-items', number);

		if (!number || number == 0) {
			$('.bliwe-cart-marker').removeClass('active');
		}
		else {
			$('.bliwe-cart-marker').addClass('active');
			$('.bliwe-cart-marker').html(number);
		}

	}

	that.CartSetPannel = function (data, container) {
			that.RenderTemplate('cart-pannell', data, container);
	}

	that.CartTempVisite = function(){
		var exhibs_length =  that.global.exposantsParcours.length;
		var total = exhibs_length*20;
		return total;
    }

	that.CartSetPercourItem = function (stand, exhib, from_app = true) {
		if (!that.global.idVisiteur) {
			$('#bliwe-modal').modal();
			return;
		}

		if (!that.FindInArray(that.global.exposantsParcours, exhib, 'id')) {
			var data = that.GetData( 'exposants', 'exposants', false);
			var origin = data['exp_' + exhib]['origin'];
			that.global.exposantsParcours.push(data['exp_' + exhib]);
			that.MapAddMarker(stand);
		}

		that.CartSetPercourPanel(null, that.global.exposantsParcours, false);

		if (!that.FindInArray(that.global.standParcours, exhib, 'id')) {
			var selected = {
				'id': exhib,
				'stand-id': stand,
				'origin': origin
			};
			that.global.standParcours.push(selected);
		}
	
		that.CartSetMarker(that.global.standParcours.length);
		var temps_visite = that.CartTempVisite();
		$('.bliwe-temp-visite span.time').html(temps_visite);
		
		if(from_app){
			that.CartSentToOrigin();
		}


	}

	that.CartUnsetPercourItem = function (stand, exhib, from_app= true) {
		
		that.global.exposantsParcours = that.DeleteOnArray(that.global.exposantsParcours, stand, 'stand-id');
		that.global.standParcours = that.DeleteOnArray(that.global.standParcours, exhib, 'id');
		that.CartSetMarker(that.global.standParcours.length);
		that.MapRemoveMarker(stand);
		
		var temps_visite = that.CartTempVisite();
		$('.bliwe-temp-visite span.time').html(temps_visite);

		$('.bliwe-percour-panel tr#exp_' + exhib).remove();
		
		if ($('.bliwe-percour-panel table tbody tr').length == 0) {
			$('.bliwe-percour-panel table').remove();
			$('.bliwe-percour-panel .bliwe-form-sms').remove();
			$('.bliwe-percour-panel .message').html("Aucun exposant n'a été ajouté");
		};
		
		if(from_app){
			that.CartSentToOrigin();
		}

	}

	that.CartSetPercourPanel = function (data, exhibitors = null, is_components = true) {

		var parts = '';
		var mess = '';
		var list = null;

		if (!exhibitors) {
			mess = "Aucun exposant n'a été ajouté";
		} else {
			list = Object.assign({}, exhibitors);
			list = Object.values(list);
		}

		var options = {
			"title": false,
			"filter_alfa": false,
			"exhibitors": list,
			"hasspercour": true,
			"message": mess,
			"tempVisite" : that.CartTempVisite()
		}

		var template = that.global.cartTemplates['cart-percour-panel'];
		Mustache.parse(template);
		var html = Mustache.render(template, options);

		var reponse = {
			"html": html,
		};

		if (is_components) {
			return reponse;
		} else {
			$('.bliwe-percour-panel').html(' ');
			$('.bliwe-percour-panel').html(reponse.html);
		}

	}

	that.CartSetMess = function (mess = '', error = null) {
		var type = 'text-success';
		if (error) {
			type = 'text-danger';
		}

		$('.bliwe-percour-panel .form-message')
			.addClass('active ' + type)
			.html(mess);

		that.SetTimeOut('percour-form-message', function () {
			$('.bliwe-percour-panel .form-message').removeClass('active ' + type);
		}, 5000);
		return false;
	}

	that.CartSentToOrigin = function () {

		var error = null;
		var mess = '';
		var url = that.config.services.origin.register;
		var settedStand = that.global.standParcours;
		var idVisiteur = that.global.idVisiteur;

		//Get exhibtors
		var e = '';
		$.each(settedStand, function (k, v) {
			e += v.origin + '_';
		});


		//Ajax data
		var data = {
			v: idVisiteur,
			e: e
		};

		$.ajax({
			type: "GET",
			url: url,
			data: data,
			beforeSend: function () { },
			success: function (response) {
				//console.log('Origin sended correct!')
			},
			fail: function (xhr, status, error) {
				print_debug("Ajax request failed to " + url + "<br>Status: " + xhr.status + " (" + status + "), Error: " + error);
				console.log('Origin not sended correct!')
			}
		});
	}

	that.CartSendPercour = function () {

		var error = null;
		var mess = '';
		var settedStand = that.global.standParcours;
		var url = that.config.services.sendPercours.url;

		//Get phone number
		var phone = $('input.phone-number').val();
		phone = phone.trim();
		if (!phone || settedStand.length == 0) {
			error = true
			if (settedStand.length == 0) mess += 'Vous devez sélectionner des exposants!<br>';
			if (!phone) mess += 'Telephone number required!<br>';
		}

		//Get token
		var token = that.GetAppToken()

		//Get origin
		var origin = '';
		$.each(settedStand, function (k, v) {
			origin += v.origin + '_';
		});

		//Get path for sms
		var path = '?v=' + Base64.encodeURI(phone) + '&e=' + origin;
		
		//Ajax data
		var data = {
			phone: phone,
			url: that.config.services.sendPercours.mapUrl + path,
			token: token
		};

		if (error) {
			that.CartSetMess(mess, error);
			that.TotemCloseKeyboard();
			return false;
		}

		$.ajax({
			type: "POST",
			url: url,
			data: data,
			beforeSend: function () { },
			success: function (response) {
				that.CartSetMess('Message sent correctly');
				that.TotemPercourReset();
			},
			fail: function (xhr, status, error) {
				print_debug("Ajax request failed to " + url + "<br>Status: " + xhr.status + " (" + status + "), Error: " + error);
				that.CartSetMess("Error send sms", true);
			}
		});

	}

	that.CartInit = function () {

		//Register library action for reset map
		that.RegisterResetFunction(that.CartReset);
		that.PrintDebug('that.Cart is ready !');

	}

})(AppSalon);