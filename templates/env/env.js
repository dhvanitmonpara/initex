import "dotenv/config";
import { z } from "zod";

const buildZodObject = () => {
  const zodObject = {
    PORT: z.coerce.number().default(8000),
    ENVIRONMENT: z.enum(["development", "production", "test"]),
    HTTP_SECURE_OPTION: z.string(),
    ACCESS_CONTROL_ORIGIN: z.string(),
  }

  if (answers.dbType === "PostgreSQL") {
    zodObject.POSTGRES_URI = z.string()
    zodObject.DB_TYPE = z.enum(["postgres", "mysql"])
  }
  
  if (answers.dbType === "MongoDB") {
    zodObject.MYSQL_HOST = z.string()
    zodObject.MYSQL_USER = z.string()
    zodObject.MYSQL_PASSWORD = z.string()
    zodObject.MYSQL_DATABASE = z.string()
    zodObject.DB_TYPE = z.enum(["postgres", "mysql"])
  }

  return zodObject
}

const zodObject = buildZodObject();
const envSchema = z.object(zodObject);

export const env = envSchema.parse(process.env);
