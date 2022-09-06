function libJlwAppBuilder(sUrlRoot, sDtSelector, parentLib, jlwUtility, $, moment, tinyMce, bootbox, toastr) {
    jlwUtility = jlwUtility || window.libJlwUtility;
    $ = $ || window.jQuery;
    moment = moment || window.moment;
    tinyMce = tinyMce || window.tinyMCE;
    bootbox = bootbox || window.bootbox;
    toastr = toastr || window.toastr;

    var t = new jlwUtility({}, $);

    var aRowButtons = [];
    var aTableFooterButtons = [];
    var aDtRenderers = [];

    t.aDtRenderers = aDtRenderers;

    t.frmEdit = " ";
    t.frmDisplay = " ";
    t.sUrlRoot = sUrlRoot;
    t.sDtSelector = sDtSelector;
    t.getButtonDefinition = getButtonDefinition;
    t.getParentData = getParentData;

    t.onShowRecord = onShowRecord;
    t.onAddRecord = onAddRecord;
    t.onEditRecord = onEditRecord;
    t.onDeleteRecord = onDeleteRecord;
    t.showDialog = showDialog;
    t.onSave = onSave;
    t.onSaveNew = onSaveNew;

    t.dt = null;
    t.addDtRowButton = addDtRowButton;
    t.addDtFooterButton = addDtFooterButton;
    t.addDtRenderer = addDtRenderer;

    t.dtOrder = [[0, "asc"]];
    t.initializeDataTable = initializeDataTable;
    t.fnNull = t.fnNull || _fnNull;

    t.fnPostDtAjaxData = t.fnPostDtAjaxData || t.fnNull;
    t.fnNotImplemented = fnNotImplemented;

    t.dtRenderDate = dtRenderDate;
    t.dtRenderButtons = dtRenderButtons;
    t.dtRenderFooterButtons = dtRenderFooterButtons;
    t.dtOnDraw = dtOnDraw;
    t.dtOnPreDraw = t.dtOnPreDraw || t.fnNull;
    t.getButton = getButton;
    t.initPopup = initPopup;
    t.initWysiwyg = initWysiwyg;
    t.destroyWysiwyg = destroyWysiwyg;
    t.optionsWysiwyg = {};
    t.parentLib = parentLib;
    t.redrawType = "full-hold";
    t.redrawTable = fnRedrawTable;
    return t;
    
    function _fnNull() {
    }

    function fnNotImplemented() {
        toastr["error"]("Not Implemented", "This feature has not yet been implemented.");
    }

    function fnRedrawTable() {
        t.hidePleaseWait();
        if (t.dt) {
            t.dt.draw(t.redrawType);
        }

        if (t.parentLib && t.parentLib.dt && typeof(t.parentLib.dt.draw) === 'function') {
            t.parentLib.dt.draw(t.redrawType);
        }
    }

    function initializeDataTable(sSelector, oOpt) {
        if (!sSelector)
            sSelector = t.sDtSelector;

        if ($.fn.DataTable.isDataTable(sSelector))
            $(sSelector).DataTable().destroy();

        var options = {
            "processing": true,
            "serverSide": true,
            "pageLength": 10,
            "order": t.dtOrder,
            "preDrawCallback": t.dtOnPreDraw,
            ajax: {
                "url": t.sUrlRoot + "DtList",
                "type": "POST",
                "data": t.fnPostDtAjaxData
            },
            "columnDefs": t.aDtRenderers
        };

        if (oOpt) {
            $.extend(options, oOpt);
        }


        return t.dt = $(sSelector).DataTable(options).on("draw.dt", t.dtOnDraw);
    }

    function onShowRecord(oBtn, fnOnShow) {
        t.showPleaseWait();
        var oData = t.getParentData(oBtn);
        oData.EditToken = "Show";
        t.post(t.sUrlRoot + "Data", oData,
            function (o) {
                t.hidePleaseWait();
                window.setTimeout(function () {
                    var oFrm = t.showDialog(o, t.frmDisplay, "View Record");

                    if (typeof fnOnShow === "function") {
                        fnOnShow(oFrm, o);
                    }
                }, 500);
            });
    }

    function onDeleteRecord(oBtn) {
        var oData = t.getParentData(oBtn);
        function fnOnSuccessCallback(o) { return true; }
        function fnDlgCallback(result) {
            if (result) {
                t.showPleaseWait();
                t.post(t.sUrlRoot + "Delete", oData, fnOnSuccessCallback).always(t.redrawTable);
            }
        }
        oData.EditToken = 'Edit';
        var oFrm = bootbox.confirm("Are you sure you want to delete this record?", fnDlgCallback);
        t.setModalOnTop(oFrm);
    }

    function onEditRecord(oBtn, fnOnShow) {
        var oData = t.getParentData(oBtn);
        t.showPleaseWait(); oData.EditToken = "Edit"; var oFrm = null;
        function fnDlgCallback(result) { return t.onSave(oFrm); }
        function onSuccessCallback(o) {
            t.hidePleaseWait();

            window.setTimeout(
                function () {
                    oFrm = t.showDialog(
                        o,
                        t.frmEdit,
                        "Edit Record",
                        {
                            "yes": {
                                label: '<div class="text-left"><i class="fas fa-check-circle"></i> Save Changes</div>',
                                className: 'btn btn-outline-success pull-left jlw-update',
                                callback: fnDlgCallback
                            }
                        });

                    if (typeof fnOnShow === "function") {
                        fnOnShow(oFrm, o);
                    }
                }, 500);
        }
        t.post(t.sUrlRoot + "Data", oData, onSuccessCallback);
    }

    function onSave(oDlg) {
        t.showPleaseWait("Saving Data...");

        t.post(
            t.sUrlRoot + "Save",
            t.serializeFormToJson(oDlg),
            function (o) {
                t.hidePleaseWait();
                if (o["MessageType"] != t.messageTypes.Success)
                    return false;

                t.destroyWysiwyg(oDlg);
                oDlg.modal('hide');
            }).always(t.redrawTable);
        return false;
    }

    function onSaveNew(oDlg) {
        t.showPleaseWait("Saving Data...");

        t.post(
            t.sUrlRoot + "Save",
            t.serializeFormToJson(oDlg),
            function (o) {
                t.hidePleaseWait();
                if (o["MessageType"] != t.messageTypes.Success)
                    return false;

                t.destroyWysiwyg(oDlg);
                oDlg.modal('hide');
            }).always(t.redrawTable);
        return false;
    }

    function onAddRecord(fnOnShow) {
        window.setTimeout(function () {
            var oFrm = t.showDialog({}, t.frmEdit, "Add Record", {
                "yes": {
                    label: '<div class="text-left"><i class="fas fa-check-circle"></i> Add Record</div>',
                    className: 'btn btn-outline-success pull-left jlw-update',
                    callback: function () { return t.onSaveNew(oFrm); }
                }
            });

            if (typeof fnOnShow === "function") {
                fnOnShow(oFrm, { });
            }

        }, 500);
    }


    function getParentData(o) {
        var p = $(o).parent();
        var r = {};
        function fnIterator(n, el) {
            var d = $(el);
            r[d.data("name")] = d.html();
        }
        $("span.d-none", p).each(fnIterator);
        return r;
    }

    function getButton(o) {
        return '<button type="button" class="btn btn-sm ' + o.skin + " " + o.class + '"><i class="' + o.icon + '"></i>' + o.label + "</button>";
    }

    function addDtRowButton(sLabel, sBtnClass, sIconClass, sSkin, fnCallback) {
        aRowButtons.push(t.getButtonDefinition(sLabel, sBtnClass, sIconClass, sSkin, fnCallback));
    }

    function addDtFooterButton(sLabel, sBtnClass, sIconClass, sSkin, fnCallback) {
        aTableFooterButtons.push(t.getButtonDefinition(sLabel, sBtnClass, sIconClass, sSkin, fnCallback));
    }

    function addDtRenderer(fn, cols) {
        t.aDtRenderers.push({ 'render': fn, 'targets': cols });
    }

    function getButtonDefinition(sLabel, sBtnClass, sIconClass, sSkin, fnCallback) {
        return {
            'label': typeof sLabel == "string" ? sLabel : " ",
            'class': sBtnClass ? sBtnClass : "",
            'icon': sIconClass ? sIconClass : "",
            'skin': sSkin ? sSkin : "btn-outline-secondary",
            'callback': typeof fnCallback == "function" ? fnCallback : t.fnNull
        };
    }

    function dtRenderDate(data, type, row) {
        return moment(data).format("MM/DD/YYYY");
    }

    function dtRenderButtons(data, type, row) {
        var s = '';
        s += '<div class="text-center">';
        for (var k in row) { s += '<span class="d-none" data-name="' + k + '">' + row[k] + '</span>'; }
        for (var n in aRowButtons) { s += t.getButton(aRowButtons[n]) + "&nbsp;"; }
        s += "</div>";
        return s;
    }

    function dtRenderFooterButtons() {
        var p = $(sDtSelector).parent().parent().parent();
        if (t && t.dt && t.dt.containers)
            p = $(t.dt.containers());

        for (var n in aTableFooterButtons) {
            var o = $(t.getButton(aTableFooterButtons[n])).on('click', fnButtonLambda(aTableFooterButtons[n]));
            p.append(o);
        }
    }

    function fnButtonLambda(o) {
        if (typeof o.callback == "function") {
            var fn = o.callback;
            return function() { fn(this); };
        }
        return t.fnNull;
    }

    function dtOnDraw(e) {
        for (var n in aRowButtons) {
            var o = aRowButtons[n];
            var sClass = "." + o.class;
            $(sClass, $(sDtSelector)).off().on("click", fnButtonLambda(o));
        }
    }

    function initPopup(o, callback) {
        var p = o.parent().parent();
        $(".jlw-popup-control button, .jlw-popup-control input[type=text]", $(p))
            .off()
            .on('click',
                function(e) {
                     callback(this, p);
                });
    }

    function initWysiwyg(oFrm) {
        if (tinyMce) {
            var options = {
                'selector':".modal-body textarea.jlw-wysiwyg",
                'init_instance_callback' : function(o) {
                    $(o.targetElm).data("jlwWysiwyg", o);
                },
                'setup': function (editor) {
                    editor.on('change', function () {
                        tinyMce.triggerSave();
                    });
                }
            };

            if (t.optionsWysiwyg) {
                $.extend(options, t.optionsWysiwyg);
            }

            t.destroyWysiwyg(oFrm);
            tinyMce.init(options);
        }
    }

    function destroyWysiwyg(oFrm) {
        if (!tinyMce)
            return; 

        $(".jlw-wysiwyg", oFrm).each(function() {
            var t = $(this).data("jlwWysiwyg");
            if (t && t.destroy)
                t.destroy();
        });
    }

    function showDialog(oData, frmEdit, sTitle, btns) {
        var onClose = function(o) { t.destroyWysiwyg($(o.delegateTarget)); };
        if (!btns) { btns = {}; }
        if (!btns["no"]) { btns['no'] = { label: '<div class="text-left"><i class="fas fa-arrow-left"></i> Close</div>', className: 'btn btn-outline-danger', callback: onClose }; }
        var oFrm = bootbox.dialog({ title: sTitle, message: frmEdit, onEscape: onClose, size: "large", buttons: btns });
        t.populateFormData(oData, oFrm); $(".modal-lg", oFrm).addClass("modal-xl"); t.setModalOnTop(oFrm);
        oFrm.data('parentLib', t);
        t.initWysiwyg(oFrm);
        return oFrm;
    }

}
