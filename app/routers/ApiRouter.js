"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const AuthRouter_1 = require("./AuthRouter");
const RecipeRouter_1 = require("./RecipeRouter");
const UserRouter_1 = require("./UserRouter");
const objects_1 = require("../objects");
exports.ApiRouter = (collections) => {
    const router = express.Router();
    router.use("/auth", AuthRouter_1.AuthRouter(collections));
    router.get('/version', (req, res) => {
        res.send({
            version: "v1"
        });
    });
    router.use('/recipe', objects_1.isLoggedIn, RecipeRouter_1.RecipeRouter(collections));
    router.get('/isLoggedin', objects_1.isLoggedIn, (req, res) => {
        res.send({
            message: "logged in"
        });
    });
    router.use('/user', objects_1.isLoggedIn, UserRouter_1.UserRouter(collections));
    return router;
};
