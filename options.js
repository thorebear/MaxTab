function save_options() {
    var maxTabs = parseFloat($('#maxTabs').val());
    var exceedAction = $("input:radio[name ='exceedAction']:checked").val();

    if (isInteger(maxTabs) && maxTabs > 0) {
        chrome.storage.sync.set({
            maxTabs: maxTabs,
            exceedAction: exceedAction
        }, function() {
            setSuccessMsg(chrome.i18n.getMessage("options_saved"));
        });
    } else {
        setDangerMsg(chrome.i18n.getMessage("max_tabs_must_be_integer"));
    }
}

function restore_options() {
    chrome.storage.sync.get({
        maxTabs: 5, // default value
        exceedAction: "closeLeftmost" // default value
    }, function (items) {
        $("#maxTabs").val(items.maxTabs);
        $("input:radio[value =" + items.exceedAction + "]").prop("checked", true);
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
