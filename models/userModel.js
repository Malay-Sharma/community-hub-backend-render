import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true 
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        default: ''
    },

    // 👇 Additional onboarding fields
    username: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
    },
    bio: {
        type: String,
        default: '',
        maxlength: 300
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
        default: 'Prefer not to say'
    },
    dob: {
        type: Date
    },
    location: {
        type: String,
        default: ''
    },
    website: {
        type: String,
        default: ''
    },
    interests: {
        type: [String], // list of interest tags
        default: []
    },
    profession: {
        type: String,
        default: ''
    },
    coverImage: {
        type: String,
        default: ''
    },
    socialLinks: {
        instagram: { type: String, default: '' },
        twitter: { type: String, default: '' },
        linkedin: { type: String, default: '' },
        github: { type: String, default: '' }
    }
}, {
    timestamps: true
});

const userModel = mongoose.models.user || mongoose.model('user', userSchema)

export default userModel;
