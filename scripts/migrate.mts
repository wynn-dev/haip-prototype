import { connect } from "../src/db/connect";

const { migrate, close } = await connect();
await migrate();
await close();
console.log("✓ migrations applied", (process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL) ? "(neon)" : "(local pglite)");
