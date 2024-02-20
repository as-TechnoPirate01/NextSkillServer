import { MongoClient } from 'mongodb';

const url = 'mongodb+srv://nithinkumarkatru:hello@cluster0.zrplywq.mongodb.net/';
let db;

const connectToDb = (callback) => {
    MongoClient.connect(url)
    .then(client => {
        db = client.db();
        return callback(url);
    }).catch(err => {
        console.log(err);
        return callback(url, err);
    })
};

const getDb = () => {
    return db;
}

export {
    connectToDb,
    getDb,
};