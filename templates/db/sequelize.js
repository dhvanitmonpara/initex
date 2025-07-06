import { Sequelize } from "sequelize";

const dialect = process.env.DB_TYPE === 'MySQL' ? 'mysql' : 'postgres';
const connectionString = process.env[ dialect === 'mysql' ? 'MYSQL_URI' : 'POSTGRES_URI' ];

if (!connectionString) {
  throw new Error('Database connection URI is not set');
}

const sequelize = new Sequelize(connectionString, {
  dialect, // 'mysql' or 'postgres'
  // add extra options as needed
});

export default sequelize;