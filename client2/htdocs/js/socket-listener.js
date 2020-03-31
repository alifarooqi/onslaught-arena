socket.on('findPartnerResponse',function(partner){
    document.getElementById('loading').style.display = 'none';
    document.getElementById('startingCountdown').style.display = 'block';
    document.getElementById('partnerUsername').innerHTML = partner.username;
    // TODO This should be inside the engine
    horde.sound.play("partner_found");
    e.multiplayerType = partner.multiplayerType === 'host' ? 'guest' : 'host';
    e.gameroomId = partner.gameroomId;
    console.log("Multiplayer Type:", e.multiplayerType, e.gameroomId);
});

socket.on('gameroomStartCountdown', time => {
    document.getElementById('gameroomCountdown').innerHTML = time;
    if(time === 0){
        document.getElementById('startingCountdown').style.display = 'none';
        // TODO This should be inside the engine
        e.continuing = false;
        e.showTutorial = !this.touchMove;
        e.state = "intro_cinematic";
    }
});

socket.on('receiveHostUpdate', update => e.updateFromHost(update));
socket.on('receiveGuestUpdate', update => e.updateFromGuest(update));

socket.on('togglePause', () => e.togglePause(true));

socket.on('partnerDisconnected', () => e.partnerDisconnected());

