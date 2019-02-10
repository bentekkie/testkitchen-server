"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const mongodb_1 = require("mongodb");
exports.RecipeRouter = (collections) => {
    const router = express.Router();
    router.get('/tree', (req, res) => {
        collections.Recipes.find().toArray().then((recipes) => {
            let nodes = recipes.map(r => ({ parent: r, children: [] }));
            for (let i = 0; i < nodes.length; i++) {
                nodes[i].children = nodes.filter(({ parent }) => parent.previous.toString() === nodes[i].parent.created.toString() && parent.genesis.toString() === nodes[i].parent.genesis.toString());
            }
            console.log(nodes);
            return nodes.filter(({ parent }) => parent.previous === 0);
        }).then(nodes => {
            res.send(nodes);
        });
    });
    router.param("recipeId", (req, _, next, recipeId) => {
        req.recipeId = recipeId;
        next();
    });
    router.param("commitId", (req, _, next, commitId) => {
        req.commitId = commitId;
        next();
    });
    router.get('/:recipeId/children', (req, res) => {
        collections.Recipes.findOne({ _id: new mongodb_1.ObjectID(req.recipeId) }, (err, parent) => {
            collections.Recipes.find({ genesis: parent.genesis, previous: parent.created }).toArray().then((children) => {
                res.send(children);
            });
        });
    });
    router.route('/:recipeId').get((req, res) => {
        collections.Recipes.findOne({ _id: new mongodb_1.ObjectID(req.recipeId) }, { sort: { $natural: -1 } }, (err, recipe) => {
            console.log(err);
            console.log(recipe);
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
        collections.Recipes.findOne({ _id: new mongodb_1.ObjectID(req.recipeId) }, { sort: { $natural: -1 } }, (err, r) => {
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
                recipe._id = undefined;
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
