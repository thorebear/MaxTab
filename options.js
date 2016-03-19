function save_options() {
    var maxTabs = parseFloat(document.getElementById('maxTabs').value);
    var exceedAction = $("input:radio[name ='exceedAction']:checked").val();

    if (isInteger(maxTabs) && maxTabs > 0) {
        chrome.storage.sync.set({
            maxTabs: maxTabs,
            exceedAction: exceedAction
        }, function() {
            setSuccessMsg("Options saved!");
        });
    } else {
        setDangerMsg("Maximum number of tabs most be a positive integer");
    }
}

function restore_options() {
    chrome.storage.sync.get({
        maxTabs: 5, // default value
        exceedAction: "closeLeftmost" // default value
    }, function (items) {
        document.getElementById('maxTabs').value = items.maxTabs;
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
    document.getElementById('msgArea').innerHTML = '' +
        '<div class="alert alert-' + alert_type + '">' +
        msg +
        '</div>';
}

function isInteger(val) {
    return typeof val==='number' && (val%1)===0;
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);