
let INDEX = 0;
$("#chat-submit").click(function(e) {
    e.preventDefault();
    const msg = $("#chat-input").val();
    if(msg.trim() === ''){
        return false;
    }
    SOCKET.sendChatMessage(ENGINE.gameroomId, ENGINE.multiplayerType, msg);
    generate_message(msg, 'self');

});

function setChatNotif() {
    if($("#chat-notif").hasClass("hidden")){
        $("#chat-notif").removeClass("hidden");
    }
}
function clearChatNotif(){
    if(!$("#chat-notif").hasClass("hidden")){
        $("#chat-notif").addClass("hidden");
    }
}


function generate_message(msg, type) {
    INDEX++;
    let str="";
    str += "<div id='cm-msg-"+INDEX+"' class=\"chat-msg "+type+"\">";
    // str += "          <span class=\"msg-avatar\">";
    // str += "            <img src=\"https:\/\/image.crisp.im\/avatar\/operator\/196af8cc-f6ad-4ef7-afd1-c45d5231387c\/240\/?1483361727745\">";
    // str += "          <\/span>";
    str += "          <div class=\"cm-msg-text\">";
    str += msg;
    str += "          <\/div>";
    str += "        <\/div>";
    $(".chat-logs").append(str);
    $("#cm-msg-"+INDEX).hide().fadeIn(300);
    if(type === 'self'){
        $("#chat-input").val('');
    }
    else
        setChatNotif();
    $(".chat-logs").stop().animate({ scrollTop: $(".chat-logs")[0].scrollHeight}, 1000);
}

function generate_button_message(msg, buttons){
    /* Buttons should be object array
      [
        {
          name: 'Existing User',
          value: 'existing'
        },
        {
          name: 'New User',
          value: 'new'
        }
      ]
    */
    INDEX++;
    var btn_obj = buttons.map(function(button) {
        return  "              <li class=\"button\"><a href=\"javascript:;\" class=\"btn btn-primary chat-btn\" chat-value=\""+button.value+"\">"+button.name+"<\/a><\/li>";
    }).join('');
    var str="";
    str += "<div id='cm-msg-"+INDEX+"' class=\"chat-msg bot\">";
    // str += "          <span class=\"msg-avatar\">";
    // str += "            <img src=\"https:\/\/image.crisp.im\/avatar\/operator\/196af8cc-f6ad-4ef7-afd1-c45d5231387c\/240\/?1483361727745\">";
    // str += "          <\/span>";
    str += "          <div class=\"cm-msg-text\">";
    str += msg;
    str += "          <\/div>";
    str += "          <div class=\"cm-msg-button\">";
    str += "            <ul>";
    str += btn_obj;
    str += "            <\/ul>";
    str += "          <\/div>";
    str += "        <\/div>";
    $(".chat-logs").append(str);
    $("#cm-msg-"+INDEX).hide().fadeIn(300);
    $(".chat-logs").stop().animate({ scrollTop: $(".chat-logs")[0].scrollHeight}, 1000);
    // $("#chat-input").attr("disabled", true);
}

(function generate_introduction_message(){
    const msg = `Welcome to the chat section of Onslaught Arena! 
                 Go ahead and say hi to your partner`;
    generate_message(msg, 'bot');
})();

$(document).delegate(".chat-btn", "click", function() {
    var value = $(this).attr("chat-value");
    var name = $(this).html();
    $("#chat-input").attr("disabled", false);
    generate_message(name, 'self');
});

$("#chat-circle").click(function() {
    $("#chat-circle").toggle('scale');
    $(".chat-box").toggle('scale');
});

$(".chat-box-toggle").click(function() {
    $("#chat-circle").toggle('scale');
    $(".chat-box").toggle('scale');
    clearChatNotif();
});

$(".mic-toggle").click(function() {
    const current = $('#mic-icon').html();
    const next = current === 'mic' ? 'mic_off' : 'mic';
    $('#mic-icon').html(next);
});

$(".speaker-toggle").click(function() {
    const current = $('#speaker-icon').html();
    const next = current === 'volume_up' ? 'volume_off' : 'volume_up';
    $('#speaker-icon').html(next);
});

const receiveMessage = msg =>{
    generate_message(msg, 'user');
};

const CHAT = {
    receiveMessage
};