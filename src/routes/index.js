const express = require('express')
const routes = express.Router()

const home = require('./site')
const chefs = require('./chefs')
const recipes = require('./recipes')
const session = require('./session')

routes.use('/', home)
routes.use('/', session)
routes.use('/admin', chefs)
routes.use('/admin', recipes)

routes.use(function (req, res) {
    res.status(404).render("not-found");
})

module.exports = routes