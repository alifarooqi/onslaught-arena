socket.on('findPartnerResponse',function(partner){
    document.getElementById('loading').style.display = 'none';
    document.getElementById('startingCountdown').style.display = 'block';
    document.getElementById('partnerUsername').innerHTML = partner.username;
    horde.sound.play("partner_found");
    e.multiplayerType = partner.multiplayerType === 'host' ? 'guest' : 'host';
    e.gameroomId = partner.gameroomId;
});


socket.on('gameroomStartCountdown', time => {
    document.getElementById('gameroomCountdown').innerHTML = time;
    if(time === 0){
        document.getElementById('startingCountdown').style.display = 'none';
        e.continuing = false;
        e.showTutorial = !this.touchMove;
        e.state = "intro_cinematic";
    }
});

socket.on('receiveHostUpdate', ({objects, monstersAlive, monstersAboveGates}) => {
    e.updateFromHost(objects, monstersAlive, monstersAboveGates);
});

socket.on('receiveGuestUpdate', player => {
    e.updateFromGuest(player);
});

