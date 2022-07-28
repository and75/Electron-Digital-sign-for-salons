(function (that) {


	that.InstallSetKeyboard = function (obj, identifiant) {
		if (identifiant == undefined) {
			identifiant = '.simple-keyboard-percour';
		}

		$(identifiant).jkeyboard({
			input: obj,
			layout: 'numbers_only'
		});

		$(identifiant).addClass('active');

		$(identifiant + ' .jkeyboard-close').click(function () {
			that.InstallCloseKeyboard(identifiant);
		});
	}

	that.InstallCloseKeyboard = function (identifiant) {
		if (identifiant == undefined) {
			identifiant = '.simple-keyboard-percour';
		}
		$(identifiant).removeClass('active');
	}

	that.AnimateProgressBar = function () {
		return new Promise((resolve, reject) => {
			$(".progress-bar").addClass('d-none').css({ 'width': '0' })
			setTimeout(function () {
				$(".progress-bar").removeClass('d-none')
					.animate({
						"width": "100%"
					}, 500, 'linear').promise().done(function () {
						setTimeout(function () {
							resolve('animate completed')
						}, 500)
					});
			}, 250)
		})
	}

	that.InstallSetMess = function (mess = '', type = null, timeClose = 5000) {

		$('.bliwe-allert-mess-container').html('<div class="bliwe-allert-mess ' + type + '">' + mess + '</div>');
		$('.bliwe-allert-mess').fadeIn();
		$('.bliwe-allert-mess').click(function () {
			$('.bliwe-allert-mess').fadeOut("fast", function () {
				$(this).removeClass(type);
			});
		});
		that.SetTimeOut('bliwe-allert-mess', function () {
			$('.bliwe-allert-mess').fadeOut("fast", function () {
				$(this).removeClass(type);
			});
			$(".progress-bar").addClass('d-none').css({ 'width': '0' })
		}, timeClose);

		return false;
	}

	that.InstallRenderTemplate = function (name, obj = null) {
		var path = that.config.templates.path + '/install/' + name + '.mst';
		var template = FS.readFileSync(path, 'utf8');
		MUSTACHE.parse(template);
		return MUSTACHE.render(template, obj);
	}

	that.InstallReloadApp = function () {
		IPCRENDER.send('my-closeallwindowsasap-channel') // can have arguments
	}

	that.InstallgetJsonDataInfos = function () {

		var data = []
		var jSonPath = that.config.data;
		$.each(jSonPath, function (i, v) {
			if (i != 'developper' && i != 'device') {
				var infos = {};
				var stat = FS.statSync(v);
				infos['label'] = i;
				infos['size'] = stat.size / 1000.0;
				infos['style'] = (stat.size * 0.1 / 1000.0);
				infos['mtime'] = stat.mtime;
				infos['mtimeMs'] = stat.mtimeMs;
				data.push(infos);
			}
		});
		return data

	}

	that.InstallRegisterDevice = function (data) {

		var windowSize = that.GetElementInfos('window');
		var deviceJSon = that.device;
		deviceJSon.id = data.id;
		deviceJSon.module = data.module;
		deviceJSon.position = [data.positionLat, data.positionLong];
		deviceJSon.salle.id = data.salleId;
		deviceJSon.salle.name = data.salleName;
		if(data.module=='wall'){
			deviceJSon.screen.width = 3840;
			deviceJSon.screen.height = 2160;
		} else {
			deviceJSon.screen.width = 1080;
			deviceJSon.screen.height = 1920;
		}
		deviceJSon.screen.width = windowSize.width;
		deviceJSon.screen.height = windowSize.height;
		deviceJSon.spots.group = data.spotGroup;
		deviceJSon.json_data_status = that.InstallgetJsonDataInfos();

		//Send to main for register devices
		IPCRENDER.send('connect-device-to-server', deviceJSon);

		//Get reponse to main 
		IPCRENDER.on('reply-connect-device-to-server', (event, res) => {

			that.AnimateProgressBar().then((mess) => {
				that.PrintDebug(res);
				console.log(mess);
				//Set Token & Register Device Id
				var connections = {
					id: res.data.id,
					token: res.data.token
				}

				//Store new device json infos
				APP_STORE.set('install', '1');
				APP_STORE.set('connections', connections);
				APP_STORE.set('device', deviceJSon);

				that.InstallSetMess('Ok! Vous devez maintenant redémarrer l\'application', 'confirm');
				that.setActionButton();
			})

		})

	}

	that.setActionButton = function(){
		$('#btn-confirm')
		.addClass('btn-success').removeClass('btn-primary')
		.removeAttr('onclick')
		.html('Restart')
		.on('click', function(){
			that.InstallReloadApp();
		})

	}

	that.InstallSendForm = function (event) {
		event.preventDefault();
		$('.bliwe-install-form .bliwe-ctrl-input').each(function () {
			$(this).removeClass('is-invalid');}
		);
		that.InstallSetMess('Verification des donnes...', 'confirm');
		that.AnimateProgressBar().then((mess) => {
			console.log(mess);
			var error = null;
			var data = {};
			$('.bliwe-install-form .bliwe-ctrl-input').each(function () {
				$(this).removeClass('is-invalid');
				var name = $(this).attr('name');
				var value = $(this).val();
				var ctrlClass = $(this).hasClass('required');
				if (!value && ctrlClass) {
					error = true;
					$(this).addClass('is-invalid');
				} else if (value) {
					$(this).removeClass('is-invalid');
					$(this).addClass('is-valid');
					data[name] = value;
				}
			}
			);
			that.PrintDebug(data);

			if (error) {
				that.InstallSetMess('Certains champs obligatoires n\'ont pas été complétés!', 'error');
			} else {
				that.InstallRegisterDevice(data);
			}
		});
	}

	that.InstallInitForm = function () {
		var getJsonDataInfos = that.InstallgetJsonDataInfos();
		$.ajax({
			type: "GET",
			url: that.config.services.devices.getList + "?key=c016333d7ea64b34f9d3c3daea4f9fd6",
			success: function (response) {
				var devices = Object.values(response.data);
				var screenSize = that.GetElementInfos('window');
				var appSettings = {
					status: {
						'internet': [

						],
						'json': getJsonDataInfos
					},
					devices: devices,
					modules: [
						{ 'label': 'Sélectionnez le type de module à charger', 'value': '' },
						{ 'label': 'Mur (Wall)', 'value': 'wall' },
						{ 'label': 'Totem avec map', 'value': 'totem-map' },
						{ 'label': 'Totem avec programme', 'value': 'totem-programme' },
						{ 'label': 'Totem salle', 'value': 'totem-salle' },
						{ 'label': 'Totem Lab', 'value': 'totem-lab' },
					],
					spots: [
						{ 'label': 'Sélectionnez le group pour la rotation des spots publicitaire', 'value': '' },
						{ 'label': 'Group 1', 'value': '0' },
						{ 'label': 'Group 2', 'value': '1' },
						{ 'label': 'Group 3', 'value': '2' },
						{ 'label': 'Group 4', 'value': '3' },
						{ 'label': 'Group 5', 'value': '4' },
						{ 'label': 'Group 6', 'value': '5' },
						{ 'label': 'Group 7', 'value': '6' },
						{ 'label': 'Group 8', 'value': '7' },
						{ 'label': 'Group 9', 'value': '8' },
						{ 'label': 'Group 10', 'value': '9' },
					]
				}
				var options = {
					status: appSettings.status,
					screenSize: screenSize,
					devices: appSettings.devices,
					modules: appSettings.modules,
					spots: appSettings.spots
				}
				//var html =  that.InstallRenderTemplate('install-device-status', options);
				html = that.InstallRenderTemplate('install-form-device-settings', options);
				$('.install .bliwe-module-body').html(html);
			},
			fail: function (xhr, status, error) {
				that.PrintDebug(error);
			}
		});



	}

	that.InstallReset = function () {

	}

	that.InstallInit = function () {

		that.PrintDebug('Install is ready !');

		//Set default value of Form
		that.InstallInitForm();

		//Register library action for reset map
		that.RegisterResetFunction(that.InstallReset);

	}

})(AppSalon);