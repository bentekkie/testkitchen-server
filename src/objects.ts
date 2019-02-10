
import { Collection } from "mongodb";

export interface Collections {
  Users: Collection
  Recipes: Collection
  Items: Collection
  Steps: Collection
}

export function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.status(400).json({
        'message': 'access denied'
    });
}