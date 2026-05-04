const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: null
    },
    completed: {
      type: Boolean,
      default: false,
      required: true
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

todoSchema.index({ text: 'text' });

module.exports = mongoose.model('Todo', todoSchema);
