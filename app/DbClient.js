"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const MONGO_URL = "mongodb+srv://admin:admin@cluster0-1lnuz.mongodb.net/test?retryWrites=true";
class DbClient {
    constructor(connection) {
        this.connection = connection;
    }
    connect(dbName) {
        return this.connection.db(dbName);
    }
    getDatabases() {
        return this.connection.db().admin().listDatabases();
    }
    deleteDatabase(dbName) {
        return this.connection.db(dbName).dropDatabase();
    }
}
exports.DbClient = DbClient;
exports.mongoClient = mongodb_1.MongoClient.connect(MONGO_URL, { poolSize: 1, useNewUrlParser: true }).then(client => new DbClient(client));
