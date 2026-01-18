import activityLog from "../models/activityLog.js";

export const getActivityLogs = async (req, res) => {
    try {
        const activityLogs = await activityLog.find();
        res.status(200).json(activityLogs);
    } catch (error) {
        res.status(500).json({ message: "Error fetching activity logs", error });
    }
};

export const createActivityLog = async (req, res) => {
    try {
        const { activityId, duration, date } = req.body;
        const newActivityLog = new activityLog({ activityId, duration, date });
        await newActivityLog.save();
        res.status(201).json(newActivityLog);
    } catch (error) {
        res.status(500).json({ message: "Error creating activity log", error });
    }
};

export const deleteActivityLog = async (req, res) => {
    try {
        const { id } = req.params;
        await activityLog.findByIdAndDelete(id);
        res.status(200).json({ message: "Activity log deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting activity log", error });
    }
};

export const updateActivityLog = async (req, res) => {
    try {
        const { id } = req.params;
        const { activityId, duration, date } = req.body;
        const updatedActivityLog = await activityLog.findByIdAndUpdate(
            id,
            { activityId, duration, date },
            { new: true }
        );
        res.status(200).json(updatedActivityLog);
    } catch (error) {
        res.status(500).json({ message: "Error updating activity log", error });
    }
};
