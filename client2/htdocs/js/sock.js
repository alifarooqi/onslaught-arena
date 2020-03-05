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

const endSession = (userId)=>{
    socket.emit('endSession',{
        userId
    });
};

const hostUpdate = (gameroomId, objects, monstersAlive, monstersAboveGates) => {
    socket.emit('hostUpdate',{
        gameroomId, objects, monstersAlive, monstersAboveGates
    });
};

const guestUpdate = (gameroomId, player) => {
    socket.emit('guestUpdate',{
        gameroomId, player
    });
};


var SOCKET = {
    findPartner,
    cancelFindPartner,
    endSession,
    hostUpdate,
    guestUpdate
};