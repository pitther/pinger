import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
    label: String,
    status: Boolean,
    timestamp: Number,
});

logSchema.index({timestamp: -1});


export class MongoDB {
    constructor(uri) {
        mongoose.connect(uri, {
                useNewUrlParser: true,
            },
            (err) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log('Connected to MongoDB');
                }
            });

        this.logSchema = mongoose.model('logs', logSchema);
    }

    async writeSlaveLog(label, isAlive) {
        const log = new this.logSchema({
            label,
            status: isAlive,
            timestamp: Math.round(Date.now() / 1000),
        });
        await log.save();
    }

    async getAllSlaveLogs() {
        return this.logSchema.find().sort({timestamp: -1});
    }
}