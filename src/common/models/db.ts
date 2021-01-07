import { Sequelize } from 'sequelize'
import mysql from 'mysql2'

const db = process.env.MYSQL_DB || ''
const user = process.env.MYSQL_USER || ''
const pass = process.env.MYSQL_PASS || ''

const sequelize = new Sequelize(db, user, pass, {
    host: 'localhost',
    dialect: 'mysql',
    dialectModule: mysql,
})

export { sequelize }
