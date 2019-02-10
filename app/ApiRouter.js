"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const router = express.Router();
router.get('/version', (req, res) => {
    res.send({
        version: "v1"
    });
});
exports.ApiRouter = router;
