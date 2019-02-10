import * as express from "express";
import { Collection, Db, ObjectID } from "mongodb";
import { DbClient } from "./DbClient";
import { ApiRouter } from "./routers/ApiRouter";
import * as http from "http";
import { mongoClient } from "./DbClient";
import * as cookieParser from "cookie-parser";
import { json } from "body-parser";
import * as expressSession from "express-session";
import * as passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import {Collections} from "./objects"
import * as path from "path"

class Server {
  private app = express();
  
  private Users: Collection;
  private Recipes: Collection;
  private Items: Collection;
  private Steps: Collection;

  constructor(client: DbClient) {
    this.initDb(client.connect("main")).then((collections : Collections) => {
      this.app.set("port", 8080);
      this.app.use(cookieParser());
      this.app.use(json());
      
      this.app.use(
        expressSession({
          secret: "keyboard cat",
          resave: true,
          saveUninitialized: true
        })
      );
      this.app.use(passport.initialize())
      this.initPassport(collections)
      this.app.use(passport.session())
      
      this.app.use(express.static(path.join(__dirname, '..','..','your-test-kitchen-ui','dist','groundup')));
      this.app.use("/api", ApiRouter(collections));
      this.app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '..','..','your-test-kitchen-ui','dist','groundup','index.html'));
      });
      let server = http.createServer(this.app);
      server.listen(this.app.get("port"), () => {
        console.log("Express server listening on port " + this.app.get("port"));
      });
    });
  }

  initPassport(collections: Collections) {
    passport.use(
      new LocalStrategy(function(username, password, done) {
        collections.Users.findOne({ username: username }, function(err, user) {
          if (err) {
            return done(err);
          }
          if (!user) {
            return done(null, false);
          }
          if (user.password !== password) {
            return done(null, false);
          }
          console.log(user)
          return done(null, user);
        });
      })
    );
    passport.serializeUser(function(user, done) {
    	console.log((user as any)._id)
      done(null, (user as any)._id);
    });

    passport.deserializeUser(function(id, done) {
      collections.Users.findOne({"_id":new ObjectID(id as any)},(err, user) => {
        done(err, user);
      });
    });
  }
  async initDb(db: Db) {
  	const users = await db.collection("users");
    const recipes = await db.collection("recipes");
    const items = await db.collection("items");
    const steps = await db.collection("steps");
  	return {
  		Users: users,
  		Recipes: recipes,
  		Steps: steps,
  		Items: items
  	}
  }
}

mongoClient.then(client => {
  new Server(client);
});
