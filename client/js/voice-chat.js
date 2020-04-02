const player = document.getElementById('call-player');
let peer, mediaStream, c;

const init = ({host, port}) => {
    peer = new Peer(USER._id, {
        host,
        port,
        path: '/voice/call'
    });

    peer.on('call', function(call) {
        navigator.mediaDevices.getUserMedia({video: false, audio: true})
            .then(media => {
                mediaStream = media;
                call.answer(mediaStream);
                c = call;
                call.on('stream', function(stream) {
                    player.srcObject = stream;
                    player.play();
                });
            })
            .catch(err => console.error(err));
    });

};

const connect = peerId => {
    navigator.mediaDevices.getUserMedia({video: false, audio: true})
        .then(media => {
            mediaStream = media;
            let conn = peer.connect(peerId);
            conn.on('open', function(){
                call(peerId, media);
            });
        })
        .catch(err => console.error(err));
};
const call = (peerId, mediaStream) => {
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
    endCall,
    init
};