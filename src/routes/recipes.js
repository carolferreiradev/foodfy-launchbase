const express = require('express')
const routes = express.Router()

const Recipes = require('../app/controllers/Administrator')
const Validator = require('../app/validators/session')

const multer = require('../app/middlewares/multerRecipes')

routes.get('/recipes', Validator.blockedUserWithoutSession, Recipes.index)
routes.get('/recipes/create', Validator.blockedUserWithoutSession, Recipes.create)
routes.get('/recipes/:id', Validator.blockedUserWithoutSession, Recipes.show)

routes.get('/recipes/:id/edit', Validator.blockedUserWithoutSession, Validator.verificationAdminOrUserCreated, Recipes.edit)

routes.post('/recipes/create', Validator.blockedUserWithoutSession, multer.array("photos", 5), Recipes.post)

routes.put('/recipes', Validator.blockedUserWithoutSession, multer.array("photos", 5), Recipes.put)

routes.delete('/recipes', Validator.blockedUserWithoutSession, Recipes.delete)

module.exports = routes