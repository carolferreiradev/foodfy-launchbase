const Users = require('../models/User')
const crypto = require('crypto')
const mailer = require('../../lib/mailer')
const { hash } = require('bcryptjs')

module.exports = {
  loginForm(req, res) {
    return res.render('user/login')
  },
  forgotPassword(req, res) {
    return res.render('user/forgot-password')
  },
  async forgotPasswordPost(req, res) {
    const user = req.user

    try {
      const token = crypto.randomBytes(20).toString("hex")

      let now = new Date()
      now = now.setHours(now.getHours() + 1)

      await Users.updatePassword(user.id, {
        reset_token: token,
        reset_token_expires: now
      })

      await mailer.sendMail({
        to: user.email,
        from: 'no-replay@foody.com',
        subject: 'Recuperação de Senha',
        html: `
      <h2> Perdeu a chave? :( </h2>
      <p>Não se preocupe :) acesse o link abaixo para restaurar sua senha. Apenas lembrando que o link é válido por uma hora</p>

      <p>
      <a href="http://localhost:3000/new-password?token=${token}" target="_blank">ACESSAR</a>
      </p>
      `
      })

      return res.render("user/forgot-password", {
        success: "Verifique seu email para resetar sua senha!"
      })
    } catch (error) {
      res.render("user/forgot-password", {
        user: req.body,
        error: "erro inesperado ocorreu tente novamente"
      })
      console.log(error)
    }

  },
  async index(req, res) {

    let user = await Users.user(req.session.userId)
    user = user.rows[0]

    if (user === undefined) {
      return res.redirect('/login')
    } else {
      let nameCut = user.name
      nameCut = nameCut.split(" ")
      nameCut = `${nameCut[0]} ${nameCut[1]}`
      return res.render('admin/userAcess/index', { user, nameCut })
    }
  },
  async put(req, res) {
    await Users.alterUser(req.body)
    let user = await Users.user(req.body.id)
    user = user.rows[0]

    let nameCut = user.name
    nameCut = nameCut.split(" ")
    nameCut = `${nameCut[0]} ${nameCut[1]}`

    return res.render('admin/userAcess/index', {
      user,
      nameCut,
      success: "Perfil alterado com sucesso."
    })
  },
  async login(req, res) {
    req.session.userId = req.user.id
    const user = req.user

    let nameCut = user.name
    nameCut = nameCut.split(" ")
    nameCut = nameCut[0]

    return res.render('admin/userAcess/index', { user, nameCut })
  },


  logout(req, res) {
    try {
      req.session.destroy()
      return res.redirect("/")
    } catch (error) {
      console.log(error)
    }
  },
  newPassword(req, res) {
    return res.render('user/new-password', { token: req.query.token })
  },
  async newPasswordPost(req, res) {
    const user = req.user
    const { password, token } = req.body

    try {

      const newPassword = await hash(password, 8)

      await Users.updatePassword(user.id, {
        password: newPassword,
        reset_token: "",
        reset_token_expires: "",
      })

      return res.render("user/login", {
        user: req.body,
        success: "Senha atualizada! Faça seu login"
      })


    } catch (error) {
      res.render("user/new-password", {
        user: req.body,
        token,
        error: "Erro inesperado! tente novamente"
      })
      console.log(error)
    }
  }
}