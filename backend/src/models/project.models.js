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
        default: 'Untitled Project'
    },
    content: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        trim: true,
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
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastModified: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });



projectSchema.pre('save', function (next) {
    this.lastModified = Date.now();
    next();
});

export const Project = mongoose.model('Project', projectSchema);
