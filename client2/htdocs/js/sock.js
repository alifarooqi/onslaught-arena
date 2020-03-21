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


var SOCKET = {
    findPartner,
    cancelFindPartner,
    endSession,
    hostUpdate,
    guestUpdate
};