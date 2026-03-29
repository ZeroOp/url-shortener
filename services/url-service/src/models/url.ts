import mongoose from "mongoose";

// 1. Attributes for creating a new URL
interface UrlAttrs {
    longUrl: string;
    shortUrl: string; // This is your 'shortCode'
    userId?: string;
    expiresAt?: Date;
    isAliased: boolean;
}

enum UrlStatus {
    Active = "Active",
    Expired = "Expired",
    Deleted = "Deleted"
}

// 2. The Document properties (includes Mongoose internal properties)
interface UrlDoc extends mongoose.Document {
    longUrl: string;
    shortUrl: string;
    userId: string;
    expiresAt?: Date;
    status: UrlStatus; 
    isAliased: boolean;
    createdAt: Date;
    clicks: number;
}

// 3. The Model interface with your custom build method
interface UrlModel extends mongoose.Model<UrlDoc> {
    build(attrs: UrlAttrs): UrlDoc;
}

const urlSchema = new mongoose.Schema({
    longUrl: {
        type: String,
        required: true
    },
    shortUrl: {
        type: String,
        required: true,
        unique: true // CRITICAL: This creates the index for O(1) lookups
    },
    userId: {
        type: String
    },
    status: {
        type: String,
        default: UrlStatus.Active
    }
    ,
    isAliased: {
        type: Boolean,
        default: false
    },
    expiresAt: {
        type: Date
    },
    clicks: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt
    toJSON: {
        transform(doc, ret: any) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        }
    }
});

// Optimization: Index shortUrl specifically if not already handled by 'unique'
urlSchema.index({ shortUrl: 1 });

urlSchema.index({ longUrl: 1, userId: 1, status: 1});

urlSchema.statics.build = (attrs: UrlAttrs) => {
    return new Url(attrs);
};

const Url = mongoose.model<UrlDoc, UrlModel>('Url', urlSchema);

export { Url, UrlStatus};