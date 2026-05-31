const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const periodEntrySchema = new Schema({

    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    startDate: {
        type: Date,
        required: true
    },

    endDate: {
        type: Date,
        required: true
    },

    periodLength: {
        type: Number
    },

    cycleLength: {
        type: Number,
        default: null
    },

    predictedNextPeriod: {
        type: Date,
        default: null
    },

    predictedOvulation: {
        type: Date,
        default: null
    },

    fertileWindowStart: {
        type: Date,
        default: null
    },

    fertileWindowEnd: {
        type: Date,
        default: null
    },

    flowIntensity: {
        type: String,
        enum: ["Light", "Medium", "Heavy"],
        default: "Medium"
    },

    symptoms: [{
        type: String
    }],

    notes: {
        type: String,
        trim: true,
        default: ""
    }

}, { timestamps: true });

module.exports = model("PeriodEntry", periodEntrySchema);