import { Sequelize } from 'sequelize'
import mysql from 'mysql2'

import { getSecret, Secrets } from '@common/Secrets'

const db = getSecret(Secrets.MYSQL_DATABASE)
const user = getSecret(Secrets.MYSQL_USER)
const pass = getSecret(Secrets.MYSQL_PASSWORD)

const sequelize = new Sequelize(db, user, pass, {
    host: 'db',
    dialect: 'mysql',
    dialectModule: mysql,
})

export { sequelize }
