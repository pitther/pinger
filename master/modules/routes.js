import {LOGS_SECRET, SLAVE_SECRET} from "../util/const.js";

const normalizeLogs = (logs) => {
    const result = [];

    for (const log of logs) {
        const {label, status, timestamp} = log;
        const slave = result.find(slave => slave.label === label);
        if (slave) {
            if (slave.logs[slave.logs.length - 1].status === status){
                slave.logs[slave.logs.length - 1].timestamp = timestamp;
                continue;
            }
            slave.logs.push({status, timestamp});
        } else {
            result.push({
                label,
                logs: [{status, timestamp}]
            });
        }
    }

    return result;
}

export const registerRoutes = (fastify, slavesTimestamps, notifier, db) => {
    fastify.post('/', async (request, reply) => {
        if (!request.body.label || !request.body.secret) {
            return reply.code(400).send({success: false, message: 'Missing label or secret'});
        }

        const {label, secret} = request.body;

        if (secret !== SLAVE_SECRET) {
            return reply.code(403).send({success: false, message: 'Invalid secret'});
        }

        slavesTimestamps[label] = new Date();
        await notifier.slaveAction(label, true);

        return {
            success: true
        }
    });

    fastify.get('/logs', async (request, reply) => {
        if (!request.query.secret) {
            return reply.code(400).send({success: false, message: 'Missing secret'});
        }

        const {secret} = request.query;

        if (secret !== LOGS_SECRET) {
            return reply.code(403).send({success: false, message: 'Invalid secret'});
        }

        const logs = await db.getAllSlaveLogs();

        return normalizeLogs(logs);
    });
}