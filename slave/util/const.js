if (!process.env.MASTER_URL) {
    throw new Error('MASTER_URL is not defined in the environment');
}

if (!process.env.SLAVE_SECRET) {
    throw new Error('SLAVE_SECRET is not defined in the environment');
}

export const SLAVE_LABEL = process.env.SLAVE_LABEL || 'Unnamed slave';
export const MASTER_URL = process.env.MASTER_URL || 'http://localhost:8080';
export const PORT = process.env.PORT || 3000;
export const REQUESTS_INTERVAL_S = process.env.REQUESTS_INTERVAL_S || 60;
export const SLAVE_SECRET = process.env.SLAVE_SECRET;