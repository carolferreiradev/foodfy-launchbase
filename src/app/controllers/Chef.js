const Chefs = require('../models/Chef')
const User = require('../models/User')

module.exports = {

  async index(req, res) {
    const userSession = req.session.userId
    let user = await User.findAdm(userSession)
    user = user.rows[0]

    let allChefs1 = await Chefs.all()
    let allChefs = allChefs1.rows

    for (x = 0; x < allChefs.length; x++) {
      if (allChefs[x].path == null) {
        allChefs[x].path = null
      } else {
        allChefs[x].path = `${req.protocol}://${req.headers.host}${allChefs[x].path.replace("public", "")}`
      }
    }
    return res.render('admin/chefs/list', { allChefs, user })
  },

  create(req, res) {
    res.render('admin/chefs/create')
  },

  async post(req, res) {
    const keys = Object.keys(req.body)

    for (key of keys) {
      if (req.body[key] == "") {
        return res.send('Preencha todos os campos')
      }
    }
    if (req.files.length == 0) {
      return res.send('POR FAVOR SELECIONE AO MENOS UMA IMAGEM')
    }
    //PRIMEIRO INSERIR A IMAGEM NA TABELA E RETORNAR O ID DELA

    const chefInsert = await Chefs.create(req.body, req.files)
    let chef = chefInsert.rows[0]

    return res.redirect(`/admin/chefs/${chef.id}`)

  },

  async show(req, res) {
    const userSession = req.session.userId
    let user = await User.findAdm(userSession)
    if (user) user = user.rows[0]


    //selecionando os dados do Chef
    let chefData = await Chefs.find(req.params.id)
    if (!chefData) return res.send('Chef not found...')
    let chef = chefData.rows[0]

    if(chef.path) chef.path = `${req.protocol}://${req.headers.host}${chef.path.replace("public", "")}`

    let recipesCount = await Chefs.countRecipes(req.params.id)
    const total = recipesCount.rows[0].count

    if (total > 0) {
      let chefRecipe1 = await Chefs.listRecifesOfChef(chef.id)
      let recipes = chefRecipe1.rows

      for (x = 0; x < recipes.length; x++) {
        if (recipes[x].path == null) {
          recipes[x].path = null
        } else {
          recipes[x].path = `${req.protocol}://${req.headers.host}${recipes[x].path.replace("public", "")}`
        }
      }
      return res.render('admin/chefs/detail', { recipes, total, chef, user })

    } else {
      const getFile = await Chefs.files(chef.file_id)
      let files = getFile.rows
      files = files.map(file => ({
        ...file,
        src: `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
      }))

      return res.render('admin/chefs/detail', { chef, total, files, user })
    }
  },

  async edit(req, res) {
    let chefFind = await Chefs.find(req.params.id)
    let chef = chefFind.rows[0]

    const getFile = await Chefs.files(chef.file_id)
    let files = getFile.rows
    files = files.map(file => ({
      ...file,
      src: `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
    }))

    if (!chef) return res.send('Chef Not Found')
    return res.render('admin/chefs/edit', { chef, files })

  },

  async put(req, res) {
    const keys = Object.keys(req.body)

    for (key of keys) {
      if (req.body[key] == "" && key != "removed_file") {
        return res.send('Preencha todos os campos...')
      }
    }

    let fileNew = ""
    if (req.files.length != 0) {
      const newFilesPromise = await Chefs.filesCreate(req.files[0])
      fileNew = newFilesPromise.rows[0]
    }

    if (req.body.removed_file) {
      const removedFiles = req.body.removed_file.split(',')
      const lastIndex = removedFiles.length - 1
      removedFiles.splice(lastIndex, 1)

      await Chefs.fileDelete(removedFiles[0])

      await Chefs.update(req.body, fileNew.id)
    } else {
      await Chefs.updateWithoutFile(req.body)
    }


    return res.redirect(`/admin/chefs/${req.body.id}`)
  },
  
  async delete(req, res) {

    let total1 = await Chefs.countRecipes(req.body.id)
    let total = total1.rows[0].count

    if (total > 0) {
      return res.render(`admin/chefs/invalid`)
    } else {
      await Chefs.delete(req.body.id)

      res.redirect('/admin/chefs')
    }
  }
}