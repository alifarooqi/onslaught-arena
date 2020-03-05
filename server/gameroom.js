const db = require('./database');

let GAMEROOM_MODELPACK = {
    collection: 'gamerooms',
    update: 'updatedOn',
    create: 'createdOn'
};


let ACTIVE_GAMEROOMS = {};


const create = (host, hostSocket, guest, guestSocket, callback)=>{
    let NEW_GAMEROOM = {
        host,
        guest,
        progress: 0
    };

    db.insert(GAMEROOM_MODELPACK, [NEW_GAMEROOM], res =>{
        if(res.success){
            ACTIVE_GAMEROOMS[res.data._id] = {...res.data, hostSocket, guestSocket };
            startCountdown(res.data._id);
        }
        callback(res);
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


const updateFromHost = ({gameroomId, objects, monstersAlive, monstersAboveGates})=>{
    if(ACTIVE_GAMEROOMS[gameroomId]){
        ACTIVE_GAMEROOMS[gameroomId].guestSocket.emit('receiveHostUpdate', {
            objects, monstersAlive, monstersAboveGates
        });
    }
};


const updateFromGuest = ({gameroomId, player})=>{
    if(ACTIVE_GAMEROOMS[gameroomId]){
        ACTIVE_GAMEROOMS[gameroomId].hostSocket.emit('receiveGuestUpdate', player);
    }
};

module.exports = {
    create,
    updateFromHost,
    updateFromGuest
};
