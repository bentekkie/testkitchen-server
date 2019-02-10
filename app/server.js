"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express = require("express");
const mongodb_1 = require("mongodb");
const ApiRouter_1 = require("./routers/ApiRouter");
const http = require("http");
const DbClient_1 = require("./DbClient");
const cookieParser = require("cookie-parser");
const body_parser_1 = require("body-parser");
const expressSession = require("express-session");
const passport = require("passport");
const passport_local_1 = require("passport-local");
const path = require("path");
class Server {
    constructor(client) {
        this.app = express();
        this.initDb(client.connect("main")).then((collections) => {
            this.app.set("port", 8080);
            this.app.use(cookieParser());
            this.app.use(body_parser_1.json());
            this.app.use(expressSession({
                secret: "keyboard cat",
                resave: true,
                saveUninitialized: true
            }));
            this.app.use(passport.initialize());
            this.initPassport(collections);
            this.app.use(passport.session());
            this.app.use(express.static(path.join(__dirname, '..', '..', 'your-test-kitchen-ui', 'dist', 'groundup')));
            this.app.use("/api", ApiRouter_1.ApiRouter(collections));
            this.app.get('*', (req, res) => {
                res.sendFile(path.join(__dirname, '..', '..', 'your-test-kitchen-ui', 'dist', 'groundup', 'index.html'));
            });
            let server = http.createServer(this.app);
            server.listen(this.app.get("port"), () => {
                console.log("Express server listening on port " + this.app.get("port"));
            });
        });
    }
    initPassport(collections) {
        passport.use(new passport_local_1.Strategy(function (username, password, done) {
            collections.Users.findOne({ username: username }, function (err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false);
                }
                if (user.password !== password) {
                    return done(null, false);
                }
                console.log(user);
                return done(null, user);
            });
        }));
        passport.serializeUser(function (user, done) {
            console.log(user._id);
            done(null, user._id);
        });
        passport.deserializeUser(function (id, done) {
            collections.Users.findOne({ "_id": new mongodb_1.ObjectID(id) }, (err, user) => {
                done(err, user);
            });
        });
    }
    initDb(db) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const users = yield db.collection("users");
            const recipes = yield db.collection("recipes");
            const items = yield db.collection("items");
            const steps = yield db.collection("steps");
            return {
                Users: users,
                Recipes: recipes,
                Steps: steps,
                Items: items
            };
        });
    }
}
DbClient_1.mongoClient.then(client => {
    new Server(client);
});
