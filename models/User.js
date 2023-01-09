const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['manager', 'employee'],
      // required: true,
    },
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  },
  {
    timestamps: true,
  },
);

const Task = mongoose.model('User', userSchema);
module.exports = Task;
