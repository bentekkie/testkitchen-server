import * as express from "express";
import * as passport from "passport";
import { Collections, isLoggedIn } from "../objects";

export const AuthRouter = (collections: Collections) => {
  const router = express.Router();

  router.post("/login", passport.authenticate("local"), (req, res) => {
    res.send({
      message: "successfully login"
    });
  });
  
  router.get('/logout',isLoggedIn, (req,res) => {
    req.logout();
    res.status(200).json({
        'message': 'successfully logout'
    });
  })
  router.post("/register", (req, res) => {
    const user = req.body as User;
    if (
      user.username &&
      user.password &&
      user.username.length > 0 &&
      user.password.length > 0
    ) {
      collections.Users.insertOne(user,(err,usr) => {
        if(err){
          res.status(500).send({
        error: "internal error"
      });
        }else{
          res.send({
            message: "success"
          });
        }
      })
      
    } else {
      res.status(403).send({
        error: "bad format"
      });
    }
  });
  return router
};
