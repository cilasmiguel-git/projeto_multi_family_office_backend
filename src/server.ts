import { config } from 'dotenv';
config();

import { buildApp } from './core/http/app.js';

const app = await buildApp();
const port = Number(process.env.PORT ?? 8080);
const host = '0.0.0.0';

await app.listen({ host, port });
console.log(`✅ Backend running on http://localhost:${port}`);
