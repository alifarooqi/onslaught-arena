const db = require('./database');
const user = require('./user');
const partnership = require('./partnership');

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
 *          lastGuestUpdate
 *          lastHostUpdate
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
        if(time < 0) {
            ACTIVE_GAMEROOMS[gameroomId].lastGuestUpdate = new Date();
            ACTIVE_GAMEROOMS[gameroomId].lastHostUpdate = new Date();
            ACTIVE_GAMEROOMS[gameroomId].startTime = new Date();
            clearInterval(interval);
        }
    }, 1000)
};

const updateFromHost = ({gameroomId, playerPosition})=>{
    if(ACTIVE_GAMEROOMS[gameroomId]){
        ACTIVE_GAMEROOMS[gameroomId].lastHostUpdate = new Date();
        ACTIVE_GAMEROOMS[gameroomId].guestSocket.emit('receiveHostUpdate', playerPosition);
    }
};

const updateFromGuest = ({gameroomId, playerPosition})=>{
    if(ACTIVE_GAMEROOMS[gameroomId]){
        ACTIVE_GAMEROOMS[gameroomId].lastGuestUpdate = new Date();
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
            const totalScore = ACTIVE_GAMEROOMS[gameroomId].playerStats.totalScore + playerStats.totalScore;
            await sendMatchingInfo(gameroomId, playerStats, ACTIVE_GAMEROOMS[gameroomId].playerStats);
            db.updateWithId(GAMEROOM_MODELPACK, gameroomId, {totalScore});
            const {hostUserId, guestUserId} = ACTIVE_GAMEROOMS[gameroomId];
            if(playerStats.multiplayerType === 'host'){
                db.leaderboard.updateUserScore(hostUserId, playerStats.totalScore);
                db.leaderboard.updateUserScore(guestUserId, ACTIVE_GAMEROOMS[gameroomId].playerStats.totalScore);
            }
            else{
                db.leaderboard.updateUserScore(guestUserId, playerStats.totalScore);
                db.leaderboard.updateUserScore(hostUserId, ACTIVE_GAMEROOMS[gameroomId].playerStats.totalScore);
            }
            ACTIVE_GAMEROOMS[gameroomId].endGame = true;
            // delete ACTIVE_GAMEROOMS[gameroomId];
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

    const getHostInfo = db.getItemById(user.USER_MODELPACK, hostUserId);
    const getGuestInfo = db.getItemById(user.USER_MODELPACK, guestUserId);
    const [hostInfo, guestInfo] = await Promise.all([getHostInfo, getGuestInfo]);

    const getHostRank = db.leaderboard.getPlayerRankByScore(hostInfo.score);
    const getGuestRank = db.leaderboard.getPlayerRankByScore(guestInfo.score);
    const [hostRank, guestRank] = await Promise.all([getHostRank, getGuestRank]);



    // Host
    host = {
        gold: hostStats.gold,
        damage: hostStats.totalDamageTaken,
        score: hostStats.totalScore,
        rank: hostRank,
        totalScore: hostInfo.score
    };
    //Guest
    guest = {
        gold: guestStats.gold,
        damage: guestStats.totalDamageTaken,
        score: guestStats.totalScore,
        rank: guestRank,
        totalScore: guestInfo.score
    };

    const response = {compatible, host, guest};
    ACTIVE_GAMEROOMS[gameroomId].guestSocket.emit('matchingInfo', response);
    ACTIVE_GAMEROOMS[gameroomId].hostSocket.emit('matchingInfo', response);
};

function getCompatibility(player1, player2) {
    const statWeight = {
        kills: 10,
        timesWounded: 2,
        totalDamageTaken: 5,
        shotsFired: 5,
        shotsLanded: 5,
        gold: 2,
        totalScore: 10
    };
    let compatibility = 100; // Max Compatibility
    for(let stat in statWeight){
        let statDifference = Math.abs(player1[stat] - player2[stat]);
        statDifference /= Math.max(player1[stat], player2[stat]);
        statDifference *= statWeight[stat];
        if(!isNaN(statDifference))
            compatibility -= statDifference;
    }
    compatibility = Math.ceil(compatibility);
    compatibility = Math.max(compatibility, 0);

    return compatibility;
}

const partnerDisconnected = socketId =>{
    for(let gameroomId in ACTIVE_GAMEROOMS){
        if(socketId === ACTIVE_GAMEROOMS[gameroomId].guestSocket.id){
            ACTIVE_GAMEROOMS[gameroomId].hostSocket.emit('partnerDisconnected');
            setForDeletion(gameroomId);
        }
        else if(socketId === ACTIVE_GAMEROOMS[gameroomId].hostSocket.id){
            ACTIVE_GAMEROOMS[gameroomId].guestSocket.emit('partnerDisconnected');
            setForDeletion(gameroomId);
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

const onMatchPartner = ({gameroomId, selection})=>{ // selection = 'match' || 'ignore'
    console.log('on match partner', selection, ACTIVE_GAMEROOMS[gameroomId].partnerSelection);
    if(ACTIVE_GAMEROOMS.hasOwnProperty(gameroomId)){
        if(ACTIVE_GAMEROOMS[gameroomId].partnerSelection){
            if(ACTIVE_GAMEROOMS[gameroomId].partnerSelection === 'match' && selection === 'match'){
                partnership.create(ACTIVE_GAMEROOMS[gameroomId].hostUserId, ACTIVE_GAMEROOMS[gameroomId].guestUserId);

                const response = true;
                ACTIVE_GAMEROOMS[gameroomId].guestSocket.emit('matchPartnerResponse', response);
                ACTIVE_GAMEROOMS[gameroomId].hostSocket.emit('matchPartnerResponse', response);
            }
            else{
                const response = false;
                ACTIVE_GAMEROOMS[gameroomId].guestSocket.emit('matchPartnerResponse', response);
                ACTIVE_GAMEROOMS[gameroomId].hostSocket.emit('matchPartnerResponse', response);
            }
        }
        else
            ACTIVE_GAMEROOMS[gameroomId].partnerSelection = selection;
    }

};

const setForDeletion = gameroomId =>{
    const TIMEOUT = 10000; // Delete after 10 seconds
    setTimeout(()=>{
        delete ACTIVE_GAMEROOMS[gameroomId];
    }, TIMEOUT);
};


// Check for disconnection every 1.5 seconds
setInterval(()=>{
    for(let gameroomId in ACTIVE_GAMEROOMS){
        let now = new Date();
        if(now - ACTIVE_GAMEROOMS[gameroomId].startTime < 12000 || ACTIVE_GAMEROOMS[gameroomId].endGame){
            continue;
        }
        if(now - ACTIVE_GAMEROOMS[gameroomId].lastGuestUpdate > 1500 ||
            now - ACTIVE_GAMEROOMS[gameroomId].lastHostUpdate > 1500){
            ACTIVE_GAMEROOMS[gameroomId].hostSocket.emit('partnerDisconnected');
            ACTIVE_GAMEROOMS[gameroomId].guestSocket.emit('partnerDisconnected');
            setForDeletion(gameroomId);

        }
    }
}, 1500);


module.exports = {
    create,
    updateFromHost,
    updateFromGuest,
    togglePause,
    endGame,
    partnerDisconnected,
    chatMessage,
    onMatchPartner
};
