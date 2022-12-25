import {SLAVE_SECRET} from "../util/const.js";

export const registerRoutes = (fastify, slavesTimestamps, notifier) => {
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
}