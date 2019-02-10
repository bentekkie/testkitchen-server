import * as express from "express"
import {AuthRouter} from "./AuthRouter"
import {RecipeRouter} from "./RecipeRouter"
import {UserRouter} from "./UserRouter"
import { Collections, isLoggedIn } from "../objects";




export const ApiRouter = (collections : Collections) => {
    const router =  express.Router()

router.use("/auth",AuthRouter(collections))

router.get('/version', (req,res) => {
    res.send({
        version:"v1"
    })
})
router.use('/recipe',isLoggedIn,RecipeRouter(collections))

router.get('/isLoggedin',isLoggedIn, (req,res) => {
    res.send({
        message:"logged in"
    })
})

router.use('/user', isLoggedIn, UserRouter(collections))
return router
}