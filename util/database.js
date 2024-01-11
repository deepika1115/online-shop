const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = callback => {
    MongoClient.connect('mongodb+srv://deepikapareek:46WlkFSM3G8Shcjw@cluster0.5uuiteq.mongodb.net/shop?retryWrites=true&w=majority').then(client =>{
        console.log("connected")
        _db = client.db();
        callback();
    }).catch(err=>{
        console.log(err)
        throw err;
    })
}

const getDb = () => {
    if(_db){
        return _db
    }else{
        throw 'no database found!'
    }
}

exports.getDb = getDb;
exports.mongoConnect = mongoConnect;