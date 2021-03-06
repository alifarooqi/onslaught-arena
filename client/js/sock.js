var socket = io();

socket.emit('startSession',{
    userId: USER._id
});

/*******************************************
 * Session
 *******************************************/

const findPartner = ()=>{
    socket.emit('findPartner',{
        userId: USER._id,
        username: USER.username
    });
};

const cancelFindPartner = ()=>{
    socket.emit('cancelFindPartner',{
        userId: USER._id
    });
};

const endSession = () => {
    socket.emit('endSession');
};

/*******************************************
 * Gameroom Updates
 *******************************************/


const hostUpdate = (gameroomId, playerPosition) => {
    socket.emit('hostUpdate',{
        gameroomId, playerPosition
    });
};

const guestUpdate = (gameroomId, playerPosition) => {
    socket.emit('guestUpdate',{
        gameroomId, playerPosition
    });
};

const togglePause = (gameroomId, multiplayerType) => {
    socket.emit('togglePause', {gameroomId, multiplayerType});
};

const endGame = (gameroomId, playerStats) => {
    socket.emit('endGame', {gameroomId, playerStats});
};

const sendChatMessage = (gameroomId, multiplayerType, message) => {
    socket.emit('chatMessage', {gameroomId, multiplayerType, message});
};

const matchPartner = (gameroomId, selection) => {
    socket.emit('matchPartner', {gameroomId, selection});
};

var SOCKET = {
    findPartner,
    cancelFindPartner,
    endSession,
    hostUpdate,
    guestUpdate,
    togglePause,
    endGame,
    sendChatMessage,
    matchPartner
};