const express = require('express')
const routes = express.Router()

const Chefs = require('../app/controllers/Chef')
const multer = require('../app/middlewares/multerChefs')
const Validator = require('../app/validators/chefs')


routes.get('/chefs', Chefs.index)
routes.get('/chefs/create', Validator.blockedUserWithoutSessionOrIsNotAdmin, Chefs.create)
routes.get('/chefs/:id', Chefs.show)
routes.get('/chefs/:id/edit', Validator.blockedUserWithoutSessionOrIsNotAdmin, Chefs.edit)

routes.post('/chefs', Validator.blockedUserWithoutSessionOrIsNotAdmin, multer.array("photos", 1), Chefs.post)
routes.put('/chefs', Validator.blockedUserWithoutSessionOrIsNotAdmin, multer.array("photos", 1), Chefs.put)

routes.delete('/chefs', Validator.blockedUserWithoutSessionOrIsNotAdmin, Chefs.delete)

module.exports = routes