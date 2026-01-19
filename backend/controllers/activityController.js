import Activity from "../models/activity.js";

// ==========================================
// 1. GET ALL (Safe & Simple)
// ==========================================
export const getActivities = async (req, res) => {
  try {
    // Sort by name alphabetically for better UX
    const activities = await Activity.find().sort({ name: 1 });
    res.status(200).json(activities);
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json({ error: "Failed to fetch activities" });
  }
};

// ==========================================
// 2. CREATE (Handles Duplicates & Empty Fields)
// ==========================================
export const createActivity = async (req, res) => {
  try {
    const { name, color } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Activity name is required" });
    }
    const newActivity = new Activity({
      name: name.trim(),
      color: color || "#ffffff",
    });
    await newActivity.save();
    res.status(201).json(newActivity);
  } catch (error) {
    // Handle Duplicate Name (Mongo Error 11000)
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ error: "An activity with this name already exists" });
    }
    console.error("Create Error:", error);
    res.status(500).json({ error: "Server error while creating activity" });
  }
};

// ==========================================
// 3. DELETE (Handles 'Not Found')
// ==========================================
export const deleteActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedActivity = await Activity.findByIdAndDelete(id);
    if (!deletedActivity) {
      return res.status(404).json({ error: "Activity not found" });
    }
    res.status(200).json({ message: "Activity deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ error: "Error deleting activity" });
  }
};

// ==========================================
// 4. UPDATE (Handles Duplicates & 'Not Found')
// ==========================================
export const updateActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;
    // Validation: Ensure we aren't saving an empty name
    if (name && !name.trim()) {
      return res.status(400).json({ error: "Activity name cannot be empty" });
    }
    const updatedActivity = await Activity.findByIdAndUpdate(
      id,
      { name: name?.trim(), color },
      { new: true, runValidators: true }, // runValidators checks Schema rules again
    );
    // Validation: If ID didn't match anything
    if (!updatedActivity) {
      return res.status(404).json({ error: "Activity not found" });
    }
    res.status(200).json(updatedActivity);
  } catch (error) {
    // Handle Duplicate (e.g., renaming "Gym" to existing "Coding")
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ error: "An activity with this name already exists" });
    }
    console.error("Update Error:", error);
    res.status(500).json({ error: "Error updating activity" });
  }
};
