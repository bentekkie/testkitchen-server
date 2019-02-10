"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const mongodb_1 = require("mongodb");
/*
const seed :Recipe  = {
    name: "Blue Cheese Bread",
    commitMsg:"First commit",
    items:[{
        name: "Egg",
        quantity: "4",
        type: "ingredient",
        comments:[{
            text: "i love egys",
            createdAt: new Date()
        }]
    }],
    steps:[{
        description: "mix dem eggos",
        time: 5,
        tags: [],
        comments: []
    },
    {
        description: "mix dem eggos agaiin",
        time: 2,
        tags: [],
        comments: []
    }],
}*/
exports.RecipeRouter = (collections) => {
    const router = express.Router();
    router.param("recipeId", (req, _, next, recipeId) => {
        req.recipeId = recipeId;
        next();
    });
    router.param("commitId", (req, _, next, commitId) => {
        req.commitId = commitId;
        next();
    });
    router.route('/:recipeId').get((req, res) => {
        collections.Recipes.findOne({ genesis: new mongodb_1.ObjectID(req.recipeId) }, { sort: { $natural: -1 } }, (err, recipe) => {
            if (err) {
                res.status(404).send({
                    error: "recipe not found"
                });
            }
            else {
                res.send(recipe);
            }
        });
    }).post((req, res) => {
        collections.Recipes.findOne({ _id: new mongodb_1.ObjectID(req.recipeId), created: req.commitId }, { sort: { $natural: -1 } }, (err, r) => {
            if (err) {
                res.status(404).send({
                    error: "previous version not found"
                });
            }
            else {
                const recipe = req.body;
                recipe.created = new Date().getTime();
                recipe.previous = r.created;
                recipe.genesis = r.genesis;
                recipe.authorId = req.user._id;
                collections.Recipes.insertOne(recipe, (err, result) => {
                    if (err) {
                        res.status(500).send({
                            error: "new version not added"
                        });
                    }
                    else {
                        res.send({
                            message: "new recipe version added"
                        });
                    }
                });
            }
        });
    });
    router.route('/').get((req, res) => {
        const filter = {};
        if (req.query.mine) {
            filter["authorId"] = req.user._id;
        }
        else if (req.query.authorId) {
            filter["authorId"] = req.query.authorId;
        }
        collections.Recipes.find(filter)
            .toArray()
            .then((recipes) => {
            console.log(recipes);
            res.send(recipes);
        });
    }).post((req, res) => {
        const recipe = req.body;
        recipe.created = new Date().getTime();
        recipe.previous = 0;
        recipe.authorId = req.user._id;
        collections.Recipes.insertOne(recipe, (err, recipe) => {
            if (err) {
                res.status(404).send({
                    error: "recipe not found"
                });
            }
            else {
                collections.Recipes.findOneAndUpdate({ _id: recipe.insertedId }, { $set: { genesis: recipe.insertedId } }, (err, result) => {
                    if (err) {
                        console.log(err);
                        res.status(500).send({
                            error: "recipe not added correctly"
                        });
                    }
                    else {
                        res.send({
                            message: "recipe added"
                        });
                    }
                });
            }
        });
    });
    return router;
};
