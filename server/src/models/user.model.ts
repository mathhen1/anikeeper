import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      maxlength: 64,
      select: false,
    },
    profilePhoto: {
      type: Buffer,
      default: null,
    },
    profilePhotoContentType: {
      type: String,
      default: null,
    },
    animeLists: [
      {
        type: Schema.Types.ObjectId,
        ref: 'AnimeList',
      },
    ],
  },
  {
    timestamps: true,
  },
);

export type User = InferSchemaType<typeof userSchema>;

export const UserModel =
  mongoose.models.User ?? mongoose.model('User', userSchema);
