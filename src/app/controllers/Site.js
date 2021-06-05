const Home = require('../models/Site')

module.exports = {

  async home(req, res) {

    let { filter } = req.query

    if (filter) {
      let paramsFilter = await Home.findBy(filter)
      let params = paramsFilter.rows

      for (x = 0; x < params.length; x++) {
        params[x].path = `${req.protocol}://${req.headers.host}${params[x].path.replace("public", "")}`
      }
      return res.render('homes/filter', { params, filter })

    } else {

      let indexRecipes = await Home.all()

      let recipesAll = indexRecipes.rows

      for (x = 0; x < recipesAll.length; x++) {
        recipesAll[x].path = `${req.protocol}://${req.headers.host}${recipesAll[x].path.replace("public", "")}`
      }

      const recipes = []
      if (recipesAll.length >= 1) {
        for (let index = 0; index <= 5; index++) {
          recipes.push(recipesAll[index])
        }
      }
      return res.render('homes/index', { recipes })

    }
  },

  async list(req, res) {
    let listRecipes = await Home.all()
    let recipes = listRecipes.rows

    for (x = 0; x < recipes.length; x++) {
      recipes[x].path = `${req.protocol}://${req.headers.host}${recipes[x].path.replace("public", "")}`
    }
    return res.render('homes/recipes', { recipes })

  },

  about(req, res) {
    return res.render("homes/about")
  },

  async description(req, res) {
    let recipeDetail = await Home.find(req.params.id)
    let recipe = recipeDetail.rows

    if (!recipe) return res.send('Receita não encontrada')

    const getFile = await Home.files(recipe[0].id)
    let files = getFile.rows
    files = files.map(file => ({
      ...file,
      src: `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
    }))

    return res.render('homes/description', { recipe, files })

  },

  async chefs(req, res) {
    let chefs1 = await Home.listChefs()
    let chefs = chefs1.rows

    for (x = 0; x < chefs.length; x++) {
      chefs[x].path = `${req.protocol}://${req.headers.host}${chefs[x].path.replace("public", "")}`
    }
    return res.render('homes/chefs', { chefs })
  },

  filter(req, res) {
    let { filter } = req.query

    const params = {
      filter,
      callback(recipes) {
        return res.render('homes/filter', { filter })
      }
    }

    Home.findBy(params)
  }

}

