import { Model, Schema, model } from "mongoose";
import { IUser, IUserAttributes } from "../interfaces";

// Extending the base IUser interface for the model
export interface IUserDocument extends IUser {
  _id: string;
  password?: string;
  provider?: string;
}

export interface UserModel extends Model<IUserDocument> {
  // Add any static methods here if needed
}

const userSchema = new Schema<IUserDocument, UserModel>({
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  phone: {
    type: String,
    required: true,
    index: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  surname: {
    type: String,
    required: true,
  },
  companies: {
    type: [String],
    required: true,
    default: [],
    index: true,
  },
  image: {
    type: String,
    required: false,
  },
  attributes: {
    type: Schema.Types.Mixed,
    required: true,
    default: {},
  },
  password: {
    type: String,
    required: false,
    select: false,
  },
  provider: {
    type: String,
    required: false,
    index: true,
  }
}, { 
  minimize: false,
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: (_, ret) => {
      delete ret.password;
      return ret;
    }
  }
});

userSchema.index({ email: 1, provider: 1 });

const User = model<IUserDocument, UserModel>("Users", userSchema);

export { User };
