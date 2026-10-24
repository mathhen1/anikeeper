import { model, models, Schema, type InferSchemaType } from 'mongoose';

export const animeListKeys = ['completed', 'watching', 'planned'] as const;

const animeListSchema = new Schema(
  {
    key: {
      type: String,
      enum: animeListKeys,
      required: true,
    },
    animes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Anime',
      },
    ],
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

animeListSchema.index({ user: 1, key: 1 }, { unique: true });

export type AnimeList = InferSchemaType<typeof animeListSchema>;

export const AnimeListModel =
  models.AnimeList ?? model('AnimeList', animeListSchema);
