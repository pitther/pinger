import Fastify from 'fastify'
import {PORT} from "./util/const.js";
import {startLooper} from "./modules/looper.js";
import {registerRoutes} from "./modules/routes.js";
import {Notifier} from "./modules/notifier.js";

const fastify = Fastify({
    logger: false
});

const slavesTimestamps = {};

const notifier = new Notifier(slavesTimestamps);

registerRoutes(fastify, slavesTimestamps, notifier);

fastify.listen({port: PORT}, (err, address) => {
    console.log('Listening on:', address);
    if (err) throw err
});

startLooper(slavesTimestamps, notifier);