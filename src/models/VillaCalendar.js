import mongoose from "mongoose";

/*
  VillaCalendar Schema
  Represents daily availability & pricing for a villa
*/
const villaCalendarSchema = new mongoose.Schema(
  {
    villa_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Villa",
      required: true,
      index: true
    },
    date: {
      type: Date,
      required: true
    },
    is_available: {
      type: Boolean,
      required: true
    },
    rate: {
      type: Number,
      required: true,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

/*
  Ensures one record per villa per date
  Equivalent to UNIQUE(villa_id, date)
*/
villaCalendarSchema.index(
  { villa_id: 1, date: 1 },
  { unique: true }
);

const VillaCalendar = mongoose.model(
  "VillaCalendar",
  villaCalendarSchema
);

export default VillaCalendar;
