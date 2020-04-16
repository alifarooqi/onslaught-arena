const db = require('./database');
const user = require('./user');

let PARTNERSHIP_MODELPACK = {
    collection: 'partnership',
    create: 'createdOn'
};


const create = (user1id, user2id) => {
    const newPartnership = {
        user1id, user2id
    };
    db.insertOne(PARTNERSHIP_MODELPACK, newPartnership);
};

const doesExist =  async (user1id, user2id) => {
    let res = await db.getItem(PARTNERSHIP_MODELPACK, {user1id, user2id});
    console.log(res);
    let res2 = await db.getItem(PARTNERSHIP_MODELPACK, {user1id: user2id, user2id: user1id});
    console.log(res2);

};


module.exports = {
    create,
    doesExist,
};
