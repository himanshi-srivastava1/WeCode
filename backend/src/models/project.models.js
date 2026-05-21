import mongoose, { Schema } from 'mongoose';

const projectSchema = new Schema({
    projectId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: [100, "Project title cannot exceed 100 characters"],
        default: 'Untitled Project'
    },
    fileTree: {
        type: Schema.Types.Mixed,
        default: {}
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, "Project description cannot exceed 1000 characters"],
        default: ''
    },
    template: {
        type: String,
        enum: ['react', 'next.js', 'express', 'vue', 'hono', 'angular'],
        default: 'react'
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    collaborators: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    starredBy: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    onlineUsers: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    lastUpdatedAt: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    openedFiles:{
        type: Array,
        default: []
    }
}, { timestamps: true });



projectSchema.pre('save', function () {
    this.lastModified = Date.now();
});

export const Project = mongoose.model('Project', projectSchema);
