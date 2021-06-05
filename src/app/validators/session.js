const { compare } = require("bcryptjs")

const Session = require('../models/User')

async function verificationAdminOrUserCreated(req, res, next) {

  let adm = await Session.findAdm(req.session.userId)
  adm = adm.rows

  let user = await Session.verificationAdminUser(req.params.id, req.session.userId)
  user = user.rows

  if (user.length < 1 && adm.length < 1) {
    return res.render('admin/recipes/invalid')
  }
  next()
}

async function blockedUserWithoutSession(req, res, next) {
  const userSession = req.session.userId

  if (userSession === undefined) return res.render('user/login', {
    error: "ATENÇÃO Você não está logado, por gentileza efetue seu login para prosseguir"
  })

  next()
}

async function login(req, res, next) {

  const { email, password } = req.body

  let user = await Session.findOne(email)
  user = user.rows[0]

  if (!user) return res.render("user/login", {
    user: req.body,
    error: "Usuário não encontrado"
  })

  const passed = await compare(password, user.password)

  if (!passed) return res.render("user/login", {
    user: req.body,
    error: "Senha Incorreta"
  })

  req.user = user

  next()
}
async function verificationOfUserWhenAlteredLogin(req, res, next) {
  const { id, email, password } = req.body
  let user = await Session.user(id)
  user = user.rows[0]

  let nameCut = user.name
  nameCut = nameCut.split(" ")
  nameCut = `${nameCut[0]} ${nameCut[1]}`

  if (user.email !== email) return res.render("admin/userAcess/index", {
    user: req.body,
    error: "Email nao bate"
  })

  const passed = await compare(password, user.password)
  if (!passed) return res.render("admin/userAcess/index", {
    user: user,
    nameCut: nameCut,
    error: "Senha Incorreta para alteração"
  })

  req.user = user

  next()
}
async function forgotPassword(req, res, next) {
  const { email } = req.body

  try {
    let user = await Session.findOne(email)
    user = user.rows[0]

    if (!user) return res.render("/forgot-password", {
      user: req.body,
      error: "Email não encontrado"
    })
    req.user = user

    next()

  } catch (error) {
    console.log(error)
  }
}
async function newPassword(req, res, next) {
  const { email, password, passwordRepeat, token } = req.body

  let user = await Session.findOne(email)
  user = user.rows[0]

  if (!user) return res.render('user/new-password', {
    user: req.body,
    token,
    error: 'Email usado não se refere a nenhum cadastrado, verifique o email digitado.'
  })

  if (password != passwordRepeat) return res.render('user/new-password', {
    user: req.body,
    token,
    error: 'A senha e a repetição da senha estão incorretas.'
  })

  if (token != user.reset_token) return res.render('user/new-password', {
    user: req.body,
    token,
    error: 'Token inválido'
  })

  let now = new Date()
  now = now.setHours(now.getHours())

  if (now > user.reset_token_expires) return res.render('user/new-password', {
    user: req.body,
    token,
    error: 'Token expirou, solicite um novo token'
  })

  req.user = user
  next()
}


module.exports = {
  login,
  verificationOfUserWhenAlteredLogin,
  forgotPassword,
  newPassword,
  blockedUserWithoutSession,
  verificationAdminOrUserCreated
}