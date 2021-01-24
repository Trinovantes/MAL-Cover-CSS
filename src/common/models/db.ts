import { Sequelize } from 'sequelize'
import mysql from 'mysql2'

import { getSecret, Secrets } from '@common/Secrets'

const host = getSecret(Secrets.MYSQL_HOST)
const db = getSecret(Secrets.MYSQL_DATABASE)
const user = getSecret(Secrets.MYSQL_USER)
const pass = getSecret(Secrets.MYSQL_PASSWORD)

const sequelize = new Sequelize(db, user, pass, {
    host: host,
    dialect: 'mysql',
    dialectModule: mysql,
})

export { sequelize }
