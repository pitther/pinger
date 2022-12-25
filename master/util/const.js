import * as dotenv from 'dotenv'
dotenv.config()

if (!process.env.SLAVE_SECRET) {
    throw new Error('MASTER_URL is not defined in the environment');
}

if (!process.env.TELEGRAM_API_TOKEN) {
    throw new Error('TELEGRAM_API_TOKEN is not defined in the environment');
}

if (!process.env.TELEGRAM_ADMIN_IDS) {
    throw new Error('TELEGRAM_ADMIN_IDS is not defined in the environment');
}

export const PORT = process.env.PORT || 3000;
export const TRIGGER_TIME_S = process.env.TRIGGER_TIME_S || 120;
export const SLAVE_SECRET = process.env.SLAVE_SECRET;
export const TELEGRAM_API_TOKEN = process.env.TELEGRAM_API_TOKEN;
export const TELEGRAM_ADMIN_IDS = process.env.TELEGRAM_ADMIN_IDS.split(' ');