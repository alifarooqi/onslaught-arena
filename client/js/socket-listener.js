
socket.on('initConnection', data => {
    VOICE.init(data);
});

socket.on('findPartnerResponse', partner => {
    ENGINE.onFindingPartner(partner);
});

socket.on('gameroomStartCountdown', time => ENGINE.updateCountdownTimer(time));

socket.on('receiveHostUpdate', update => ENGINE.updateFromHost(update));
socket.on('receiveGuestUpdate', update => ENGINE.updateFromGuest(update));

socket.on('togglePause', () => ENGINE.togglePause(true));

socket.on('partnerDisconnected', () => ENGINE.partnerDisconnected());

socket.on('matchingInfo', data => ENGINE.setMatchingInfo(data));

socket.on('matchPartnerResponse', res => ENGINE.onMatchPartnerResponse(res));

socket.on('chatMessage', CHAT.receiveMessage);

