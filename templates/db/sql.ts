import mysql from 'mysql2/promise';
import { DB_NAME } from '../constants';

const connectDB = async () => {
  try {
    // Create a configuration object using environment variables.
    const connectionConfig = {
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.ENVIRONMENT === 'production'
        ? DB_NAME
        : process.env.MYSQL_DATABASE,
    };

    // Validate that essential connection info is provided.
    if (!connectionConfig.host || !connectionConfig.user || !connectionConfig.database) {
      throw new Error("MySQL connection configuration is not fully set");
    }

    const connection = await mysql.createConnection(connectionConfig);
    console.log("MySQL connected");

    return connection;
  } catch (error) {
    console.error("MySQL connection error:", error);
    process.exit(1);
  }
};

export default connectDB;