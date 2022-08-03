import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
    id: {
        type: String,
        index: true,
        unique: true,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    passwordSalt: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        default: 'user',
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    img: {
        type: String,
        required: true,
        trim: true
    },
}, {
    timestamps: true
})

export const User =  mongoose.model('User', UserSchema);

const CheckListSchema = new mongoose.Schema({
    uuid: {
        type: String,
        index: true,
        unique: true,
        required: true,
        trim: true
    },
    userId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    checks: {
        type: Object
    },
    createdAt: {
        type: Date,
        required: true,
    },
    updatedAt: {
        type: Date,
        required: true,
    }
}, {
    timestamps: true,

})
export const CheckList =  mongoose.model('CheckList', CheckListSchema);