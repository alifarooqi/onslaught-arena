const peer = new Peer(USER._id, {
    host: 'localhost',
    port: 2000,
    path: '/voice/call'
});

const player = document.getElementById('call-player');
let mediaStream, c;

peer.on('call', function(call) {
    call.answer(mediaStream);
    c = call;
    call.on('stream', function(stream) {
        player.srcObject = stream;
        player.play();
    });
});

const connect = peerId => {
    navigator.mediaDevices.getUserMedia({video: false, audio: true})
        .then(media => {
            mediaStream = media;
            let conn = peer.connect(peerId);
            conn.on('open', function(){
                call(peerId);
            });
        });
};
const call = (peerId) => {
    c = peer.call(peerId, mediaStream);
    c.on('stream', function(stream) {
        player.srcObject = stream;
        player.play();
    });

};
const toggleMic = () => {
    if(mediaStream)
        mediaStream.getTracks().forEach(track => track.enabled = !track.enabled);
};
const toggleSpeaker = () => {
    player.muted = !player.muted;
};
const endCall = ()=> {
    if(c)
        c.close();
};


const VOICE = {
    connect,
    toggleMic,
    toggleSpeaker,
    endCall
};