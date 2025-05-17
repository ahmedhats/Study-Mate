const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    education: {
      type: String,
      enum: ["high_school", "bachelors", "masters", "phd", "other"],
      required: false,
    },
    major: {
      type: String,
      enum: [
        "computer_science",
        "biology",
        "engineering",
        "mathematics",
        "business",
        "literature",
        "physics",
        "chemistry",
        "psychology",
        "medicine",
        "arts",
        "other",
      ],
      required: false,
      trim: true,
    },
    interests: [
      {
        type: String,
        trim: true,
      },
    ],
    hobbies: [
      {
        type: String,
        trim: true,
      },
    ],
    studyPreference: {
      type: String,
      enum: ["individual", "group", "both"],
      default: "individual",
    },

    studyGoals: {
      type: String,
      trim: true,
      default: "",
    },
    
    birthDate: {
      type: Date,
      required: true,
    },
    profileImage: {
      type: String,
      required: false,
      trim: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    teams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Projects",
      },
    ],
    preferences: {
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        taskReminders: { type: Boolean, default: true },
      },
      theme: {
        type: String,
        enum: ["light", "dark", "system"],
        default: "system",
      },
      timezone: {
        type: String,
        default: "UTC",
      },
      language: {
        type: String,
        default: "en",
      },
    },
    productivity: {
      dailyGoal: {
        type: Number,
        default: 8,
        min: 0,
        max: 24,
      },
      weeklyGoal: {
        type: Number,
        default: 40,
        min: 0,
        max: 168,
      },
      focusMode: {
        type: Boolean,
        default: false,
      },
      breakReminders: {
        type: Boolean,
        default: true,
      },
      breakInterval: {
        type: Number,
        default: 25,
        min: 5,
        max: 120,
      },
    },
    statistics: {
      totalHours: {
        type: Number,
        default: 0,
      },
      completedTasks: {
        type: Number,
        default: 0,
      },
      studyStreak: {
        type: Number,
        default: 0,
      },
      weeklyGoal: {
        type: Number,
        default: 20,
      },
      lastActive: {
        type: Date,
        default: Date.now,
      },
    },
    recentActivities: [
      {
        type: {
          type: String,
          enum: ["study", "task", "team", "message"],
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    settings: {
      type: Object,
      required: false,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    isAccountVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: {
      type: String,
      required: false,
    },
    resetPasswordExpires: {
      type: Date,
      required: false,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
userSchema.index({ status: 1 });
userSchema.index({ "statistics.lastActive": -1 });
userSchema.index({ education: 1 });
userSchema.index({ major: 1 });
userSchema.index({ studyPreference: 1 });

const User = mongoose.model("User", userSchema);
module.exports = User;
