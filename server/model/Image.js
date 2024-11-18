const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true, // This adds createdAt and updatedAt fields
  }
);

const Image = mongoose.model('Image', imageSchema);

module.exports = Image;
