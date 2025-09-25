const mongoose = require("mongoose")
const { Schema } = mongoose;

const eventSchema = new Schema({
  photo: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
  },
  timeStart: {
    type: String,
    required: true,
  },
  timeEnd: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: function () {
        return this.online === false
    },
  },
  online: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ["sports", "party", "concert", "tech", "religion", "education"],
    required: true
  },
  tags: {
    type: [String],
    required: true
  },
  free: {
      type: Boolean,
      default: false,
    },
  regularEnabled: {
        type: Boolean,
        default: false
    },
  vipEnabled: {
        type: Boolean,
        default: false
    },
  regular: {
      type: Number,
      required: function () {
        return !this.free && this.regularEnabled
      },
    },
  vip: {
      type: Number,
      required: function () {
        return !this.free && this.vipEnabled
      },
      min: 0
    },
  hostedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  attendees: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ]
},
{timestamps : true}
);

module.exports = mongoose.model("Event", eventSchema);
