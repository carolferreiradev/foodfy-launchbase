const User = require('../models/User')
async function blockedUserWithoutSessionOrIsNotAdmin(req, res, next) {
  const userSession = req.session.userId
  
  if (userSession === undefined) return res.render('user/login', {
    error: "ATENÇÃO Você não está logado, por gentileza efetue seu login para prosseguir"
  })
  
  let userAdmin = await User.findAdm(userSession)
  
  userAdmin = userAdmin.rows[0]

  if (userAdmin.is_admin === false) return res.render('admin/chefs/list', {
    error: "ATENÇÃO área restrita a adminstradores do sistema"
  })

  req.user = userAdmin

  next()
}

module.exports = {
  blockedUserWithoutSessionOrIsNotAdmin
}