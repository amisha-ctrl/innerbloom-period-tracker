const periodEntry = require("../models/PeriodEntry.js");

exports.userPeriodEntry = async (req, res) => {
    try {
        const userId = req.user.id;

        const { startDate, endDate, flowIntensity, symptoms, notes } = req.body;

        if (!startDate || !endDate || !flowIntensity) {
            return res.status(400).json({
                message: "Please Fill all required fields"
            });
        }

        const currentStartDate = new Date(startDate);
        const currentEndDate = new Date(endDate);

        if (currentEndDate < currentStartDate) {

            return res.status(400).json({
                message: "End Date cannot be before Start Date"
            });

        }

        const oneDay = 1000 * 60 * 60 * 24;

        const periodLength = Math.round((currentEndDate - currentStartDate) / oneDay) + 1;

        const previousEntry = await periodEntry.findOne({ userId }).sort({ startDate: -1 });

        if (previousEntry &&
            currentStartDate <= previousEntry.startDate) {

            return res.status(400).json({
                message:
                    "New period must be after previous period"
            });

        }

        let cycleLength = null;

        if (previousEntry) {
            cycleLength = Math.round((currentStartDate - previousEntry.startDate) / oneDay);
        }

        let predictedNextPeriod = null;

        if (cycleLength) {
            predictedNextPeriod = new Date(currentStartDate);

            predictedNextPeriod.setDate(predictedNextPeriod.getDate() + cycleLength);
        }

        let predictedOvulation = null;

        if (predictedNextPeriod) {
            predictedOvulation = new Date(predictedNextPeriod);

            predictedOvulation.setDate(predictedOvulation.getDate() - 14);
        }

        let fertileWindowStart = null;
        let fertileWindowEnd = null;

        if (predictedOvulation) {

            fertileWindowStart =
                new Date(predictedOvulation);

            fertileWindowStart.setDate(
                fertileWindowStart.getDate() - 5
            );

            fertileWindowEnd =
                new Date(predictedOvulation);

            fertileWindowEnd.setDate(
                fertileWindowEnd.getDate() + 1
            );

        }

        console.log({
            userId,
            currentStartDate,
            currentEndDate,
            periodLength,
            cycleLength,
            predictedNextPeriod,
            predictedOvulation,
            fertileWindowStart,
            fertileWindowEnd,
            flowIntensity,
            symptoms,
            notes
        });

        await periodEntry.create({ userId, startDate: currentStartDate, endDate: currentEndDate, periodLength, cycleLength, predictedNextPeriod, predictedOvulation, fertileWindowStart, fertileWindowEnd, flowIntensity, symptoms, notes });

        res.status(200).json({ message: "Data Saved Successfully" });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
}

exports.getDashboardData = async (req, res) => {

    try {

        const userId = req.user.id;

        // All entries
        const entries = await periodEntry
            .find({ userId })
            .sort({ startDate: -1 });

        // No data
        if (entries.length === 0) {

            return res.status(200).json({
                totalCycles: 0,
                averageCycleLength: 0,
                averagePeriodLength: 0,
                longestCycle: 0,
                history: []
            });

        }

        // Latest entry
        const latestEntry = entries[0];

        // Average Cycle Length
        const validCycleLengths =
            entries.filter(e => e.cycleLength);

        const averageCycleLength =
            Math.round(
                validCycleLengths.reduce(
                    (acc, curr) =>
                        acc + curr.cycleLength,
                    0
                ) / validCycleLengths.length
            );

        // Average Period Length
        const averagePeriodLength =
            Math.round(
                entries.reduce(
                    (acc, curr) =>
                        acc + curr.periodLength,
                    0
                ) / entries.length
            );

        // Longest Cycle
        const longestCycle =
            Math.max(
                ...validCycleLengths.map(
                    e => e.cycleLength
                )
            );

        res.status(200).json({

            totalCycles: entries.length,

            averageCycleLength,

            averagePeriodLength,

            longestCycle,

            latestEntry,

            history: entries

        });

    }

    catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

}