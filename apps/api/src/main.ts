import "reflect-metadata";
import { createApp } from "./server.ts";

const port = Number(process.env.PORT ?? 3000);
const app = await createApp();

await app.listen(port, "0.0.0.0");

console.log(`OneColor API listening on http://0.0.0.0:${port}`);
