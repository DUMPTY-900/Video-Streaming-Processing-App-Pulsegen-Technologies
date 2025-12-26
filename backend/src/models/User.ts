import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    username: string;
    email: string;
    passwordHash: string;
    roles: string[]; // 'viewer', 'editor', 'admin'
    tenantId: string;
    createdAt: Date;
}

const UserSchema: Schema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    roles: {
        type: [String],
        enum: ['viewer', 'editor', 'admin'],
        default: ['viewer']
    },
    tenantId: { type: String, required: true }, // For multi-tenancy
}, {
    timestamps: true
});

export default mongoose.model<IUser>('User', UserSchema);
