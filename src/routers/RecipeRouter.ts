import * as express from "express"
import {ObjectID} from "mongodb"
import { Collections } from "../objects";

type RecipeRequest = express.Request & {
    recipeId:string,
    commitId:string
}

type Node = {
    parent: Recipe,
    children: Node[]
}

export const RecipeRouter = (collections : Collections) => {
    const router =  express.Router()
    
    router.get('/tree',(req,res) => {
        collections.Recipes.find().toArray().then((recipes : Recipe[]) => {
            let nodes : Node[] = recipes.map(r => ({parent:r,children:[]}))
            for(let i = 0; i < nodes.length; i++){
                nodes[i].children = nodes.filter(({parent}) => parent.previous.toString() === nodes[i].parent.created.toString() && parent.genesis.toString() === nodes[i].parent.genesis.toString())
            }
            console.log(nodes)
            return nodes.filter(({parent}) => parent.previous === 0)
        }).then(nodes => {
            res.send(nodes)
        })
    })
    router.param("recipeId",(req : RecipeRequest,_, next, recipeId) => {
        req.recipeId = recipeId
        next()
    })
    router.param("commitId",(req : RecipeRequest,_, next, commitId) => {
        req.commitId = commitId
        next()
    })
    router.get('/:recipeId/children', (req : RecipeRequest,res) => {
        collections.Recipes.findOne({_id:new ObjectID(req.recipeId)},(err,parent : Recipe) => {
            collections.Recipes.find({genesis:parent.genesis,previous:parent.created}).toArray().then((children : Recipe[]) => {
                res.send(children)
            })
        })
    })
    router.route('/:recipeId').get((req: RecipeRequest,res) => {
        collections.Recipes.findOne({_id:new ObjectID(req.recipeId)},{sort:{$natural:-1}},(err,recipe : Recipe) => {
            console.log(err)
            console.log(recipe)
            if(err){
                res.status(404).send({
                    error:"recipe not found"
                })
            }else{
                res.send(recipe)
            }
        })
    }).post((req: RecipeRequest,res) => {
        collections.Recipes.findOne({_id:new ObjectID(req.recipeId)},{sort:{$natural:-1}},(err,r : Recipe) => {
            if(err){
                res.status(404).send({
                    error:"previous version not found"
                })
            }else{
                const recipe = req.body as Recipe
                recipe.created = new Date().getTime()
                recipe.previous = r.created
                recipe.genesis = r.genesis
                recipe.authorId = req.user._id
                recipe._id = undefined
                collections.Recipes.insertOne(recipe,(err,result) => {
                    if(err){
                        res.status(500).send({
                            error:"new version not added"
                        })
                    }else{
                        res.send({
                            message:"new recipe version added"
                        })
                    }
                })
            }
        })
    })
    router.route('/').get((req,res) => {
        const filter: {[key: string]: any}= {}
        if(req.query.mine){
            filter["authorId"] = req.user._id
        }else if(req.query.authorId){
            filter["authorId"] = req.query.authorId
        }
        collections.Recipes.find(filter)
                    .toArray()
                    .then((recipes : Recipe[]) => {
                        console.log(recipes)
                        res.send(recipes)
                    })
    }).post((req,res) => {
        const recipe = req.body as Recipe
        recipe.created = new Date().getTime()
        recipe.previous = 0
        recipe.authorId = req.user._id
        collections.Recipes.insertOne(recipe,(err,recipe) => {
            if(err){
                res.status(404).send({
                    error:"recipe not found"
                })
            }else{
                collections.Recipes.findOneAndUpdate({_id:recipe.insertedId},{$set:{genesis:recipe.insertedId}},(err,result) => {
                    if(err){
                        console.log(err)
                        res.status(500).send({
                            error:"recipe not added correctly"
                        })
                    }else {
                        res.send({
                            message:"recipe added"
                        })
                    }
                })
            }
        })
        })
    return router
}