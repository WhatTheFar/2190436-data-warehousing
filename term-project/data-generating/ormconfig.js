let dotenv = require('dotenv')
dotenv.config()

module.exports = {
    type: 'mssql',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    "migrationsTableName": "MIGRATION",
    "migrations": ["src/migration/*.ts"],
    "cli": {
        "migrationsDir": "src/migration"
    }
}