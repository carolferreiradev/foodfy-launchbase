const Users = require('../models/User')
const mailer = require('../../lib/mailer')
const { hash } = require('bcryptjs')

function generatePasswordOfUser() {
  let pass = Math.random() * (100000 - 1) + 1;
  pass = pass.toFixed(0)
  return pass
}

module.exports = {
  async list(req, res) {
    let userLogged = req.session.userId
    let users = await Users.list()
    users = users.rows
    return res.render('admin/adminAcess/listUsers', { users, userLogged })
  },

  newUser(req, res) {
    return res.render('admin/adminAcess/newUser')
  },

  async edit(req, res) {
    let userLogged = req.session.userId
    let user = await Users.user(req.params.id)
    user = user.rows[0]

    return res.render('admin/adminAcess/putOrDeleteUser', { user, userLogged })
  },

  async post(req, res) {
    try {

      let is_admin = false;
      const { email, name } = req.body
      if (req.body.is_admin) is_admin = true;

      const password = await generatePasswordOfUser()
      const passwordHash = await hash(password, 8);

      const user = {
        name,
        email,
        password: passwordHash,
        is_admin
      }

      await mailer.sendMail({
        to: email,
        from: 'no-replay@foody.com',
        subject: 'CRIAÇÃO DE USUÁRIO: NOVA SENHA',
        html: `
            <h1> Seu cadastro esta pronto 🍔🍕🍟</h1>
            <p>Acesse nosso site e faça seu login com sua nova senha e seu email!</p>

            <h2>SENHA</h2>
            <h3>${password}</h3>
            <p>
            <a href="http://localhost:3000" target="_blank">ACESSAR</a>
            </p>
      `
      })

      await Users.create(user)
      return res.redirect('/admin/users')

    } catch (error) {
      console.log(error)
    }
  },

  async put(req, res) {
    let user = await Users.put(req.body)
    user = user.rows[0]

    return res.redirect('/admin/users')
  },

  async delete(req, res) {

    let checkUserCadRecipe = await Users.verificationUserCadRecipeBeforeDelete(req.body.id)
    checkUserCadRecipe = checkUserCadRecipe.rows
    if (checkUserCadRecipe.length >= 1) {
      let userLogged = req.session.userId
      let users = await Users.list()
      users = users.rows
      return res.render('admin/adminAcess/listUsers', {
        users,
        userLogged,
        error: 'Não é possível excluir um usuário que possui receitas cadastradas!' })
    } else {
      await Users.delete(req.body.id)
      return res.redirect('/admin/users')
    }

  }
}