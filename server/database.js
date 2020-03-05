const MongoClient = require('mongodb').MongoClient;

// Connection URL
const url = 'mongodb://localhost:27017';
const dbName = 'onslaughtArena';
let db = null;

const MODELPACK = {
    collection: 'user',
    update: 'updatedOn',
    create: 'createdOn'
};

// Use connect method to connect to the server
MongoClient.connect(url, { useUnifiedTopology: true}, function(err, client) {
    if(err){
        console.error("DB Connection Error:", err);
        return;
    }
    console.log("Connected successfully to database");
    db = client.db(dbName);
});


const insert = function(modelpack, data, callback = _=>{}) {
    // Get the documents collection
    const collection = db.collection(modelpack.collection);
    let now = new Date();
    if(modelpack.create){
        for(let i=0; i<data.length; i++)
            data[i][modelpack.create] = now;
    }
    if(modelpack.update){
        for(let i=0; i<data.length; i++)
            data[i][modelpack.update] = now;
    }
    // Insert some documents
    collection.insertMany(data, function(err, result) {
        if(err)
            callback({success: false, err});
        else
            callback({success: true, data: result});
    });
};
const getItem = function(modelpack, filter, callback = _=>{}) {
    const collection = db.collection(modelpack.collection);
    collection.find(filter).toArray(function(err, data) {
        if(data.length > 0)
            callback({success: true, data: data[0]});
        else
            callback({success: false, data, err});
    });
};

const getList = function(modelpack, filter, callback = _=>{}) {
    const collection = db.collection(modelpack.collection);
    collection.find(filter).toArray(function(err, data) {
        if(err){
            console.error("DB getList Error:", err);
            callback({success: false, data, err});
        }
        else
            callback({success: true, data});
    });
};


const updateOne = function(modelpack, filter, newUpdate, callback = _=>{}) {
    const collection = db.collection(modelpack.collection);
    if(modelpack.update)
        newUpdate[modelpack.update] = new Date();

    collection.updateOne(filter, {$set: newUpdate}, function(err, data) {
        if (err){
            console.error("DB UpdateOne Error:", err);
            callback({success: false, data, err});
        }
        else
            callback({success: true, data});
    });
};


module.exports = {
    insert,
    getItem,
    getList,
    updateOne

};




// db.createUser( { user: "onslaughtDB", pwd: "` 3.0g\\_NY$@B}F", roles: [ "readWrite", "dbAdmin" ]})
