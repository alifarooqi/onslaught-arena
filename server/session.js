const db = require('./database');
const {Queue} = require('./util');

let ACTIVE_PLAYERS = new Queue();

let SESSION_MODELPACK = {
    collection: 'session',
    update: 'updatedOn',
    create: 'startTime'
};

let NEW_ACTIVE_PLAYERS = {
    userId: '',
    socketId: ''
};

let NEW_SESSION = {
    userId: '',
    startTime: null,
    endTime: null
};


const start = (userId)=>{

};

const end = (userId)=>{

};

const getPartner = (userId, username, socketId) => {
    if (ACTIVE_PLAYERS.isEmpty()){
        ACTIVE_PLAYERS.enqueue({userId, username, socketId});
        return null;
    }
    else //TODO Create new GameRoom
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
