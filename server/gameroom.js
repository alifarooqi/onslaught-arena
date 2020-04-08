const db = require('./database');
const user = require('./user');

let GAMEROOM_MODELPACK = {
    collection: 'gamerooms',
    update: 'updatedOn',
    create: 'createdOn'
};

/**
 *
 * @type { Object }
 *      gameroomid: {
 *          hostUserId
 *          hostUsername
 *          guestUserId
 *          guestUsername
 *          totalScore
 *          hostSocket
 *          guestSocket
 *      }
 */
let ACTIVE_GAMEROOMS = {};

/**
 *
 * @param host: user info
 * @param hostSocket
 * @param guest: user info
 * @param guestSocket
 * @param callback
 *
 *          user info:
 *              userId
 *              username
 *              socketId
 *              multiplayerType
 */
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

const endGame = async ({gameroomId, playerStats})=>{
    if(ACTIVE_GAMEROOMS[gameroomId]){
        if(ACTIVE_GAMEROOMS[gameroomId].playerStats){
            //TODO Update our records of the user stats
            let totalScore = ACTIVE_GAMEROOMS[gameroomId].playerStats.totalScore + playerStats.totalScore;
            await sendMatchingInfo(gameroomId, playerStats, ACTIVE_GAMEROOMS[gameroomId].playerStats);
            db.updateWithId(GAMEROOM_MODELPACK, gameroomId, {totalScore}, res => {
                delete ACTIVE_GAMEROOMS[gameroomId];
            });
        }
        else{
            ACTIVE_GAMEROOMS[gameroomId].playerStats = playerStats;
        }

    }
};

/**
 *
 * @param gameroomId
 * @param player1: {Object} Player_Stats
 * @param player2: {Object} Player_Stats
 *
 * {Object} Player_Stats:
 *              kills
 *              timesWounded
 *              totalDamageTaken
 *              shotsFired
 *              shotsLanded
 *              shotsPerWeapon
 *              meatEaten
 *              cheater
 *              gold
 *              totalScore
 *              multiplayerType
 *
 * Sends the following data to the players
 *      compatible
 *      hostStats: {Object} stats
 *      guestStats: {Object} stats
 *
*       {Object} stats:
 *                  - coins
 *                  - damage
 *                  - score
 *                  - rank
 *                  - totalScore
 * @returns {Promise<void>}
 */

const sendMatchingInfo = async (gameroomId, player1, player2) => {
    let host, guest;
    let hostStats = player1, guestStats = player2;
    const {hostUserId, guestUserId} = ACTIVE_GAMEROOMS[gameroomId];
    const compatible = getCompatibility(player1, player2);

    if(player1.multiplayerType === 'guest'){
        hostStats = player2;
        guestStats = player1;
    }

    const getHost = db.getItemById(user.USER_MODELPACK, hostUserId);
    const getGuest = db.getItemById(user.USER_MODELPACK, guestUserId);

    Promise.all([getGuest, getHost]).then(res => {
        console.log('Promise Result', res);
    });



    // Host
    host = {
        gold: hostStats.gold,
        damage: hostStats.totalDamageTaken,
        score: hostStats.totalScore,
        rank: 123, //TODO
        totalScore: 5000 //TODO
    };
    //Guest
    guest = {
        gold: guestStats.gold,
        damage: guestStats.totalDamageTaken,
        score: guestStats.totalScore,
        rank: 13, //TODO
        totalScore: 10000 //TODO
    };

    const response = {compatible, host, guest};
    ACTIVE_GAMEROOMS[gameroomId].guestSocket.emit('matchingInfo', response);
    ACTIVE_GAMEROOMS[gameroomId].hostSocket.emit('matchingInfo', response);
};

function getCompatibility(player1, player2) {
    // TODO
    return 82;
}

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
