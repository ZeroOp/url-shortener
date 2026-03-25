import mongoose from "mongoose";
import { Password } from "../utils/password";

interface UserAttrs {
    email: string; 
    password: string;
}

interface UserDoc extends mongoose.Document {
    id: string;
    email: string;
    password: string;
}

interface UserModel extends mongoose.Model<UserDoc> {
    build(attrs: UserAttrs): UserDoc;
}

const userSchema = new mongoose.Schema({
    email: {
        type: String,  
        required: true
    },
    password: {
        type: String, 
        required: true
    }
}, {
    toJSON : {
        transform(doc, ret: any) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.password;
            delete ret.__v;
        }
    }
});
// Before saving userSchema check weather password have been changed or not. If changed then hash the password before saving it to the DB
userSchema.pre('save', async function() {
    if (this.isModified('password')) {
        const hashed = await Password.toHash(this.get('password'));
        this.set('password', hashed);
    }
});



// Define custom buildMethode. 
userSchema.statics.build = (attrs: UserAttrs) => {
    return new User(attrs);
}

const User : UserModel = mongoose.model<UserDoc, UserModel>('User', userSchema);  // Define  userModel.


export { User }; 