"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
exports.UserRouter = (collections) => {
    const router = express.Router();
    router.route('/').get((req, res) => {
        collections.Users.find({}, { fields: { _id: 1, username: 1 } }).toArray()
            .then((users) => {
            res.send(users);
        });
    });
    return router;
};
