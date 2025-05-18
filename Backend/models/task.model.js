const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    description: {
      type: String,
      required: false,
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      required: true,
      enum: ["todo", "in_progress", "completed", "archived"],
      default: "todo",
    },
    priority: {
      type: String,
      required: true,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    importance: {
      type: String,
      required: true,
      enum: ["critical", "important", "normal", "optional"],
      default: "normal",
    },
    dueDate: {
      type: Date,
      required: false,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    teamMembers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        permissions: {
          type: String,
          enum: ["view", "edit", "admin"],
          default: "view",
        },
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    subtasks: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
        },
        completed: {
          type: Boolean,
          default: false,
        },
      },
    ],
    attachments: [
      {
        name: String,
        url: String,
        type: String,
      },
    ],
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        content: {
          type: String,
          required: true,
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    estimatedTime: {
      type: Number, // in minutes
      required: false,
    },
    actualTime: {
      type: Number, // in minutes
      required: false,
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurrencePattern: {
      type: String,
      enum: ["daily", "weekly", "monthly", "none"],
      default: "none",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
taskSchema.index({ status: 1, dueDate: 1 });
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ createdBy: 1, status: 1 });
taskSchema.index({ importance: 1 });
taskSchema.index({ "teamMembers.user": 1 });

// Pre-save hook to update importance based on deadline proximity
taskSchema.pre('save', function(next) {
  // Skip if importance is explicitly set
  if (this.isModified('importance')) {
    return next();
  }

  const now = new Date();
  const dueDate = this.dueDate ? new Date(this.dueDate) : null;
  
  if (!dueDate) {
    this.importance = 'normal';
    return next();
  }

  const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
  
  // Base importance from priority
  let importanceLevel = this.priority === 'urgent' ? 3 :
                       this.priority === 'high' ? 2 : 1;
  
  // Adjust importance based on deadline proximity
  if (daysUntilDue <= 1) { // Due within 24 hours
    importanceLevel += 2;
  } else if (daysUntilDue <= 3) { // Due within 3 days
    importanceLevel += 1;
  }
  
  // Map final importance level
  if (importanceLevel >= 4) this.importance = 'critical';
  else if (importanceLevel === 3) this.importance = 'important';
  else if (importanceLevel === 2) this.importance = 'normal';
  else this.importance = 'optional';

  next();
});

// Pre-save hook to update importance based on deadline proximity
taskSchema.pre('save', function(next) {
  // Skip if importance is explicitly set
  if (this.isModified('importance')) {
    return next();
  }

  const now = new Date();
  const dueDate = this.dueDate ? new Date(this.dueDate) : null;
  
  if (!dueDate) {
    this.importance = 'normal';
    return next();
  }

  const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
  
  // Base importance from priority
  let importanceLevel = this.priority === 'urgent' ? 3 :
                       this.priority === 'high' ? 2 : 1;
  
  // Adjust importance based on deadline proximity
  if (daysUntilDue <= 1) { // Due within 24 hours
    importanceLevel += 2;
  } else if (daysUntilDue <= 3) { // Due within 3 days
    importanceLevel += 1;
  }
  
  // Map final importance level
  if (importanceLevel >= 4) this.importance = 'critical';
  else if (importanceLevel === 3) this.importance = 'important';
  else if (importanceLevel === 2) this.importance = 'normal';
  else this.importance = 'optional';

  next();
});

const Task = mongoose.model("Task", taskSchema);
module.exports = Task;
