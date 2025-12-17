import mongoose from "mongoose";

/*
  Villa Schema
  Represents a single villa property
*/
const villaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      type: String,
      required: true,
      index: true // helps with location filtering later
    }
  },
  {
    timestamps: true // creates createdAt & updatedAt automatically
  }
);

// Export model
const Villa = mongoose.model("Villa", villaSchema);
export default Villa;
