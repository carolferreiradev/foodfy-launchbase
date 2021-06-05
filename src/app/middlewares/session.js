const User = require('../models/User')

function onlyUser(req, res, next){
  if(!req.session.userId) return res.redirect('/login')
  next()
}
async function justAdmin(req, res, next){
  let session = req.session.userId
  if(session == undefined){
    return res.redirect('/login')
  }
  let user = await User.findAdm(req.session.userId)
  user = user.rows[0]
  
  if(user.is_admin === false) return res.render('admin/userAcess/index', {
    user,
    error:"Área restrita a usuários adminstradores"
  })

  next()
}

module.exports = {
  onlyUser,
  justAdmin
}