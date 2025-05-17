const mongoose = require('mongoose');

const studySessionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 100
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    participants: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        joinedAt: {
            type: Date,
            default: Date.now
        }
    }],
    status: {
        type: String,
        enum: ['scheduled', 'active', 'completed', 'cancelled'],
        default: 'scheduled'
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    maxParticipants: {
        type: Number,
        default: 10,
        min: 1,
        max: 50
    },
    isPrivate: {
        type: Boolean,
        default: false
    },
    password: {
        type: String,
        required: function () {
            return this.isPrivate;
        }
    },
    chat: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        message: {
            type: String,
            required: true,
            trim: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    resources: [{
        name: String,
        url: String,
        type: String,
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for better query performance
studySessionSchema.index({ status: 1, startTime: 1 });
studySessionSchema.index({ host: 1, status: 1 });
studySessionSchema.index({ 'participants.user': 1 });

const StudySession = mongoose.model('StudySession', studySessionSchema);

module.exports = StudySession; 