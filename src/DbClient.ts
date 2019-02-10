import { MongoClient } from "mongodb";
const MONGO_URL = "mongodb+srv://admin:admin@cluster0-1lnuz.mongodb.net/test?retryWrites=true"

export class DbClient {
  constructor(private connection : MongoClient){

  }

  public connect(dbName : string) {
    return this.connection.db(dbName)
  }

  public getDatabases() {
    return this.connection.db().admin().listDatabases();
  }

  public deleteDatabase(dbName : string){
    return this.connection.db(dbName).dropDatabase()
  }
}




export const mongoClient = MongoClient.connect(MONGO_URL,{poolSize:1,useNewUrlParser: true }).then(client => new DbClient(client))