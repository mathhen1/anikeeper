import type { Request, RequestHandler } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import { ApiError } from '../lib/api-error.js';

const maximumUploadSizeBytes = 5 * 1024 * 1024;
const maximumImagePixels = 40_000_000;

const photoUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: maximumUploadSizeBytes,
    files: 1,
  },
  fileFilter: (_request, file, callback) => {
    if (!file.mimetype.startsWith('image/')) {
      callback(new ApiError(400, 'Only image files are accepted.'));
      return;
    }

    callback(null, true);
  },
});

async function convertProfilePhotoToWebp(request: Request) {
  if (!request.file) {
    throw new ApiError(400, 'A profile photo file is required.');
  }

  const image = sharp(request.file.buffer, {
    limitInputPixels: maximumImagePixels,
  });
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    throw new ApiError(400, 'The uploaded file is not a valid image.');
  }

  const webpBuffer = await image
    .rotate()
    .resize(512, 512, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 85, effort: 4 })
    .toBuffer();

  request.file.buffer = webpBuffer;
  request.file.mimetype = 'image/webp';
  request.file.size = webpBuffer.length;
}

const processProfilePhoto: RequestHandler = (request, _response, next) => {
  void convertProfilePhotoToWebp(request).then(
    () => next(),
    (error: unknown) => {
      if (error instanceof ApiError) {
        next(error);
        return;
      }

      if (error instanceof Error) {
        next(new ApiError(400, 'The uploaded file is not a valid image.'));
        return;
      }

      next(error);
    },
  );
};

export const profilePhotoMiddleware: RequestHandler[] = [
  photoUpload.single('photo'),
  processProfilePhoto,
];
