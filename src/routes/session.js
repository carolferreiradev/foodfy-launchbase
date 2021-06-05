const express = require('express')
const routes = express.Router()

const ProfileController = require('../app/controllers/Profile')
const UserController = require('../app/controllers/User')
const SessionValidator = require('../app/validators/session')
const { justAdmin, onlyUser } = require('../app/middlewares/session')


routes.get('/login', ProfileController.loginForm)
routes.get('/forgot-password', ProfileController.forgotPassword)
routes.get('/new-password', ProfileController.newPassword)

routes.post('/forgot-password', SessionValidator.forgotPassword, ProfileController.forgotPasswordPost)
routes.post('/new-password', SessionValidator.newPassword, ProfileController.newPasswordPost)

// Rotas de perfil de um usuário logado ,
routes.post('/admin/profile', SessionValidator.login, ProfileController.login)
routes.post('/logout', ProfileController.logout)

routes.get('/admin/users/profile', onlyUser, ProfileController.index)
routes.put('/admin/users/profile', SessionValidator.verificationOfUserWhenAlteredLogin, ProfileController.put)


// Rotas que o administrador irá acessar para gerenciar usuários
routes.get('/admin/users', justAdmin, UserController.list)
routes.get('/admin/users/new', justAdmin, UserController.newUser)
routes.get('/admin/users/:id/edit', justAdmin, UserController.edit)

routes.post('/admin/users', UserController.post)
routes.put('/admin/users', UserController.put)
routes.delete('/admin/users', UserController.delete)

module.exports = routes