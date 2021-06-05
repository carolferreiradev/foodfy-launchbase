const Administrator = require('../models/Administrator')
const User = require('../models/User')
const { date } = require('../../lib/utils')

async function verificationAdminOrUserCreated(id_recipe, id_user) {

  let adm = await User.findAdm(id_user)
  adm = adm.rows

  if (adm.length >= 1) return 1

  let user = await User.verificationAdminUser(id_recipe, id_user)
  user = user.rows
  return user.length >= 1 ? 1 : 0

}

module.exports = {

  async index(req, res) {

    let recipes = await Administrator.all()
    recipes = recipes.rows

    for (let x = 0; x < recipes.length; x++) {
      recipes[x].array_to_string = recipes[x].array_to_string.replace(/public/g, `${req.protocol}://${req.headers.host}`)
      recipes[x].array_to_string = recipes[x].array_to_string.split(",")
    }
    return res.render('admin/recipes/index', { recipes })
  },

  async create(req, res) {
    const chefs = await Administrator.chefsSelectOptions()
    let chefOptions = chefs.rows

    res.render('admin/recipes/create', { chefOptions })
  },

  async post(req, res) {
    try {
      const keys = Object.keys(req.body)

      for (let key of keys) {
        if (req.body[key] == '' && key !== "information") {
          return res.send('Preencha todos os campos obrigatórios')
        }
      }
      if (req.files.length == 0) {
        return res.send('POR FAVOR SELECIONE AO MENOS UMA IMAGEM')
      }

      const { chef_id, user_id, title, ingredients, preparation, information } = req.body;

      const arrIngredients = ingredients.toString().split(',')
      const arrPreparation = preparation.toString().split(',')

      const datas = {
        chef_id,
        user_id,
        title,
        ingredients: arrIngredients,
        preparation: arrPreparation,
        information
      }

      let results = await Administrator.create(datas)
      const recipeId = results.rows[0].id

      const filesPromise = req.files.map(file => Administrator.createFile(file))
      await Promise.all(filesPromise)
        .then((values) => {
          for (let n = 0; n < values.length; n++) {
            let array = values[n].rows
            for (let x = 0; x < array.length; x++) {
              let idInsert = array[x].id
              Administrator.createFileInsert(idInsert, recipeId)
            }
          }
        })

      return res.redirect(`/admin/recipes/${recipeId}`)

    } catch (error) {
      console.log(error)
    }
  },

  async show(req, res) {

    let user = await verificationAdminOrUserCreated(req.params.id, req.session.userId)

    let results = await Administrator.find(req.params.id)
    const recipe = results.rows[0]
    if (!recipe) return res.send('Receita nao encontrada')

    recipe.created_at = date(recipe.created_at).format

    const getFile = await Administrator.files(recipe.id)
    let files = getFile.rows
    files = files.map(file => ({
      ...file,
      src: `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
    }))

    return res.render('admin/recipes/show', { recipe, files, user })

  },

  async edit(req, res) {
    try {
      let user = await verificationAdminOrUserCreated(req.params.id, req.session.userId)

      let results = await Administrator.find(req.params.id)
      if (!results) return res.send('Receita nao encontrada')

      const recipe = results.rows[0]

      let chefs = await Administrator.chefsSelectOptions()
      const chefOptions = chefs.rows

      let fileAdm = await Administrator.files(recipe.id)
      let files = fileAdm.rows
      files = files.map(file => ({
        ...file,
        src: `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
      }))

      return res.render('admin/recipes/edit', { recipe, chefOptions, files, user })

    } catch (error) {
      console.log(error)
    }
  },

  async put(req, res) {
    try {
      const { id, chef_id, idRecipeFile, removed_file, title, ingredients, preparation, information } = req.body;
      let user = await verificationAdminOrUserCreated(id, req.session.userId)

      const arrIngredients = ingredients.toString().split(',')
      const arrPreparation = preparation.toString().split(',')

      if (user === 1) {

        if (removed_file) {

          const removedFiles = removed_file.split(",")
          const lastIndex = removedFiles.length - 1
          removedFiles.splice(lastIndex, 1)

          const removedFilesPromise = removedFiles.map(id => Administrator.deleteImage(id))

          await Promise.all(removedFilesPromise)
        }

        const datas = {
          id,
          chef_id,
          idRecipeFile,
          removed_file,
          title,
          ingredients: arrIngredients,
          preparation: arrPreparation,
          information
        }

        await Administrator.update(datas)

        // ADICIONANDO IMAGENS
        const recipeId = id

        const filesPromise = req.files.map(file => Administrator.createFile(file))
        await Promise.all(filesPromise)
          .then((values) => {
            for (n = 0; n < values.length; n++) {
              let array = values[n].rows
              for (x = 0; x < array.length; x++) {
                let idInsert = array[x].id
                Administrator.createFileInsert(idInsert, recipeId)
              }
            }
          })

        return res.redirect(`/admin/recipes/${req.body.id}`)

      } else {
        return res.render('admin/recipes', {
          error: "Área restrita a adminstradores do sistema"
        })
      }
    } catch (error) {
      console.log(error)
    }
  },

  async delete(req, res) {
    try {
      let user = await verificationAdminOrUserCreated(req.body.id, req.session.userId)
      if (user == 1) {
        await Administrator.delete(req.body.id)
        res.redirect('/admin/recipes')
      } else {
        return res.render('admin/recipes', {
          error: "Área restrita a adminstradores do sistema"
        })
      }

    } catch (error) {

    }
  },
}
