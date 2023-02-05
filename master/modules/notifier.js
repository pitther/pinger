import TelegramBot from "node-telegram-bot-api";
import {TELEGRAM_ADMIN_IDS, TELEGRAM_API_TOKEN, TRIGGER_TIME_S} from "../util/const.js";
import {getTimestampString} from "../util/util.js";

export class Notifier {
    constructor(slavesTimestamps, db) {
        this.slavesTimestamps = slavesTimestamps;
        this.db = db;

        this.whiteList = TELEGRAM_ADMIN_IDS;
        this.bot = new TelegramBot(TELEGRAM_API_TOKEN, {polling: true});

        this.addHandlers().then();
        this.actionHistory = {};
    }

    authCheck(msg) {
        return this.whiteList.includes(msg.chat.id.toString());
    }

    async addHandlers() {
        this.bot.on('message', async (msg) => {
            if (!this.authCheck(msg)) return;
            const {chat, text} = msg;
            const {id} = chat;

            if (text === '/status') {
                await this.sendSlavesStatus(id);
            }
        });
    }

    async notify(id, message) {
        if (!message.length) return false;
        try {
            await this.bot.sendMessage(id, message, {parse_mode: 'HTML'});
        } catch (e) {
            console.log(e);
        }
    }

    async notifyAll(message) {
        for (const id of this.whiteList) {
            await this.notify(id, message);
        }
    }

    checkAlive(label) {
        const timestamp = this.slavesTimestamps[label];
        return timestamp && (new Date() - timestamp) < TRIGGER_TIME_S * 1000;
    }

    getSlavesStatus() {
        const slavesStatus = [];
        for (const [label] of Object.entries(this.slavesTimestamps)) {
            const isAlive = this.checkAlive(label);
            const {lastAlive, lastDead} = this.actionHistoryGet(label);
            slavesStatus.push(`${isAlive?'💡':'🔦'} <b>${label}</b>: ${this.getStatusString(isAlive, isAlive ? new Date() - lastAlive : new Date() - lastDead, true)}`);
        }
        return slavesStatus.join('\n') || '<b>No slaves</b> 🙅‍♀️';
    }

    async sendSlavesStatus(id) {
        const slavesStatus = this.getSlavesStatus();
        await this.notify(id, slavesStatus);
    }

    formatStatusDuration(duration) {
        let seconds = parseInt((duration / 1000) % 60),
            minutes = parseInt((duration / (1000 * 60)) % 60),
            hours = parseInt((duration / (1000 * 60 * 60)) % 24);

        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;

        return hours + ":" + minutes + ":" + seconds;
    }

    getStatusString(isAlive, statusDuration, info = false) {
        if (info) {
            const intervalString = statusDuration ? `for ${this.formatStatusDuration(statusDuration)}` : '';
            return `${isAlive ? 'alive' : 'dead'} ${intervalString}`;
        }

        if (!statusDuration) return '';
        return `<pre>It was ${isAlive ? 'dead' : 'alive'} for ${this.formatStatusDuration(statusDuration)}</pre>`;
    }

    async actionNotify(label, isAlive, wasAliveForMs, wasDeadForMs) {
        await this.notifyAll(`${isAlive?'💡':'🔦'} Slave <b>${label}</b> is ${isAlive ? 'alive' : 'dead'}!\n${this.getStatusString(isAlive, isAlive ? wasDeadForMs : wasAliveForMs)}`);
    }

    async slaveAction(label, isAlive) {
        this.actionHistoryInit(label);

        const currentSlave = this.actionHistoryGet(label);
        const {lastAlive, lastDead} = currentSlave;

        if (currentSlave.isAlive === isAlive) return;
        await this.db.writeSlaveLog(label, isAlive);

        console.log(`${getTimestampString()}, ${label}:${isAlive}`);

        currentSlave.isAlive = isAlive;
        currentSlave.lastAlive = isAlive ? new Date() : lastAlive;
        currentSlave.lastDead = !isAlive ? new Date() : lastDead;

        const wasAliveForMs = (new Date() - lastAlive);
        const wasDeadForMs = (new Date() - lastDead);

        await this.actionNotify(label, isAlive, wasAliveForMs, wasDeadForMs);
    }

    actionHistoryInit(label) {
        if (!this.actionHistory[label]) {
            this.actionHistory[label] = {};
        }
    }

    actionHistoryGet(label) {
        return this.actionHistory[label];
    }
}