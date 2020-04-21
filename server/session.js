const db = require('./database');
const {Queue} = require('./util');
let gameroom = require('./gameroom');

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

function getPartner(userId, username, socketId) {
    if (ACTIVE_PLAYERS.isEmpty()){
        ACTIVE_PLAYERS.enqueue({userId, username, socketId});
        return null;
    }
    else
        return ACTIVE_PLAYERS.dequeue();
}

const findPartner = (data, socket, SOCKET_LIST) => {
    let partner = getPartner(data.userId, data.username, socket.id);
    if(partner){
        if(SOCKET_LIST[partner.socketId]){
            partner.multiplayerType = 'guest';
            let user = {...data, multiplayerType: 'host', socketId: socket.id};
            gameroom.create(user, socket, partner, SOCKET_LIST[partner.socketId], res => {
                if(res.success){
                    user.gameroomId = res.gameroomId;
                    partner.gameroomId = res.gameroomId;
                    // TODO
                    user.rank = 23;
                    partner.rank = 123;
                    user.score = 5534;
                    partner.score = 534;
                    socket.emit('findPartnerResponse', partner);
                    SOCKET_LIST[partner.socketId].emit('findPartnerResponse', user);
                }
            });

        }
        else
            findPartner(data);
    }
};

const cancelFindPartner = ({userId}) => {
    ACTIVE_PLAYERS.deleteUser(userId);
};

module.exports = {
    start,
    end,
    findPartner,
    cancelFindPartner
};
