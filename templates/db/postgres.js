import { Pool } from 'pg';
import { DB_NAME } from '../constants';

const connectDB = async () => {
  try {
    // Construct the connection string. In production, you might append the DB_NAME.
    const connectionString = process.env.ENVIRONMENT === 'production'
      ? \`\${process.env.POSTGRES_URI}\${DB_NAME}\`
      : process.env.POSTGRES_URI;

    if (!connectionString) {
      throw new Error("POSTGRES_URI is not set");
    }

    const pool = new Pool({ connectionString });

    // Test the connection by running a simple query.
    await pool.query('SELECT NOW()');
    console.log("PostgreSQL connected");

    return pool;
  } catch (error) {
    console.error("PostgreSQL connection error:", error);
    process.exit(1);
  }
};

export default connectDB;