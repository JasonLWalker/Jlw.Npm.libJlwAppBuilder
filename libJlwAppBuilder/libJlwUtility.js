/*!
  * Jlw Utility Library
  * Copyright 2012-2023 Jason L Walker
  * Licensed under MIT (https://github.com/JasonLWalker/Jlw.Npm.libJlwUtility/blob/main/LICENSE)
  */

function libJlwUtility (initOptions, $) { // eslint-disable-line no-unused-vars
	var _$pleaseWaitDiv = {};
	var _messageTypes = {
		Success: '0',
		Warning: '1',
		Info: '2',
		Danger: '3',
		Alert: '4',
		Redirect: '5'
	};


	initOptions = initOptions || {};

	var t = initOptions.this || this;
	t.jQuery = $ || window.jQuery;

	t.fireCallback = t.fireCallback || _fireCallback;


	function initLibrary() {
		var libPaths = initOptions['libPaths'] || {};

		t.get = _ajaxGet;
		t.post = _ajaxPost;
		t.checkAjaxMessage = _checkAjaxMessage;
		t.showPleaseWait = _showPleaseWait;
		t.hidePleaseWait = _hidePleaseWait;
		t.baseUrl = '';
		

		_$pleaseWaitDiv = t.jQuery('<div class="modal fade jlwPleaseWait" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" role="dialog">' +
			'<div class="modal-dialog modal-dialog-centered" role="document">' +
			'<div class="modal-content">' +
			'<div class="modal-body">' +
			'<div class="text-center">' +
			'<button type="button" class="btn-close float-end" data-bs-dismiss="modal" aria-label="Close"></button>' +
			'<div class="h4">' +
			'<span></span>' +
			'<div class="progress">' +
			'<div class="progress-bar progress-bar-striped progress-bar-info progress-bar-animated" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div>' +
			'</div></div></div></div></div></div></div>');

		t.pleaseWaitDiv = _$pleaseWaitDiv;

		t.language = {
			pleaseWait: 'Processing...',
			notAuthorizedTitle: 'Not Logged In',
			notAuthorized: 'Either you have not completely logged in or your session has expired. Please log in and try again.',
			error: 'An error has occurred'

		};
		t.debounce = t.debounce || _debounce;
		t.populateFormData = t.populateFormData || _populateFormData;
		t.setModalOnTop = t.setModalOnTop || _setModalOnTop;
		t.serializeFormToJson = t.serializeFormToJson || _serializeFormToJson;
		t.messageTypes = t.messageTypes || _messageTypes;
		t.formatDateString = t.formatDateString || _formatDateString;
		t.zeroPad = t.zeroPad || _zeroPad;
		t.redrawDataTableType = t.redrawDataTableType || 'full-hold';
		t.redrawDataTable = t.redrawDataTable || _redrawDataTable;
		t.showNotification = t.showNotification || _showNotification;
		t.lazyLoadLibrary = t.lazyLoadLibrary || _lazyLoadLibrary;
		t.lazyLoadStyle = t.lazyLoadStyle || _lazyLoadStyle;
		t.getHighestZIndex = t.getHighestZIndex || _getHighestZIndex;
		t.serializeMultipleFieldCallback = t.serializeMultipleFieldCallback || _fnSerializeMultipleFieldCallback;

		t.promiseInitBootstrap = t.lazyLoadLibrary((window.bootstrap && window.bootstrap['Modal']), libPaths['Bootstrap']);
		t.promiseInitFontAwesome = t.lazyLoadLibrary(window.FontAwesome, libPaths['FontAwesome']);
		t.promiseInitBootbox = t.lazyLoadLibrary(window.bootbox, libPaths['Bootbox']);
		t.promiseInitToastr = t.lazyLoadLibrary(window.toastr, libPaths['Toastr']);
		t.fireCallback(t.init);
		t.fireCallback(initOptions['fnInit']);
	}

	function initJquery(fnCb) {
		var libPaths = initOptions['libPaths'] || {};

		if (typeof t.jQuery == 'undefined' && libPaths['jQuery']) {
			var headTag = document.getElementsByTagName('head')[0];
			var jqTag = document.createElement('script');
			jqTag.type = 'text/javascript';
			jqTag.src = libPaths['jQuery'];
			jqTag.onload = function () {
				t.jQuery = window.jQuery;
				t.promiseInitJquery = t.jQuery.Deferred().resolve();
				t.fireCallback(fnCb);
			};
			headTag.appendChild(jqTag);
		} else {
			if (typeof t.jQuery != 'undefined') {
				t.promiseInitJquery = t.jQuery.Deferred().resolve();
			}
			t.fireCallback(fnCb);
		}
	}

	function _lazyLoadStyle(filePath) {
		var sFileToCheck = (filePath || '').replace(/^.*[/]([^/]*\.(?:min)?\.css).*$/i, '$1');
		var sMinFile = (sFileToCheck || ''); 
		var sFile = (sFileToCheck || '');
		if (!filePath || (typeof filePath != 'string'))
			return t.jQuery.Deferred().fail();

		if (!sMinFile.includes('.min.css'))
			sMinFile = sMinFile.replace('.css', '.min.css');

		if (sFile.includes('.min.css'))
			sFile = sFile.replace('.min.css', '.css');

		if (!(t.jQuery('link[href*="' + sMinFile + '"]').length > 0 || t.jQuery('link[href*="' + sFile + '"]').length > 0)) {
			t.jQuery('head').append(t.jQuery('<link rel="stylesheet" type="text/css" />').attr('href', filePath));
		}
		return t.jQuery.Deferred().resolve();
	}

	function _lazyLoadLibrary(libToCheck, libPath, options) {
		if (libToCheck)
			return t.jQuery.Deferred().resolve;

		if (typeof libPath == 'string') {
			//return t.jQuery.getScript(libPath);
			var opts = t.jQuery.extend(options || { cache: true }, {
				url: libPath,
				dataType: 'script'
			});

			return t.jQuery.ajax(opts);
		}
		return t.jQuery.Deferred().fail();
	}

	function _fireCallback(fnCb) {
		if (typeof fnCb == 'function') {
			fnCb();
		}
	}

	function init(fnCb) {
		initJquery(fnCb);
	}

	init(initLibrary);

	function _zeroPad(str, pad) {
		if (!pad)
			pad = '000000000';

		if (!str)
			str = '';

		str = str.trim();
		return pad.substring(0, pad.length - str.length) + str;
	}

	function _formatDateString(sDate, sFormat) {
		var s = '';
		if (!sFormat)
			sFormat = 'YYYY-MM-DD';
		try {
			s = sDate ? window.moment(sDate).format(sFormat) : '';
		} catch (err) {
			// do nothing
		}
		return s;
	}

	function _serializeFormToJson(oFrm) {
		var $a = t.jQuery('input, select, textarea', oFrm);

		// Temporarily remove disabled properties so that values can be serialized.
		$a.each(function (i, elem) {
			var $o = t.jQuery(elem);
			$o.data('jlwIsDisabled', $o.prop('disabled'));
			$o.attr('disabled', false);
		});

		var frmData = $a.serializeArray();
		var data = {};

		t.jQuery(frmData).each(function(i, o) {
			if (data[o.name] && t.serializeMultipleFieldCallback) {
				if (!t.jQuery.isArray(data[o.name])) {
					data[o.name] = [data[o.name]];
				}
				data[o.name].push(o.value);
			} else {
				data[o.name] = o.value;
			}
		});

		if (typeof t.serializeMultipleFieldCallback == 'function') {
			// Re-process arrays
			t.serializeMultipleFieldCallback(frmData, data);
		}


		// Re-enable disabled properties if set
		$a.each(function (i, elem) {
			var $o = t.jQuery(elem);
			$o.prop('disabled', $o.data('jlwIsDisabled'));
		});

		return data;
	}

	function _fnSerializeMultipleFieldCallback(frmData, data) {
		t.jQuery(frmData).each(function (i, o) {
			if (t.jQuery.isArray(data[o.name])) {
				var arry = data[o.name];
				var key = o.name;
				data[key] = '';
				for (var n = 0; n < arry.length; n++) {
					data[key] += (data[key] ? ',' : '') + arry[n];
				}
			}
		});
	}

	function _getHighestZIndex($obj) {
		var highest = -999;

		t.jQuery('*').each(function () {
			var $o = t.jQuery(this);
			var current = parseInt($o.css('z-index'), 10);
			if (current && highest < current && $o != $obj)
				highest = current;
		});
		return highest;
	}

	// function to correct the ZIndex of the topmost Modal Dialog boxes
	function _setModalOnTop($oDlg) {
		var z = t.getHighestZIndex($oDlg);
		try {
			if ($oDlg) {
				$oDlg.data('bs.modal')._backdrop.css('z-index', z + 1);
				$oDlg.css('z-index', z + 2);
			}
		} catch (err) {
			// Do Nothing
		}

	}

	function _showPleaseWait(sMessage) {
		if (!(t.jQuery && t.jQuery.fn && t.jQuery.fn['modal']))
			return;

		if (sMessage == null) sMessage = t.language['pleaseWait'];
		t.jQuery('.h4>span', t.pleaseWaitDiv).html(sMessage);
		t.jQuery('button.btn-close', t.pleaseWaitDiv).off().on('click', function () { t.hidePleaseWait(); });

		var $o = t.pleaseWaitDiv.appendTo('body');
		$o.off('hidden.bs.modal').on('hidden.bs.modal', function () {
			t.jQuery('.modal.jlwPleaseWait').remove();
		});
		$o.off('shown.bs.modal').on('shown.bs.modal', function () {
			t.setModalOnTop($o);
		});

		window.setTimeout(function () {
			$o.modal('show');
		}, 10);
	}

	function _hidePleaseWait() {
		if (!(t.jQuery && t.jQuery.fn && t.jQuery.fn['modal']))
			return;
		var $o = t.jQuery('.jlwPleaseWait');
		// Set shown event since it will ignore if it is in transition
		$o.off('shown.bs.modal').on('shown.bs.modal', function () {
			$o.modal('hide');
		});
		$o.modal('hide');

	}

	function _showNotification(title, msg, type, redirectUrl) {

		function fnAlert(title, msg, redirectUrl) {
			if (window.bootbox) {
				window.bootbox.alert({
					title: title,
					message: msg,
					callback: function () {
						if (redirectUrl)
							window.location.replace(redirectUrl);
					}
				});
			} else {
				window.alert(msg);
				if (redirectUrl)
					window.location.replace(redirectUrl);
			}
		}

		if (type == null)
			type = 'info';

		type = type.toString().toLowerCase();

		switch (type) {
			case 'success':
				if (window.toastr) window.toastr.success(msg, title);
				break;
			case 'info':
				if (window.toastr) window.toastr.info(msg, title);
				break;
			case 'warning':
				if (window.toastr) window.toastr.warning(msg, title);
				break;
			case 'danger':
				if (window.toastr) window.toastr.warning(msg, title);
				break;
			case 'redirect':
				t.hidePleaseWait();
				fnAlert(msg, title);
				break;
			case 'alert':
				t.hidePleaseWait();
				fnAlert(msg, title, redirectUrl);
				break;
		}

		if (redirectUrl && type != 'alert')
			window.setTimeout(function () {
				window.location.replace(redirectUrl);
			}, 1500);

	}

	function _checkAjaxMessage(data, textStatus, jqXhr) {
		if (jqXhr && jqXhr['status'] === 401 && jqXhr['getResponseHeader']) {
			// jqXhr is only populated on fail
			var loc = jqXhr.getResponseHeader('location');
			if (loc) {
				loc = loc.replace(/ReturnUrl=[\w\W]*$/i, 'ReturnUrl=' + encodeURIComponent(window.location.pathname));
				fnAlert(t.language['notAuthorizedTitle'], t.language['notAuthorized'], loc);
				return false;
			}
		}

		if (!data || (!data['ExceptionType'] && !data['Message']))
			return false;

		function fnAlert(title, msg, redirectUrl) {
			if (window.bootbox) {
				var o = window.bootbox.alert({
					title: title,
					message: msg,
					callback: function () {
						if (redirectUrl)
							window.location.replace(redirectUrl);
					}
				});
				t.setModalOnTop(o);
			} else {
				window.alert(msg);
				if (redirectUrl)
					window.location.replace(redirectUrl);
			}
		}

		if (data['ExceptionType']) {
			switch (data['ExceptionType'].toLowerCase()) {
				case 'invalidloginexception':
					t.hidePleaseWait();
					fnAlert(t.language['notAuthorizedTitle'], t.language['notAuthorized'], t.baseUrl);
					return true;
				case 'invalidtokenexception':
					t.hidePleaseWait();
					fnAlert(data['Message'], data['ExceptionMessage'], t.baseUrl);
					return true;
				case 'statusfailexception':
				case 'statusinvalidinputexception':
				case 'system.exception':
				case 'system.data.sqlclient.sqlexception':
					t.hidePleaseWait();
					if (window.toastr) window.toastr.error(data['ExceptionMessage'], data['Message']);
					return true;
				default:
					data['Title'] = data['Message'];
					data['Message'] = data['ExceptionMessage'];
					break;
			}
		}
		if (data['MessageType'] != null && data['MessageType'].toString()) {

			switch (data['MessageType'].toString().toLowerCase()) {
				case 'success':
				case t.messageTypes.Success:
					if (window.toastr) window.toastr.success(data['Message'], data['Title']);
					break;
				case 'info':
				case t.messageTypes.Info:
					if (window.toastr) window.toastr.info(data['Message'], data['Title']);
					break;
				case 'warning':
				case t.messageTypes.Warning:
					if (window.toastr) window.toastr.warning(data['Message'], data['Title']);
					break;
				case 'danger':
				case t.messageTypes.Danger:
					if (window.toastr) window.toastr.error(data['Message'], data['Title']);
					break;
				case 'redirect':
				case t.messageTypes.Redirect:
					t.hidePleaseWait();
					fnAlert(data['Title'], data['Message'], data['RedirectUrl']);
					break;
				case 'alert':
				case t.messageTypes.Alert:
					t.hidePleaseWait();
					fnAlert(data['Title'], data['Message']);
					break;
			}
		}

		return false;
	}

	function _ajaxFail(jqXhr, textStatus, errorThrown) {
		var data = null;
		var re = new RegExp('application/json', 'i');
		if (re.test(jqXhr.getResponseHeader('content-type'))) {
			data = t.jQuery.parseJSON(jqXhr.responseText);
		} else {
			data = { Message: jqXhr.status + ' - ' + textStatus + ': ' + errorThrown, MessageType: t.messageTypes.Danger, 'Title': t.language['error'] };
		}
		t.checkAjaxMessage(data, textStatus, jqXhr);
		t.hidePleaseWait();
	}

	function _ajaxGet(url, data, callback, fail) {
		if (typeof fail != 'function') fail = _ajaxFail;

		function fnCallback(data, textStatus, jqXhr) {
			if (t.checkAjaxMessage(data))
				return;

			if (typeof callback != 'function') return;
			callback(data, textStatus, jqXhr);
		}

		url = url + (-1 === url.indexOf('?') ? '?' : '&') + '__=' + Number(new Date());

		if (!data) {
			return t.jQuery.getJSON(url).done(fnCallback).fail(fail);
		}
		else
			return t.jQuery.ajax({ url: url, type: 'GET', contentType: 'application/json', data: JSON.stringify(data), cache: false }).done(fnCallback).fail(fail);
	}

	function _ajaxPost(url, data, callback, fail) {
		if (typeof fail == 'undefined') fail = _ajaxFail;
		function fnCallback(data, textStatus, jqXhr) {
			if (t.checkAjaxMessage(data))
				return;

			if (typeof callback != 'function') return;
			callback(data, textStatus, jqXhr);
		}

		url = url + (-1 === url.indexOf('?') ? '?' : '&') + '__=' + Number(new Date());

		if (!data)
			return t.jQuery.ajax({ url: url, type: 'POST', contentType: 'application/json', cache: false }).done(fnCallback).fail(fail);
		else
			return t.jQuery.ajax({ url: url, type: 'POST', contentType: 'application/json', data: JSON.stringify(data), cache: false }).done(fnCallback).fail(fail);
	}

	function _debounce(fn, delay) {
		var timer = null;
		return function () {
			var context = this, args = arguments;
			clearTimeout(timer);
			timer = setTimeout(function () {
				fn.apply(context, args);
			}, delay);
		};
	}

	function _populateFormData (oData, oFrm) {
		var $o = [];
		var s = '';
		// Empty Form Data
		$o = t.jQuery('input:not([type=radio])', oFrm).val('');
		$o = t.jQuery('select', oFrm).val('');
		$o = t.jQuery('textarea', oFrm).val('');
		$o = t.jQuery('input[type=checkbox]', oFrm).val('1').prop('checked', false);
		// Populate Form Fields
		for (var i in oData) {
			$o = t.jQuery('input[name=' + i + ']', oFrm);
			if (!$o[0]) {
				$o = t.jQuery('select[name=' + i + ']', oFrm);
			}
			if (!$o[0]) {
				$o = t.jQuery('textarea[name=' + i + ']', oFrm);
			}

			if ($o[0]) {
				if ($o.prop('type') == 'checkbox') {
					$o.prop('checked', oData[i]);
					$o.data('origValue', $o.val());
				} else if ($o.prop('type') == 'radio') {
					s = (oData[i] ? oData[i].toString() : '');
					$o.each(function (i, elem) {
						var $rdo = t.jQuery(elem);
						$rdo.prop('checked', $rdo.val() == s);
					});
				} else {
					s = (oData[i] ? oData[i].toString() : '');
					$o.val(s.trim());
					$o.data('origValue', $o.val());
				}
			}

		}
	}

	function _redrawDataTable(selector) {
		t.jQuery(selector)
			.each(function (i, o) {
				try {
					var id = t.jQuery(o).prop('id');
					var dt = t.jQuery('#' + id).DataTable();
					dt.draw(t.redrawDataTableType);
				} catch (ex) {
					// Do Nothing
				}
			});
	}

	return t;
}

