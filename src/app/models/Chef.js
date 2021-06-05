const db = require('../../config/db')
const { date } = require('../../lib/utils')
const fs = require('fs')


module.exports = {
  all() {
    return db.query(`
   SELECT chefs.*,files.path
   FROM chefs
   LEFT JOIN files ON (files.id = chefs.file_id)
   GROUP BY chefs.id, files.path   
    `)
  },
  async create(data, file) {

    //PRIMEIRO INSERIR A IMAGEM NA TABELA E RETORNAR O ID DELA
    const filesInsert = `
      INSERT INTO files (
        name, 
        path
      ) VALUES ($1, $2)
      RETURNING id
    `
    const filesValue = [
      file[0].filename,
      file[0].path
    ]
    let fileRecovery = await db.query(filesInsert, filesValue)
    let fileId = fileRecovery.rows[0]

    //INSERIR O NOME DO CHEF, O CREATED_AT E O ID DA IMAGEM
    const queryChef = `
      INSERT INTO chefs(
        name,
        created_at,
        file_id,
        updated_at
      ) VALUES ($1, $2, $3, $4)
      RETURNING id
    `
    const valuesChef = [
      data.name,
      date(Date.now()).iso,
      fileId.id,
      date(Date.now()).iso
    ]

    return db.query(queryChef, valuesChef)
  },
  find(id) {
    return db.query(`
    SELECT chefs.*, files.path
    FROM chefs
    LEFT JOIN files on (files.id = chefs.file_id)
    WHERE chefs.id = $1
    GROUP BY chefs.id, files.path
    `, [id])
  },
  listRecifesOfChef(id) {
    return db.query(`
    SELECT DISTINCT on (recipes.id) recipes.*, files.path
    FROM recipes
    LEFT JOIN chefs on (chefs.id = recipes.chef_id)
    LEFT JOIN recipe_files on (recipe_files.recipe_id = recipes.id)
    LEFT JOIN files on (files.id = recipe_files.file_id)
    WHERE chefs.id = $1
    `, [id])
  },
  countRecipes(id) {
    return db.query(`
  SELECT count(recipes)
  FROM chefs
  LEFT JOIN recipes on (recipes.chef_id = chefs.id)
  WHERE chefs.id = $1
  GROUP BY chefs.id`, [id])
  },
  update(data, file) {
    const query = `
    UPDATE chefs SET
    name = ($1),
    file_id = ($2)
    WHERE id = $3
    `
    const values = [
      data.name,
      file,
      data.id
    ]

    return db.query(query, values)
  },
  updateWithoutFile(data) {
    const query = `
    UPDATE chefs SET
    name = ($1)
    WHERE id = $2
    `
    const values = [
      data.name,
      data.id
    ]

    return db.query(query, values)
  },
  async delete(id) {
    try {
      const result = await db.query(`
    SELECT files.*
    FROM files
    LEFT JOIN chefs on chefs.file_id = files.id
    WHERE chefs.id = $1
    `, [id])

      let file = result.rows[0]

      await db.query(`DELETE FROM chefs WHERE id = $1`, [id])
      if (file != undefined) {
        fs.unlinkSync(file.path)
        await db.query(`DELETE FROM files WHERE id = ${file.id}`)
      }

    } catch (err) {
      console.log(`ERRO AO TENTAR DELETAR CHEF: ${err}`)
    }
  },
  files(id) {
    return db.query(`SELECT files.*
    FROM files
    LEFT JOIN chefs on chefs.file_id = files.id
    WHERE chefs.file_id = $1`, [id])
  },
  async filesCreate(data) {
    const query = `
     INSERT INTO files (
       name, 
       path
     ) VALUES ($1, $2)
     RETURNING id
   `
    const values = [
      data.filename,
      data.path
    ]
    return await db.query(query, values)
  },
  async fileDelete(id) {
    try {
      let result = await db.query(`SELECT * FROM files WHERE id = $1`, [id])
      const file = result.rows[0]

      await fs.unlinkSync(file.path)

      await db.query(`UPDATE chefs SET file_id = NULL WHERE chefs.file_id = $1`, [id])

      return await db.query(`DELETE FROM files WHERE id = $1`, [id])

    } catch (err) {
      console.log(err)
    }
  }
}