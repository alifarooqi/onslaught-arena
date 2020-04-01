const db = require('./database');

let GAMEROOM_MODELPACK = {
    collection: 'gamerooms',
    update: 'updatedOn',
    create: 'createdOn'
};


let ACTIVE_GAMEROOMS = {};


const create = (host, hostSocket, guest, guestSocket, callback)=>{
    let NEW_GAMEROOM = {
        hostUserId: host.userId,
        hostUsername: host.username,
        guestUserId: guest.userId,
        guestUsername: guest.username,
        totalScore: 0
    };

    db.insertOne(GAMEROOM_MODELPACK, NEW_GAMEROOM, res =>{
        if(res.success && res.data.ops && res.data.ops.length){
            let gameroomId = res.data.ops[0]._id;
            ACTIVE_GAMEROOMS[gameroomId] = {...res.data.ops[0], hostSocket, guestSocket };
            startCountdown(gameroomId);
            callback({success: true, gameroomId});
        }
        else
            callback({success: false, data: res.data});
    });

};

const startCountdown = gameroomId =>{
    let time = 0; // TODO Change to 5
    let interval = setInterval(_=>{
        let gameroom = ACTIVE_GAMEROOMS[gameroomId];
        if(gameroom){
            gameroom.hostSocket.emit('gameroomStartCountdown', time);
            gameroom.guestSocket.emit('gameroomStartCountdown', time);
            time--;
        }
        if(time < 0)
            clearInterval(interval);
    }, 1000)
};

const updateFromHost = ({gameroomId, playerPosition})=>{
    if(ACTIVE_GAMEROOMS[gameroomId]){
        ACTIVE_GAMEROOMS[gameroomId].guestSocket.emit('receiveHostUpdate', playerPosition);
    }
};

const updateFromGuest = ({gameroomId, playerPosition})=>{
    if(ACTIVE_GAMEROOMS[gameroomId]){
        ACTIVE_GAMEROOMS[gameroomId].hostSocket.emit('receiveGuestUpdate', playerPosition);
    }
};

const togglePause = ({gameroomId, multiplayerType})=>{
    if(ACTIVE_GAMEROOMS[gameroomId]){
        if(multiplayerType === 'host')
            ACTIVE_GAMEROOMS[gameroomId].guestSocket.emit('togglePause');
        else if(multiplayerType === 'guest')
            ACTIVE_GAMEROOMS[gameroomId].hostSocket.emit('togglePause');
    }
};

const endGame = ({gameroomId, playerStats})=>{
    if(ACTIVE_GAMEROOMS[gameroomId]){
        if(ACTIVE_GAMEROOMS[gameroomId].playerStats){
            //TODO Update our records of the user stats
            let totalScore = ACTIVE_GAMEROOMS[gameroomId].playerStats.totalScore + playerStats.totalScore;
            db.updateWithId(GAMEROOM_MODELPACK, gameroomId, {totalScore}, res => {
                delete ACTIVE_GAMEROOMS[gameroomId];
            });
        }
        else{
            ACTIVE_GAMEROOMS[gameroomId].playerStats = playerStats;
        }

    }
};

const partnerDisconnected = socketId =>{
    for(let gameroomId in ACTIVE_GAMEROOMS){
        if(socketId === ACTIVE_GAMEROOMS[gameroomId].guestSocket.id){
            ACTIVE_GAMEROOMS[gameroomId].hostSocket.emit('partnerDisconnected');
        }
        else if(socketId === ACTIVE_GAMEROOMS[gameroomId].hostSocket.id){
            ACTIVE_GAMEROOMS[gameroomId].guestSocket.emit('partnerDisconnected');
        }
    }
};

const chatMessage = ({gameroomId, multiplayerType, message}) => {
    if(ACTIVE_GAMEROOMS[gameroomId]){
        if(multiplayerType === 'host')
            ACTIVE_GAMEROOMS[gameroomId].guestSocket.emit('chatMessage', message);
        else
            ACTIVE_GAMEROOMS[gameroomId].hostSocket.emit('chatMessage', message);
    }
};

module.exports = {
    create,
    updateFromHost,
    updateFromGuest,
    togglePause,
    endGame,
    partnerDisconnected,
    chatMessage
};
