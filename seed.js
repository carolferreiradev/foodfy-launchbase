const User = require('./src/app/models/User');
const { hash } = require('bcryptjs');
const faker = require('faker')

let usersIds = []

async function CreateUsers() {
  const users = [];
  const password = await hash('123', 8);

  users.push({
    name: faker.name.findName(),
    email: faker.internet.email(),
    password,
    is_admin: true
  })

  users.push({
    name: faker.name.findName(),
    email: faker.internet.email(),
    password,
    is_admin: false
  })

  const usersPromise = users.map(user => User.create(user))

  usersIds = await Promise.all(usersPromise)

}

CreateUsers()