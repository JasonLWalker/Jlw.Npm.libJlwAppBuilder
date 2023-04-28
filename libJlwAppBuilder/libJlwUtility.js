/*!
  * Jlw Utility Library 
  * Copyright 2012-2023 Jason L Walker
  * Licensed under MIT (https://github.com/JasonLWalker/Jlw.Npm.libJlwUtility/blob/main/LICENSE)
  */


function libJlwUtility(initOptions, $) {
    var _pleaseWaitDiv = {};
    var _messageTypes = {
		Success: "0",
		Warning: "1",
		Info: "2",
		Danger: "3",
		Alert: "4",
		Redirect: "5"
	};

	initOptions = initOptions || {};

	var t = initOptions.this || this;
	$ = $ || window.jQuery;

    t.fireCallback = t.fireCallback || _fireCallback;


    function initLibrary() {
        var libPaths = initOptions["libPaths"] || {};

        t.get = _ajaxGet;
        t.post = _ajaxPost;
        t.checkAjaxMessage = _checkAjaxMessage;
        t.showPleaseWait = _showPleaseWait;
		t.hidePleaseWait = _hidePleaseWait;

		_$pleaseWaitDiv = $('<div class="modal fade jlwPleaseWait" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" role="dialog"><div class="modal-dialog modal-dialog-centered" role="document"><div class="modal-content"><div class="modal-body"><div class="text-center"><button type="button" class="btn-close " data-bs-dismiss="modal" aria-label="Close"></button><div class="h4"><span></span><div class="progress"><div class="progress-bar progress-bar-striped progress-bar-info progress-bar-animated" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div></div></div></div></div></div></div></div>');

		t.pleaseWaitDiv = _$pleaseWaitDiv;

		t.language = {
			pleaseWait: "Processing...",
			notAuthorizedTitle: "Not Logged In",
			notAuthorized: "Either you have not completely logged in or your session has expired. Please log in and try again.",
			error: 'An error has occurred'

		};
		t.debounce = t.debounce || _debounce;
		t.populateFormData = t.populateFormData || _populateFormData;
		t.setModalOnTop = t.setModalOnTop || _setModalOnTop;
		t.serializeFormToJson = t.serializeFormToJson || _serializeFormToJson;
		t.messageTypes = t.messageTypes || _messageTypes;
		t.formatDateString = t.formatDateString || _formatDateString;
		t.zeroPad = t.zeroPad || _zeroPad;
		t.redrawDataTableType = t.redrawDataTableType || "full-hold";
		t.redrawDataTable = t.redrawDataTable || _redrawDataTable;
		t.showNotification = t.showNotification || _showNotification;
		t.lazyLoadLibrary = t.lazyLoadLibrary || _lazyLoadLibrary;
		t.getHighestZIndex = t.getHighestZIndex || _getHighestZIndex;
		t.serializeMultipleFieldCallback = t.serializeMultipleFieldCallback || _fnSerializeMultipleFieldCallback;

        var bs = (window.bootstrap && window.bootstrap['modal']);

		t.promiseInitBootstrap = t.lazyLoadLibrary(bs, libPaths["Bootstrap"]);
		t.promiseInitFontAwesome = t.lazyLoadLibrary(window.FontAwesome, libPaths["FontAwesome"]);
        t.promiseInitBootstrap = t.lazyLoadLibrary(window.bootbox, libPaths["Bootbox"]);
		t.promiseInitToastr = t.lazyLoadLibrary(window.toastr, libPaths["Toastr"]);
        t.fireCallback(t.init);
        t.fireCallback(initOptions["fnInit"]);
    }

    function initJquery(fnCb) {
        var libPaths = initOptions["libPaths"] || {};

        if(typeof $ == 'undefined' && libPaths["jQuery"]) {
            var headTag = document.getElementsByTagName("head")[0];
            var jqTag = document.createElement('script');
            jqTag.type = 'text/javascript';
            jqTag.src = libPaths["jQuery"];
            jqTag.onload = function() {
                t.promiseInitJquery = $.Deferred().resolve();
                t.fireCallback(fnCb);
            };
            headTag.appendChild(jqTag);
        } else {
            if (typeof $ != 'undefined') {
                t.promiseInitJquery = $.Deferred().resolve();
            }
            t.fireCallback(fnCb);
        }
    }

	function _lazyLoadLibrary(libToCheck, libPath) {
        if (libToCheck)
            return $.Deferred().resolve;

		if (typeof libPath == "string") {
			return $.getScript(libPath);
        }
        return $.Deferred().fail();
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
			pad = "000000000";

		if (!str)
			str = '';

		str = str.trim();
		return pad.substring(0, pad.length - str.length) + str;
	}

	function _formatDateString(sDate,sFormat) {
		var s = '';
		if (!sFormat)
			sFormat = 'YYYY-MM-DD';
		try {
			s = sDate ? moment(sDate).format(sFormat) : '';
		} catch (err) { }
		return s;
	}

	function _serializeFormToJson(oFrm) {
		var $a = $("input, select, textarea", oFrm);

		// Temporarily remove disabled properties so that values can be serialized.
		$a.each(function (i, elem) {
			var $o = $(elem);
			$o.data('jlwIsDisabled', $o.prop("disabled"));
			$o.attr("disabled", false);
		});

		var frmData = $a.serializeArray();
		var data = {};

		$(frmData).each(function (i, o) {
			if (data[o.name] && t.serializeMultipleFieldCallback) {
				if (!$.isArray(data[o.name])) {
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
			var $o = $(elem);
			$o.prop("disabled", $o.data('jlwIsDisabled'));
		});

		return data;
	}

	function _fnSerializeMultipleFieldCallback(frmData, data) {
		$(frmData).each(function (i, o) {
			if ($.isArray(data[o.name])) {
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

		$("*").each(function () {
			var $o = $(this);
			var current = parseInt($o.css("z-index"), 10);
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
				$oDlg.data("bs.modal")._backdrop.css("z-index", z + 1);
				$oDlg.css("z-index", z + 2);
			}
		} catch (err) { }

	}

	function _showPleaseWait(sMessage) {
		if (sMessage == null) sMessage = t.language["pleaseWait"];
		$(".h4>span", t.pleaseWaitDiv).html(sMessage);
		$('button.btn-close', t.pleaseWaitDiv).off().on('click', function () { t.hidePleaseWait(); });

        var $o = t.pleaseWaitDiv.appendTo("body").modal('show');
		$o.off("hidden.bs.modal").on("hidden.bs.modal", function (e) {
            window.setTimeout(function() {
                $(".jlwPleaseWait").remove();
            }, 10);
        });
		t.setModalOnTop($o);
	}

	function _hidePleaseWait() {
	    window.setTimeout(function() {
            // set up timeout since animation doesn't always fire events correctly.
	        if ($(".jlwPleaseWait")[0]) {
	            _hidePleaseWait();
	        }
	    }, 10);

	    $(".jlwPleaseWait").modal("hide");
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
		if (jqXhr && jqXhr["status"] === 401 && jqXhr["getResponseHeader"]) {
			// jqXhr is only populated on fail
			var loc = jqXhr.getResponseHeader("location");
			if (loc) {
				loc = loc.replace(/ReturnUrl=[\w\W]*$/i,'ReturnUrl='+encodeURIComponent(window.location.pathname));
				fnAlert(t.language["notAuthorizedTitle"], t.language["notAuthorized"], loc);
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
			t.setModalOnTop(o);
		    } else {
			window.alert(msg);
			if (redirectUrl)
			    window.location.replace(redirectUrl);
		    }
		}

		if (data["ExceptionType"]) {
			switch (data["ExceptionType"].toLowerCase()) {
				case "invalidloginexception":
					t.hidePleaseWait();
					fnAlert(t.language["notAuthorizedTitle"], t.language["notAuthorized"], baseUrl);
					return true;
				case "invalidtokenexception":
					t.hidePleaseWait();
					fnAlert(data["Message"], data["ExceptionMessage"], baseUrl);
					return true;
				case "statusfailexception":
				case "statusinvalidinputexception":
				case "system.exception":
				case "system.data.sqlclient.sqlexception":
					t.hidePleaseWait();
					toastr.error(data["ExceptionMessage"], data["Message"]);
					return true;
				default:
					data["Title"] = data["Message"];
					data["Message"] = data["ExceptionMessage"];
					break;
			}
		}
		if (data["MessageType"] != null && data["MessageType"].toString()) {

			switch (data["MessageType"].toString().toLowerCase()) {
				case "success":
                case t.messageTypes.Success:
					toastr.success(data["Message"], data["Title"]);
					break;
                case "info":
                case t.messageTypes.Info:
					toastr.info(data["Message"], data["Title"]);
					break;
                case "warning":
				case t.messageTypes.Warning:
					toastr.warning(data["Message"], data["Title"]);
					break;
                case "danger":
				case t.messageTypes.Danger:
					toastr.error(data["Message"], data["Title"]);
					break;
                case "redirect":
				case t.messageTypes.Redirect:
					t.hidePleaseWait();
					fnAlert(data["Title"], data["Message"], data["RedirectUrl"]);
					break;
				case "alert":
                case t.messageTypes.Alert:
					t.hidePleaseWait();
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
			data = $.parseJSON(jqXhr.responseText);
		} else {
			data = { Message: jqXhr.status + " - " + textStatus + ": " + errorThrown, MessageType: t.messageTypes.Danger, 'Title': t.language["error"] }
		}
		t.checkAjaxMessage(data, textStatus, jqXhr);
		t.hidePleaseWait();
	}

	function _ajaxGet(url, data, callback, fail) {
		if (typeof fail != "function") fail = _ajaxFail;

		function fnCallback(data, textStatus, jqXhr) {
			if (t.checkAjaxMessage(data))
				return;

			if (typeof callback != "function") return;
			callback(data, textStatus, jqXhr);
		}

		url = url + (-1 === url.indexOf('?') ? '?' : '&') + "__=" + Number(new Date());

		if (!data) {
			return $.getJSON(url).done(fnCallback).fail(fail);
		}
		else
			return $.ajax({ url: url, type: "GET", contentType: "application/json", data: JSON.stringify(data), cache: false }).done(fnCallback).fail(fail);
	}

	function _ajaxPost(url, data, callback, fail) {
		if (typeof fail == "undefined") fail = _ajaxFail;
		function fnCallback(data, textStatus, jqXhr) {
			if (t.checkAjaxMessage(data))
				return;

			if (typeof callback != "function") return;
			callback(data, textStatus, jqXhr);
		}

		url = url + (-1 === url.indexOf('?') ? '?' : '&') + "__=" + Number(new Date());

		if (!data)
			return $.ajax({ url: url, type: "POST", contentType: "application/json", cache: false }).done(fnCallback).fail(fail);
		else
			return $.ajax({ url: url, type: "POST", contentType: "application/json", data: JSON.stringify(data), cache: false }).done(fnCallback).fail(fail);
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
		$o = $("input:not([type=radio])", oFrm).val("");
		$o = $("select", oFrm).val("");
		$o = $("textarea", oFrm).val("");
		$o = $("input[type=checkbox]", oFrm).val("1").prop("checked", false);
		// Populate Form Fields
		for (var i in oData) {
			$o = $("input[name=" + i + "]", oFrm);
			if (!$o[0]) {
				$o = $("select[name=" + i + "]", oFrm);
			}
			if (!$o[0]) {
				$o = $("textarea[name=" + i + "]", oFrm);
			}

			if ($o[0]) {
				if ($o.prop('type') == 'checkbox') {
					$o.prop("checked", oData[i]);
					$o.data('origValue', $o.val());
				} else if ($o.prop('type') == 'radio') {
					s = (oData[i] ? oData[i].toString() : '');
                    $o.each(function (i, elem) {
                        var $rdo = $(elem);
						$rdo.prop("checked", $rdo.val() == s);
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
		$(selector)
			.each(function (i, o) {
				try {
					var id = $(o).prop("id");
					var dt = $("#" + id).DataTable();
					dt.draw(t.redrawDataTableType);
				} catch (ex) {}
			});
	}

    return t;
}

