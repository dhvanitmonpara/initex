// db.ts
import { PrismaClient } from "@prisma/client";

// Prevent multiple instances in development (hot-reload)
const prisma = global.prisma || new PrismaClient();
global.prisma = prisma;

export default prisma;
