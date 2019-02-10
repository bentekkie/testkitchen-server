import * as express from "express"
import {ObjectID} from "mongodb"
import { Collections } from "../objects";




export const UserRouter = (collections : Collections) => {
    const router =  express.Router()
    router.route('/').get((req,res) => {
        collections.Users.find({},{fields:{_id:1,username:1}}).toArray()
        .then((users : User[]) => {
            res.send(users)
        })
    })
    return router
}