const db = require('../../config/db')
const { date } = require('../../lib/utils')
const fs = require('fs')

module.exports = {
  all() {

    try {
      return db.query(`
    SELECT recipes.*, chefs.name as chefs_name, array_to_string(array_agg(files.path), ',')
    FROM recipes
    LEFT JOIN chefs on recipes.chef_id = chefs.id
    LEFT JOIN recipe_files on recipes.id = recipe_files.recipe_id 
    LEFT JOIN files on files.id = recipe_files.file_id
    GROUP BY recipes.id, chefs.name
    `)

    } catch (error) {
      return `Erro ao tentar buscar cadastros ${error}`
    }
  },
  create(data, userId) {
    const query = `
      INSERT INTO recipes(
        chef_id,
        user_id,
        title,
        ingredients,
        preparation,
        information,
        created_at,
        updated_at
      ) VALUES($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
        `

    const values = [
      data.chef_id,
      data.user_id,
      data.title,
      data.ingredients,
      data.preparation,
      data.information,
      date(Date.now()).iso,
      date(Date.now()).iso
    ]
    return db.query(query, values)
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
  findBy(filter, callback) {
    db.query(`
      SELECT recipes.* , count(recipes) AS total_recipes
      FROM recipes
      LEFT JOIN members ON(recipes.chef_id = chefs.id)
      WHERE recipes.name ILIKE '%${filter}%'
      GROUP BY recipes.id
      ORDER BY total_recipes ASC`, function (err, results) {
      if (err)
        throw new Error(`Erro ao tentar buscar cadastros ${err}`)

      callback(results.rows)
    })
  },
  update(data) {
    const query = `
      UPDATE recipes SET
      chef_id = ($1),
        title = ($2),
        ingredients = ($3),
        preparation = ($4),
        information = ($5)
      WHERE id = $6
        `

    const values = [
      data.chef_id,
      data.title,
      data.ingredients,
      data.preparation,
      data.information,
      data.id
    ]

    return db.query(query, values)
  },
  async delete(id) {
    try {
      let files = await db.query(`
      SELECT files.*
        FROM files
      LEFT JOIN recipe_files on recipe_files.file_id = files.id
      WHERE recipe_files.recipe_id = $1
        `, [id])

      if (files) {
        for (x = 0; x < files.rows.length; x++) {
          let file = files.rows[x]

          //DELETAR OS ARQUIVOS DA PASTA
          fs.unlinkSync(file.path)

          //DELETAR A CHAVE ESTRANGEIRA DESSES ARQUIVOS
          await db.query(`DELETE FROM recipe_files WHERE recipe_files.recipe_id = $1`, [id])

          //DELETAR OS ARQUIVOS
          await db.query(`DELETE FROM files WHERE id = ${file.id} `)

        }
        //DELETAR A RECEITA
        return await db.query(`DELETE FROM recipes WHERE id = $1`, [id])

      } else {
        //DELETAR A RECEITA
        return await db.query(`DELETE FROM recipes WHERE id = $1`, [id])
      }

    } catch (err) {
      console.log(err)
    }

  },
  chefsSelectOptions() {
    return db.query(`
      SELECT id, name FROM chefs
        `)
  },
  createFile(data) {
    const query = `
      INSERT INTO files(
        name,
        path
      ) VALUES($1, $2)
      RETURNING id
        `
    const values = [
      data.filename,
      data.path
    ]
    return db.query(query, values)
  },
  createFileInsert(idInsert, recipeId) {
    const query = `
      INSERT INTO recipe_files(
        recipe_id,
        file_id
      )VALUES($1, $2)
      RETURNING id
        `
    const values = [
      recipeId,
      idInsert
    ]

    return db.query(query, values)
  },
  files(id) {
    return db.query(`
      SELECT files.*
        FROM files
      LEFT JOIN recipe_files on recipe_files.file_id = files.id
      WHERE recipe_files.recipe_id = $1
        `, [id])
  },
  async deleteImage(id) {
    try {
      const result = await db.query(`SELECT * FROM files WHERE id = $1`, [id])
      const file = result.rows[0]

      fs.unlinkSync(file.path)

      await db.query(`DELETE FROM recipe_files WHERE recipe_files.file_id = $1`, [id])

      return db.query(`DELETE FROM files WHERE id = $1`, [id])

    } catch (err) {
      console.log(err)
    }
  }
}