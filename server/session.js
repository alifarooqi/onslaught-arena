const db = require('./database');
const {Queue} = require('./util');

let ACTIVE_PLAYERS = new Queue();

let SESSION_MODELPACK = {
    collection: 'session',
    create: 'startTime'
};

const start = (userId, socketId)=>{
    let NEW_SESSION = {
        userId,
        socketId,
        gameRooms: [],
        startTime: null,
        endTime: null
    };
    db.insertOne(SESSION_MODELPACK, NEW_SESSION);
};

const end = socketId => {
    let endTime = new Date();
    db.updateOne(SESSION_MODELPACK, {socketId}, {endTime});
};

const getPartner = (userId, username, socketId) => {
    if (ACTIVE_PLAYERS.isEmpty()){
        ACTIVE_PLAYERS.enqueue({userId, username, socketId});
        return null;
    }
    else
        return ACTIVE_PLAYERS.dequeue();
};

const cancelFindPartner = ({userId}) => {
    ACTIVE_PLAYERS.deleteUser(userId);
};

module.exports = {
    start,
    end,
    getPartner,
    cancelFindPartner
};
