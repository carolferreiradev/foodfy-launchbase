const express = require('express')
const routes = express.Router()

const Site = require('../app/controllers/Site')

routes.get("/", Site.home)
routes.get("/about", Site.about)
routes.get("/recipes", Site.list)
routes.get("/recipes/:id", Site.description)
routes.get("/chefs", Site.chefs)
routes.get("/filter", Site.filter)

module.exports = routes