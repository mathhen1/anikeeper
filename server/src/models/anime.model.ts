import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const animeSchema = new Schema(
  {
    kitsuId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    titles: {
      en: { type: String, default: null },
      en_jp: { type: String, default: null },
      ja_jp: { type: String, default: null },
    },
    canonicalTitle: {
      type: String,
      default: null,
    },
    subtype: {
      type: String,
      default: null,
    },
    episodeCount: {
      type: Number,
      default: null,
      min: 0,
    },
    episodeLength: {
      type: Number,
      default: null,
      min: 0,
    },
    averageRating: {
      type: String,
      default: null,
    },
    startDate: {
      type: String,
      default: null,
    },
    posterImage: {
      original: { type: String, default: null },
      large: { type: String, default: null },
      small: { type: String, default: null },
    },
    synopsis: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export type Anime = InferSchemaType<typeof animeSchema>;

export const AnimeModel =
  mongoose.models.Anime ?? mongoose.model('Anime', animeSchema);
