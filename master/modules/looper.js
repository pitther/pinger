import {TRIGGER_TIME_S} from "../util/const.js";

export const startLooper = (slavesTimestamps, notifier) => {
    setInterval(async () => {
        for (const [slaveLabel, slaveTimestamp] of Object.entries(slavesTimestamps)) {
            if (new Date() - slaveTimestamp > TRIGGER_TIME_S * 1000) {
                await notifier.slaveAction(slaveLabel, false);
            }
        }
    }, 1000);
}
