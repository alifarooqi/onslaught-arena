
socket.on('initConnection', data => {
    VOICE.init(data);
});

socket.on('findPartnerResponse', partner => {
    console.log('findPartnerResponse', partner.username);
    ENGINE.onFindingPartner(partner)});

socket.on('gameroomStartCountdown', time => ENGINE.updateCountdownTimer(time));

socket.on('receiveHostUpdate', update => ENGINE.updateFromHost(update));
socket.on('receiveGuestUpdate', update => ENGINE.updateFromGuest(update));

socket.on('togglePause', () => ENGINE.togglePause(true));

socket.on('partnerDisconnected', () => ENGINE.partnerDisconnected());

socket.on('chatMessage', CHAT.receiveMessage);
