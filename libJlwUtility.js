function libJlwUtility(initOptions) {
    var pleaseWaitDiv = {};
    var messageTypes = {
		Success: "0",
		Warning: "1",
		Info: "2",
		Danger: "3",
		Alert: "4",
		Redirect: "5"
	};
	var t = this;

    initOptions = initOptions || {};
	
    function initLibrary() {
        var libPaths = initOptions["libPaths"] || {};

        t.pleaseWaitDiv = pleaseWaitDiv;
        t.get = _ajaxGet;
        t.post = _ajaxPost;
        t.checkAjaxMessage = _checkAjaxMessage;
        t.showPleaseWait = showPleaseWait;
        t.hidePleaseWait = hidePleaseWait;
        t.debounce = debounce;
        t.populateFormData = populateFormData;
        t.setModalOnTop = setModalOnTop;
        t.serializeFormToJson = serializeFormToJson;
        t.messageTypes = messageTypes;
        t.formatDateString = formatDateString;
		t.zeroPad = zeroPad;
        t.redrawDataTableType = "full-hold";
        t.redrawDataTable = redrawDataTable;
        t.showNotification = _showNotification;
		t.lazyLoadLibrary = lazyLoadLibrary;

        var bs = (window.bootstrap && window.bootstrap['modal']);

        t.promiseInitBootstrap = lazyLoadLibrary(bs, libPaths["Bootstrap"]);

		t.promiseInitFontAwesome = lazyLoadLibrary(window.FontAwesome, libPaths["FontAwesome"]);
        t.promiseInitBootstrap = lazyLoadLibrary(window.bootbox, libPaths["Bootbox"]);
        t.promiseInitToastr = lazyLoadLibrary(window.toastr, libPaths["Toastr"]);
		pleaseWaitDiv = jQuery('<div class="modal fade jlwPleaseWait" data-backdrop="static" tabindex="-1" role="dialog"><div class="modal-dialog modal-dialog-centered" role="document"><div class="modal-content"><div class="modal-body"><div class="text-center"><div class="progress"><div class="progress-bar progress-bar-striped progress-bar-info progress-bar-animated" role="progressbar" aria-valuenow="45" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div></div><h4><span>Processing... </span> <button type="button" class="close" style="float: none;" data-dismiss="modal" aria-hidden="true"><small>x</small></button></h4></div></div></div></div></div>');
        fireCallback(t.init);
        fireCallback(initOptions["fnInit"]);
    }

    function initJquery(fnCb) {
        var libPaths = initOptions["libPaths"] || {};

        if(typeof jQuery=='undefined' && libPaths["jQuery"]) {
            var headTag = document.getElementsByTagName("head")[0];
            var jqTag = document.createElement('script');
            jqTag.type = 'text/javascript';
            jqTag.src = libPaths["jQuery"];
            jqTag.onload = function() {
                t.promiseInitJquery = jQuery.Deferred().resolve();
                fireCallback(fnCb);
            };
            headTag.appendChild(jqTag);
        } else {
            if (typeof jQuery != 'undefined') {
                t.promiseInitJquery = jQuery.Deferred().resolve();
            }
            fireCallback(fnCb);
        }
    }

	function fireCallback(fnCb) {
		if (typeof fnCb == 'function') {
            fnCb();
        }
    }

	function lazyLoadLibrary(libToCheck, libPath) {
        if (libToCheck)
            return jQuery.Deferred().resolve;

		if (typeof libPath == "string") {
			return jQuery.getScript(libPath);
        }
        return jQuery.Deferred().fail();
    }


	function init(fnCb) {
        initJquery(fnCb);
    }

	init(initLibrary);

	function zeroPad(str, pad) {
		if (!pad)
			pad = "000000000";

		if (!str)
			str = '';

		str = str.trim();
		return pad.substring(0, pad.length - str.length) + str;
	}

	function formatDateString(sDate,sFormat) {
		var s = '';
		if (!sFormat)
			sFormat = 'YYYY-MM-DD';
		try {
			s = sDate ? moment(sDate).format(sFormat) : '';
		} catch (err) { }
		return s;
	}

	function serializeFormToJson(oFrm) {
		var a = jQuery("input, select, textarea", oFrm);

		// Temporarily remove disabled properties so that values can be serialized.
		a.each(function (i, elem) {
			var o = jQuery(elem);
			o.data['jlwIsDisabled'] = o.prop("disabled");
			o.prop("disabled", false);
		});

		var frmData = a.serializeArray();
		var data = {};

		jQuery(frmData).each(function(i, o){
			data[o.name] = o.value;
		});

		// Re-enable disabled properties if set
		a.each(function (i, elem) {
			var o = jQuery(elem);
			o.prop("disabled", o.data['jlwIsDisabled']);
		});

		return data;
	}

	function getHighestZIndex(obj) {
		var highest = -999;

		jQuery("*").each(function () {
			var o = jQuery(this);
			var current = parseInt(o.css("z-index"), 10);
			if (current && highest < current && o != obj)
				highest = current;
		});
		return highest;
	}

	// function to correct the ZIndex of the topmost Modal Dialog boxes
	function setModalOnTop(oDlg) {
		var z = getHighestZIndex(oDlg);
		try {
			if (oDlg) {
				oDlg.data("bs.modal")._backdrop.css("z-index", z + 1);
				oDlg.css("z-index", z + 2);
			}
		} catch (err) { }

	}

	function showPleaseWait(sMessage) {
		if (sMessage == null) sMessage = "Processing...";
		jQuery("h4>span", pleaseWaitDiv).html(sMessage);
		var o = pleaseWaitDiv.appendTo("body").modal('show');
        o.on("hidden.bs.modal", function (e) {
            window.setTimeout(function() {
                jQuery(".jlwPleaseWait").remove();
            }, 100);
        });
		setModalOnTop(o);
	}

	function hidePleaseWait() {
	    window.setTimeout(function() {
            // set up timeout since animation doesn't always fire events correctly.
	        if (jQuery(".jlwPleaseWait")[0]) {
	            hidePleaseWait();
	        }
	    }, 500);

	    jQuery(".jlwPleaseWait").modal("hide");
	}

	function _showNotification(title, msg, type, redirectUrl) {

	    function fnAlert(title, msg, redirectUrl) {
		if (window.bootbox) {
			bootbox.alert({
			    title: title,
			    message: msg,
			    callback: function() {
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
	            toastr.success(msg, title);
	            break;
	        case 'info':
	            toastr.info(msg, title);
	            break;
	        case 'warning':
	            toastr.warning(msg, title);
	            break;
	        case 'danger':
	            toastr.warning(msg, title);
	            break;
	        case 'redirect':
	            hidePleaseWait();
	            fnAlert(msg, title);
	            break;
	        case 'alert':
	            hidePleaseWait();
	            fnAlert(msg, title, redirectUrl);
	            break;
	    }

	    if (redirectUrl && type != 'alert')
	        window.setTimeout(function () {
	            window.location.replace(redirectUrl);
	        }, 1500);

	}

	function _checkAjaxMessage(data, textStatus, jqXhr) {
		if (jqXhr && jqXhr["status"] === 401 && jqXhr["getResponseHeader"]) {
			// jqXhr is only populated on fail
			var loc = jqXhr.getResponseHeader("location");
			if (loc) {
				loc = loc.replace(/ReturnUrl=[\w\W]*$/i,'ReturnUrl='+encodeURIComponent(window.location.pathname));
				fnAlert("Not Logged In", "Either you have not completely logged in or your session has expired. Please log in and try again.", loc);
				return false;
			}
		}

		/*
        data["Message"] = data["Message"] || data["message"];
        data["Title"] = data["Title"] || data["title"];
        data["MessageType"] = data["MessageType"] || data["messageType"];
		*/

        if (!data || (!data["ExceptionType"] && !data["Message"]))
			return false;
		
		function fnAlert(title, msg, redirectUrl) {
		    if (window.bootbox) {
			var o = bootbox.alert({
			    title: title,
			    message: msg,
			    callback: function() {
				if (redirectUrl)
				    window.location.replace(redirectUrl);
			    }
			});
			setModalOnTop(o);
		    } else {
			window.alert(msg);
			if (redirectUrl)
			    window.location.replace(redirectUrl);
		    }
		}

		if (data["ExceptionType"]) {
			switch (data["ExceptionType"].toLowerCase()) {
				case "invalidloginexception":
					hidePleaseWait();
					fnAlert("Not Logged In", "Either you have not completely logged in or your session has expired. Please log in and try again.", baseUrl);
					return true;
				case "invalidtokenexception":
					hidePleaseWait();
					fnAlert(data["Message"], data["ExceptionMessage"], baseUrl);
					return true;
				case "statusfailexception":
				case "statusinvalidinputexception":
				case "system.exception":
				case "system.data.sqlclient.sqlexception":
					hidePleaseWait();
					toastr.error(data["ExceptionMessage"], data["Message"]);
					return true;
				default:
					//toastr.error(data["ExceptionMessage"], data["Message"]);
					//return true;
					data["Title"] = data["Message"];
					data["Message"] = data["ExceptionMessage"];
					break;
			}
		}
		if (data["MessageType"] != null && data["MessageType"].toString()) {

			switch (data["MessageType"].toString().toLowerCase()) {
				case "success":
                case messageTypes.Success:
					toastr.success(data["Message"], data["Title"]);
					break;
                case "info":
                case messageTypes.Info:
					toastr.info(data["Message"], data["Title"]);
					break;
                case "warning":
				case messageTypes.Warning:
					toastr.warning(data["Message"], data["Title"]);
					break;
                case "danger":
				case messageTypes.Danger:
					toastr.error(data["Message"], data["Title"]);
					break;
                case "redirect":
				case messageTypes.Redirect:
					hidePleaseWait();
					fnAlert(data["Title"], data["Message"], data["RedirectUrl"]);
					break;
				case "alert":
                case messageTypes.Alert:
					hidePleaseWait();
					fnAlert(data["Title"], data["Message"]);
					break;
			}
		}

		return false;
	}

	function _ajaxFail(jqXhr, textStatus, errorThrown) {
		var data = null;
		var re = new RegExp('application/json', 'i');
		if (re.test(jqXhr.getResponseHeader("content-type"))) {
			data = jQuery.parseJSON(jqXhr.responseText);
		} else {
			data = { Message: jqXhr.status + " - " + textStatus + ": " + errorThrown, MessageType: messageTypes.Danger, 'Title': 'An error has occurred' }
		}
		_checkAjaxMessage(data, textStatus, jqXhr);
		hidePleaseWait();
	}

	function _ajaxGet(url, data, callback, fail) {
		if (typeof fail != "function") fail = _ajaxFail;

		function fnCallback(data, textStatus, jqXhr) {
			if (_checkAjaxMessage(data))
				return;

			if (typeof callback != "function") return;
			callback(data, textStatus, jqXhr);
		}

		url = url + (-1 === url.indexOf('?') ? '?' : '&') + "__=" + Number(new Date());

		if (!data) {
			return jQuery.getJSON(url).done(fnCallback).fail(fail);
		}
		else
			return jQuery.ajax({ url: url, type: "GET", contentType: "application/json", data: JSON.stringify(data), cache: false }).done(fnCallback).fail(fail);
	}

	function _ajaxPost(url, data, callback, fail) {
		if (typeof fail == "undefined") fail = _ajaxFail;
		function fnCallback(data, textStatus, jqXhr) {
			if (_checkAjaxMessage(data))
				return;

			if (typeof callback != "function") return;
			callback(data, textStatus, jqXhr);
		}

		url = url + (-1 === url.indexOf('?') ? '?' : '&') + "__=" + Number(new Date());

		if (!data)
			return jQuery.ajax({ url: url, type: "POST", contentType: "application/json", cache: false }).done(fnCallback).fail(fail);
		else
			return jQuery.ajax({ url: url, type: "POST", contentType: "application/json", data: JSON.stringify(data), cache: false }).done(fnCallback).fail(fail);
	}

	function debounce(fn, delay) {
		var timer = null;
		return function () {
			var context = this, args = arguments;
			clearTimeout(timer);
			timer = setTimeout(function () {
				fn.apply(context, args);
			}, delay);
		};
	}

	function populateFormData (oData, oFrm) {
		var o = [];
		var s = '';
		// Empty Form Data
		o = jQuery("input:not([type=radio])", oFrm).val("");
		o = jQuery("select", oFrm).val("");
		o = jQuery("textarea", oFrm).val("");
		o = jQuery("input[type=checkbox]", oFrm).val("1").prop("checked", false);
		// Populate Form Fields
		for (var i in oData) {
			o = jQuery("input[name=" + i + "]", oFrm);
			if (!o[0]) {
				o = jQuery("select[name=" + i + "]", oFrm);
			}
			if (!o[0]) {
				o = jQuery("textarea[name=" + i + "]", oFrm);
			}

			if (o[0]) {
				if (o.prop('type') == 'checkbox') {
					o.prop("checked", oData[i]);
					o.data('origValue', o.val());
				} else if (o.prop('type') == 'radio') {
					s = (oData[i] ? oData[i].toString() : '');
                    o.each(function (i, elem) {
                        var rdo = jQuery(elem);
						rdo.prop("checked", rdo.val() == s);
                    });
                } else {
					s = (oData[i] ? oData[i].toString() : '');
					o.val(s.trim());
					o.data('origValue', o.val());
				}
			}

		}
	}

	function redrawDataTable(selector) {
		jQuery(selector)
			.each(function (i, o) {
				try {
					var id = jQuery(o).prop("id");
					var dt = jQuery("#" + id).DataTable();
					dt.draw(t.redrawDataTableType);
				} catch (ex) {}
			});
	}

    return t;
}

