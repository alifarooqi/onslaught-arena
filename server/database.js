const {MongoClient, ObjectId} = require('mongodb');

// Connection URL
const url = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName =  process.env.DB_NAME || 'onslaughtArena';
let db = null;

// Use connect method to connect to the server
MongoClient.connect(url, { useUnifiedTopology: true}, function(err, client) {
    if(err){
        console.error("DB Connection Error:", err);
        return;
    }
    console.log("Connected successfully to database");
    db = client.db(dbName);
});


const respond = (response, callback) => {
    if(callback)
        callback(response);
    else
        return response;
};

const insertOne = (modelpack, data, callback) => insert(modelpack, [data], callback);

const insert = async function(modelpack, data, callback = _=>{}) {
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
        if(err){
            console.error("DB insert error", err);
            return respond({success: false, err}, callback)

        }

        return respond({success: true, data: result}, callback);
    });
};

const getItem = async function(modelpack, filter, callback) {
    const collection = db.collection(modelpack.collection);
    collection.find(filter).toArray(function(err, data) {
        if(data && data.length)
            return respond({success: true, data: data[0]}, callback);
        else{
            console.error(err);
            return respond({success: false, data, err}, callback);
        }
    });
};

const getItemById = async function(modelpack, id, callback) {
    return getItem(modelpack, {_id: ObjectId(id)}, callback);
};

const getList = async function(modelpack, filter, callback) {
    const collection = db.collection(modelpack.collection);
    collection.find(filter).toArray(function(err, data) {
        if(err){
            console.error("DB getList Error:", err);
            return respond({success: false, data, err}, callback);
        }

        return respond({success: true, data}, callback);
    });
};

const updateOne = async function(modelpack, filter, newUpdate, callback) {
    const collection = db.collection(modelpack.collection);
    if(modelpack.update)
        newUpdate[modelpack.update] = new Date();

    collection.updateOne(filter, {$set: newUpdate}, function(err, data) {
        if (err){
            console.error("DB UpdateOne Error:", err);
            return respond({success: false, data, err}, callback);
        }
        return respond({success: true, data}, callback);
    });
};

const updateWithId = async function(modelpack, id, newUpdate, callback) {
    return updateOne(modelpack, {"_id": ObjectId(id)}, newUpdate, callback);
    // const collection = db.collection(modelpack.collection);
    // if(modelpack.update)
    //     newUpdate[modelpack.update] = new Date();
    //
    // collection.updateOne({"_id": ObjectId(id)}, {$set: newUpdate}, function(err, data) {
    //     if (err){
    //         console.error("DB updateWithId Error:", err);
    //         return respond({success: false, data, err}, callback);
    //     }
    //     return respond({success: true, data}, callback);
    // });
};


module.exports = {
    insert,
    insertOne,
    getItem,
    getList,
    updateOne,
    updateWithId,
    getItemById
};
