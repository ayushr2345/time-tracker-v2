import Activity from "../models/activity.js";

export const getActivities = async (req, res) => {
    try {
        const activities = await Activity.find();
        res.status(200).json(activities);
    } catch (error) {
        res.status(500).json({ message: "Error fetching activities", error });
    }
};

export const createActivity = async (req, res) => {
    try {
        const { name, color } = req.body;
        const newActivity = new Activity({ name, color });
        await newActivity.save();
        res.status(201).json(newActivity);
    } catch (error) {
        res.status(500).json({ message: "Error creating activity", error: error.message });
    }
};

export const deleteActivity = async (req, res) => {
    try {
        const { id } = req.params;
        await Activity.findByIdAndDelete(id);
        res.status(200).json({ message: "Activity deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting activity", error });
    }
};

export const updateActivity = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, color } = req.body;
        const updatedActivity = await Activity.findByIdAndUpdate(
            id,
            { name, color },
            { new: true }
        );
        res.status(200).json(updatedActivity);
    } catch (error) {
        res.status(500).json({ message: "Error updating activity", error });
    }
};

// TODO: Handle error codes more specifically in each controller function above
// TODO: error codes, like input missging, or duplicate found.