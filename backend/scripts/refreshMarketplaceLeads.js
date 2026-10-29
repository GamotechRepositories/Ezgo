import dotenv from 'dotenv';
import connectDB from '../src/config/db.js';
import { ensureOpenMarketplaceLeads } from '../src/config/seedData.js';
import { ensurePortalLogins } from '../src/config/demoPasswords.js';

dotenv.config();
await connectDB();
await ensurePortalLogins();
await ensureOpenMarketplaceLeads();
process.exit(0);
