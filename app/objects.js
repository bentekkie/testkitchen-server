"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.status(400).json({
        'message': 'access denied'
    });
}
exports.isLoggedIn = isLoggedIn;
