var stompClient = null;

window.onbeforeunload = function () {
    disconnect();
};

function setConnected(connected) {
    $("#connect").prop("disabled", connected);
    $("#disconnect").prop("disabled", !connected);
    if (connected) {
        $("#conversation-container").show();
    }
    else {
        $("#conversation-container").hide();
    }
}

function connect(user) {
    var socket = new SockJS('/websocket-server');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame) {
        setConnected(true);
        console.log('Connected: ' + frame);
        stompClient.subscribe('/topic/chat', function (outbound) {
            showMessage(JSON.parse(outbound.body).content);
        });
        stompClient.subscribe('/topic/currentUsers', function (outbound) {
            updateUsers(JSON.parse(outbound.body).outboundUsers);
        });
        stompClient.send("/app/users/connect", {},
            JSON.stringify({'name': $("#name").val()}));
        stompClient.send("/app/inbound", {},
            JSON.stringify({'name': $("#name").val(), 'message': $("#message").val(), 'connected': 'true'}));
    });
    $("#connection").hide();
}

function disconnect() {
    stompClient.send("/app/users/disconnect", {},
        JSON.stringify({'name': $("#name").val()}));
    stompClient.send("/app/inbound", {},
        JSON.stringify({'name': $("#name").val(), 'message': $("#message").val(), 'connected': 'false'}));
    if (stompClient !== null) {
        stompClient.disconnect();
    }
    setConnected(false);
    console.log("Disconnected");
}

function sendMessage() {
    if ($("#message").val() != "") {
        stompClient.send("/app/inbound", {},
            JSON.stringify({'name': $("#name").val(), 'message': $("#message").val(), 'connected': 'true'}));
        $("#message").val('');
    }
}

function showMessage(message) {
    $("#messages").append("<tr><td>" + message + "</td></tr>");
    var conversationContainer = document.getElementById("conversation-content");
    conversationContainer.scrollTop = conversationContainer.scrollHeight;
}

function updateUsers(users) {
    var userTable = document.getElementById("users");
    clearTableRows(userTable);
    for (key in users) {
        if (userTable.rows.length <= 20) {
            $("#users").append("<tr><td><b>" + users[key] + "</b></td></tr>");
        }
    }
}

function clearTableRows(userTable) {
    while (userTable.rows.length > 1) {
      userTable.deleteRow(1);
    }
}

$(function () {
    $("form").on('submit', function (e) {
        e.preventDefault();
    });
    $( "#connect" ).click(function() { connect($("#name").val()); });
    $( "#disconnect" ).click(function() { disconnect(); });
    $( "#sendMessage" ).click(function() { sendMessage(); });
});