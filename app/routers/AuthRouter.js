"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const passport = require("passport");
const objects_1 = require("../objects");
exports.AuthRouter = (collections) => {
    const router = express.Router();
    router.post("/login", passport.authenticate("local"), (req, res) => {
        res.send({
            message: "successfully login"
        });
    });
    router.get('/logout', objects_1.isLoggedIn, (req, res) => {
        req.logout();
        res.status(200).json({
            'message': 'successfully logout'
        });
    });
    router.post("/register", (req, res) => {
        const user = req.body;
        if (user.username &&
            user.password &&
            user.username.length > 0 &&
            user.password.length > 0) {
            collections.Users.insertOne(user, (err, usr) => {
                if (err) {
                    res.status(500).send({
                        error: "internal error"
                    });
                }
                else {
                    res.send({
                        message: "success"
                    });
                }
            });
        }
        else {
            res.status(403).send({
                error: "bad format"
            });
        }
    });
    return router;
};
