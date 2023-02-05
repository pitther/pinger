import Fastify from 'fastify'
import {MONGODB_URI, PORT} from "./util/const.js";
import {startLooper} from "./modules/looper.js";
import {registerRoutes} from "./modules/routes.js";
import {Notifier} from "./modules/notifier.js";
import {MongoDB} from "./modules/db.js";

const fastify = Fastify({
    logger: false
});

const slavesTimestamps = {};

const db = new MongoDB(MONGODB_URI);
const notifier = new Notifier(slavesTimestamps, db);

registerRoutes(fastify, slavesTimestamps, notifier, db);

fastify.listen({port: PORT}, (err, address) => {
    console.log('Listening on:', address);
    if (err) throw err
});

startLooper(slavesTimestamps, notifier);