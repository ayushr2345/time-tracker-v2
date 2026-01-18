import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: { unique: true, collation: { locale: "en", strength: 2 } },
  },
  color: { type: String, required: true, default: "#ffffff" },
});

export default mongoose.model("Activity", activitySchema);
