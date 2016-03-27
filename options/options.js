max_tabs = { "options" : {}};

max_tabs.options.defaultSettings = {
    // default values
    maxTabs: 5,
    exceedAction: "closeLeftmost",
    countPinned: false,
    closePinned: false
};

function save_options() {
    var maxTabs = parseFloat($('#maxTabs').val());
    var exceedAction = $("input:radio[name ='exceedAction']:checked").val();
    
    var countPinned = $("#count_pinned").prop("checked");
    var closePinned = $("#close_pinned").prop("checked");

    if (isInteger(maxTabs) && maxTabs > 0) {
        chrome.storage.sync.set({
            maxTabs: maxTabs,
            exceedAction: exceedAction,
            countPinned: countPinned,
            closePinned: closePinned
        }, function() {
            setSuccessMsg(chrome.i18n.getMessage("options_saved"));
        });
    } else {
        setDangerMsg(chrome.i18n.getMessage("max_tabs_must_be_integer"));
    }
}

function restore_options() {
    chrome.storage.sync.get(max_tabs.options.defaultSettings,
        /**
         * @param {
         * {maxTabs:int},
         * {exceedAction:string},
         * {countPinned:boolean},
         * {closePinned:boolean}
         * } items
         */
        function (items) {
            $("#maxTabs").val(items.maxTabs);
            $("input:radio[value =" + items.exceedAction + "]").prop("checked", true);
            $("#count_pinned").prop("checked", items.countPinned);
            $("#close_pinned").prop("checked", items.closePinned);
        });
}

function setSuccessMsg(msg) {
    setMsg(msg, 'success');
}

function setDangerMsg(msg) {
    setMsg(msg, 'danger');
}

function setMsg(msg, alert_type) {
    $("#msgArea").html('' +
        '<div class="alert alert-' + alert_type + '">' +
        msg +
        '</div>');
}

function isInteger(val) {
    return typeof val==='number' && (val%1)===0;
}

$(document).ready(function() {
    restore_options();
    $("#save").on("click", save_options);
});
