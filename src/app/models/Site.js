const db = require('../../config/db')

module.exports = {
  all() {
    return db.query(`
      SELECT * FROM(
      SELECT DISTINCT on (recipes.id) recipes.* , chefs.name as chef_name, files.path
      FROM recipes
      LEFT JOIN chefs ON (recipes.chef_id = chefs.id)
      LEFT JOIN recipe_files ON (recipe_files.recipe_id = recipes.id)
      LEFT JOIN files ON (files.id = recipe_files.file_id)
      GROUP BY recipes.id, chefs.name, files.path
      )AS subselect
       ORDER BY updated_at DESC
    `)
  },
  listChefs() {
    return db.query(`
    SELECT chefs.*,files.path, count(recipes) as total
    FROM chefs
    LEFT JOIN recipes on (chefs.id = recipes.chef_id)
    LEFT JOIN files ON (files.id = chefs.file_id)
    GROUP BY chefs.id, files.path    
    `)
  },
  findBy(filter) {
    return db.query(`
      SELECT * FROM(
      SELECT DISTINCT on (recipes.id) recipes.* , chefs.name as chef_name, files.path
      FROM recipes
      LEFT JOIN chefs ON (recipes.chef_id = chefs.id)
      LEFT JOIN recipe_files ON (recipe_files.recipe_id = recipes.id)
      LEFT JOIN files ON (files.id = recipe_files.file_id)
      WHERE recipes.title ILIKE '%${filter}%'
      GROUP BY recipes.id, chefs.name, files.path
      )AS subselect
       ORDER BY updated_at DESC
    `)
  },
  find(id) {
    return db.query(`
    SELECT recipes.*, chefs.name as chefs_name
    FROM recipes
    LEFT JOIN chefs on recipes.chef_id = chefs.id
    WHERE recipes.id = $1
    GROUP BY recipes.id, chefs.name
    `, [id])
  },
  files(id) {
    return db.query(`
    SELECT files.*
    FROM files
    LEFT JOIN recipe_files on recipe_files.file_id = files.id
    WHERE recipe_files.recipe_id = $1
    `, [id])
  },
}
