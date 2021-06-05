const db = require('../../config/db')
const { date } = require('../../lib/utils')

module.exports = {
  async create(data) {
    try {
      const query = `
        INSERT INTO users(
          name,
          email,
          password,
          is_admin,
          created_at,
          updated_at
        )VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
  `
      const values = [
        data.name,
        data.email,
        data.password,
        data.is_admin,
        date(Date.now()).iso,
        date(Date.now()).iso
      ]

      return db.query(query, values)

    } catch (error) {

      console.log(error)

    }
  },

  async list() {
    return db.query(`
      SELECT * FROM users
 `)
  },
  
  async user(id) {
    return db.query(`
    SELECT * FROM users
    WHERE users.id = $1
    `, [id])
  },

  async put(data) {
    try {
      const query = `
      UPDATE users SET
      name = ($1),
      email = ($2),
      is_admin = ($3),
      updated_at = ($4)
      WHERE id = $5
      `
      data.is_admin = verifyIsAdm(data.is_admin)

      const values = [
        data.name,
        data.email,
        data.is_admin,
        date(Date.now()).iso,
        data.id
      ]
      return db.query(query, values)

    } catch (error) {
      console.log(error)
    }
  },

  async delete(id) {
    return await db.query(
      `DELETE FROM users
      WHERE users.id = $1 
      `, [id])
  },

  async findOne(email) {
    return await db.query(
      `SELECT *
    FROM users
    WHERE users.email = '${email}'
    `)
  },

  async alterUser(data) {
    try {
      const query = `
      UPDATE users SET
      name = ($1),
      updated_at = ($2)
      WHERE id = $3
      `

      const values = [
        data.name,
        date(Date.now()).iso,
        data.id
      ]

      await db.query(query, values)


    } catch (error) {
      console.log(error)
    }
  },

  async findAdm(id) {
    try {
      return await db.query(
        `
        SELECT * FROM users
        WHERE users.id = ${id}
        `
      )

    } catch (error) {
      console.log(error)
    }
  },

  //QUERY DINAMICA
  async updatePassword(id, fields) {
    let query = "UPDATE users SET"

    Object.keys(fields).map((key, index, array) => {
      if ((index + 1) < array.length) {
        query = `${query}
          ${key} = '${fields[key]}',
        `
      } else {
        query = `${query}
          ${key} = '${fields[key]}'
          WHERE id = ${id}
        `
      }
    })

    await db.query(query)
    return
  },

  async verificationAdminUser(idRecipe, idUser) {
    return db.query(`
    SELECT * FROM recipes
    WHERE recipes.id = ${idRecipe} 
    AND
    recipes.user_id = ${idUser}
    `)
  },

  async verificationUserCadRecipeBeforeDelete(user_id){
    return db.query(`
    SELECT * FROM recipes
    WHERE recipes.user_id = ${user_id}
    `)
  }
}