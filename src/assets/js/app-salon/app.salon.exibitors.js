(function (that) {

	that.ExhibResetKeyboard = function (identifiant = '.bliwe-exhib-filter-text #autocomplete') {
		$(identifiant).val('');
	}

	that.ExhibCloseFilter = function () {
		$('#collapseExhib').collapse('toggle');
	}

	that.ExhibSetKeyboard = function (obj, identifiant = '.simple-keyboard') {
		$(identifiant).jkeyboard({
			input: obj,
			eventClick: function (type = 'text', input = obj.val()) {
				that.SetTimeOut('kryboard-exhib', function () {
					if (input) {
						that.ExhibSearchExhibitors('label', input);
					}
					else {
						that.ExhibResetFilters();
					}
				}, 600);
			}
		});

		$(identifiant).addClass('active');
		$(identifiant + ' .jkeyboard-close').click(function () {
			that.ExhibCloseKeyboard(identifiant);
		});
	}

	//SET KEYBOARD
	that.ExhibCloseKeyboard = function (identifiant) {
		$(identifiant).removeClass('active');
	}

	//RESET INFINITE SCROLL
	that.ExhibResetInfiniteScroll = function () {
		$('.bliwe-table-exhibitors .tbe-body').unbind('scroll');
	}

	//SET INFINITE SCROLL
	that.ExhibSetInfiniteScroll = function () {
		$('.bliwe-table-exhibitors .tbe-body').unbind('scroll').scroll(function () {
			if ($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
				let length = $('.tbe-body .exhibitorItem').length;
				let offset = length;
				let limit = length + 100;
				let data = that.ExhibGetExhibitorsItems(limit, offset);
				if (data) {
					$('.bliwe-table-exhibitors .tbe-body tbody').append(data.items);
				}
			}
		});
	}

	//SET ALPHABETIC FILTER
	that.ExhibSetAlphaFilter = function () {
		return that.RenderTemplate('exhib-filter-alpha');
	}

	//SET CATEGORY FILTER
	that.ExhibSetCategorysFilter = function (context = null) {
		var html = '';
		var hall_filtre = that.GetData('exposants', 'hall_filtre');
		var stand_filtre = that.GetData('exposants', 'stand_filtre');
		var secteurs_filtre = that.GetData('exposants', 'secteurs_filtre');
		//var themes_filtre = that.GetData('exposants', 'themes_filtre');
		//var apport_personnel_filtre = that.GetData('exposants', 'apport_personnel_filter');
		var options = {
			"title": false,
			"types": {
				"hall": false,
				"stand": true,
				"secteurs": true,
				"themes": false,
				"apport_personnel" : false
			},
			"items": {
				"hall": hall_filtre,
				"stand": stand_filtre,
				"secteurs": secteurs_filtre,
				//"themes": themes_filtre,
				//"apport_personnel" : apport_personnel_filtre
			}
		}
		if (context && context == 'totem') {
			html = that.RenderTemplate('exhib-filter-cat-totem', options);
		} else {
			html = that.RenderTemplate('exhib-filter-cat', options);
		}
		return html;
	}

	//SET TEXT SEARCH FILTER
	that.ExhibSetTextFilter = function (context) {
		var options = {
			"title": null
		}
		return that.RenderTemplate('exhib-filter-text', options);
	}

	//SET TEXT EXHIBITORS FILTERS
	that.ExhibSetFilters = function (data) {
		var parts = '';
		var reponse = {
			"html": null,
			'callback': null
		};
		var type = data.type;
		var context = data.context;
		if (type == "all") {
			parts = that.ExhibSetCategorysFilter(context);
			parts += that.ExhibSetTextFilter(context);
		} else if (type == "text") {
			parts = that.ExhibSetTextFilter(context);
		} else if (type == "categories") {
			parts = that.ExhibSetCategorysFilter(context);
		} else if (type == "alpha") {
			parts = that.ExhibSetAlphaFilter(context);
		}
		if (parts) {
			var options = {
				"html": parts
			}
			reponse.html = that.RenderTemplate('exhib-filter', options);
			reponse.call_back = function () { that.ExhibSetKeyboard($('.bliwe-exhib-filter-text #autocomplete')) };
		}
		return reponse;
	}

	//RESET FILTER
	that.ExhibResetFilters = function () {
		that.ExhibFilter = {};
		that.ExhibResetKeyboard();
		that.ExhibResetExhibitorsList();
	}

	//REGISTER FILTER
	that.ExhibRegisterFilters = function (type, value) {
		//console.log('ExhibFilters ', that.ExhibFilter);
		that.global.exhibSearchResult['filter'][type] = value;
		//console.log(that.global.exhibSearchResult['filter']);
	}

	//REGISTER FILTER
	that.ExhibGetFilters = function () {
		return that.ExhibFilter;
	}

	const ExhibFindExhibitors = (key, value) => {
		const exhib = [];
		const data = { items: '' }
		return new Promise((resolve, reject) => {
			data['exhibitors'] = AppSalon.GetData('exposants', 'exposants')
			if(data['exhibitors'].length){
				$.each(data['exhibitors'], function (i, v) {
					var finded = null;
					if (typeof v[key] === 'object' || typeof v[key] === 'array') {
						$.each(v[key], function (i2, v2) {
							if (v2['id'] == value) {
								finded = true;
							} else {
								if (v2[key] == value) {
									finded = true;
								}
							}
						});
					} else {
						if(v[key]){
							var searchVal = new RegExp(value, "i");
							if (v[key].search(searchVal) == 0) {
								finded = true;
							}
						}
					}
					if (finded == true) {
						exhib.push(v);
					}
				});
				return resolve(exhib);
			}
		});
	}

	//SEARCH EXHIBITORS ON JSON
	that.ExhibFilterExhibitors = async function (key, value, obj = false) {
		let exhib = [];
		let options = {};
		let data = { items: '' };
		let filter = that.ExhibGetFilters(key, value);
		exhib = await ExhibFindExhibitors(key, value);
		if (exhib.length > 0) {
			data['exhibitors'] = exhib;
			if(obj){
				return data['exhibitors'];
			}
		}
		let total = data['exhibitors'].length;
		data.items = that.RenderTemplate('exhib-list-items', data);
		data.total = total;
		options = that.ExhibSetExhibitorsList(data);
		options['reset'] = true;
		that.UpdateComponent('.bliwe-exhib-list', options);
	}

	//SEARCH EXHIBITORS ON JSON
	that.ExhibSearchExhibitors = function (key, value, obj) {
		that.ExhibRegisterFilters(key, value);
		let data = {exhibitors:[], total:'', items:''};
		let list_return = [];
		let total = '';
		if (value && value.length == 3) {
			that.ExhibFilterExhibitors(key, value, obj);
			return;
		} else if (value.length > 3) {

			value = value.toLowerCase();
			list_return = that.global.exhibSearch.search(value);
			if (list_return && list_return.length > 0) {
				total = list_return.length;
				data['exhibitors'] = list_return;
				that.ExhibRegisterFilters('result', list_return.length);
			}
		} else if (!value) {
			data['exhibitors'] = that.GetData('exposants', 'exposants');
			total = data['exhibitors'].length;
		}
		if (data['exhibitors'].length) {
			data.total = total;
			data.items = that.RenderTemplate('exhib-list-items', data);
			options = that.ExhibSetExhibitorsList(data);
			options['reset'] = true;
			that.UpdateComponent('.bliwe-exhib-list', options);
		}
	};

	that.ExhibExhibitorsItemsEvents = function () {
		/*$('.exhibitorItem .exhib-label').unbind('touchend', function () { }).bind('touchend', function () {
			let data = $(this).data();
			//let exhibId = data.exhib;
			let standId = data.stand;
			standId = standId.toString();
			that.MapShowStand(standId);
			that.TotemClosePage();
		});*/
	}

	that.ExhibGetExhibitorsItems = function (limit = 500, offsets = 0) {

		let html = '';
		let expo_list = '';
		let ret = {};
		let data = that.GetData('exposants', 'exposants');
		if (data.length >= limit) {
			expo_list = data.slice(offsets, limit);
		} else {
			expo_list = data.slice(offsets, data.length);
		}
		if (expo_list) {
			let options = {
				exhibitors: expo_list
			}
			ret['items'] = that.RenderTemplate('exhib-list-items', options);
			ret['total'] = data.length;
			ret['pagination'] = expo_list.length;
			return ret;
		}

	}

	that.ExhibResetExhibitorsList = function (data) {

		let exhib = that.ExhibGetExhibitorsItems();
		let options = [];
		if (exhib.items && exhib.total > 0) {
			that.ExhibRegisterFilters('result', exhib.total);
			options = that.ExhibSetExhibitorsList(exhib)
			options['reset'] = true;
			that.UpdateComponent('.bliwe-exhib-list', options);
		}

	}

	//SET EXHIB LIST
	that.ExhibSetExhibitorsList = function (data) {
		let find;
		let items = '';
		let total = '';
		let message = '';
		let reponse = {
			html: null,
			callback: null,
		};
		if (data && data.hasOwnProperty('message')) {
			message = data.message;
		}
		if (data && data.hasOwnProperty('total')) {
			total = data.total;
		}
		if (data && data.hasOwnProperty('items')) {
			items = data.items;
		} else {
			find = that.ExhibGetExhibitorsItems();
			items = find['items'];
			total = find['total'];
		}
		var options = {
			"title": false,
			"filter_alfa": false,
			"items": items,
			"hasspercour": false,
			"message": message,
			"total": total
		}

		html = that.RenderTemplate('exhib-list', options);
		if (html) {
			reponse.html = html;
			reponse.call_back = function () {
				that.ExhibSetInfiniteScroll();
				that.ExhibExhibitorsItemsEvents();
			}
		}
		return reponse;
	}

	AppSalon.ExhibSetSearch = function () {
		let exposants_list = that.GetData('exposants', 'exposants', true);
		that.global.exhibSearch = new JsSearch.Search('id');
		that.global.exhibSearch.tokenizer = new JsSearch.StopWordsTokenizer(new JsSearch.SimpleTokenizer());
		that.global.exhibSearch.indexStrategy = new JsSearch.ExactWordIndexStrategy();
		that.global.exhibSearch.searchIndex = new JsSearch.UnorderedSearchIndex();
		that.global.exhibSearch.addIndex('label');
		that.global.exhibSearch.addIndex('description');
		that.global.exhibSearch.addIndex('stand-label');
		that.global.exhibSearch.addIndex(['presence', 'label']);
		that.global.exhibSearch.addDocuments(exposants_list);
	};

	that.ExhibitorReset = function () {
		that.ExhibResetFilters();
		that.ExhibCloseKeyboard();
	}

	that.ExhibitorInit = function () {
		that.ExhibSetSearch();
		that.RegisterResetFunction(that.ExhibitorReset);
	}

})(AppSalon);