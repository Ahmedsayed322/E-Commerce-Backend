import { BadRequestException } from '@nestjs/common';
import { mkdir } from 'fs/promises';
import multer from 'multer';

export const multerCloud = ({ isDiskStorage = false, dest = 'uploads' }) => {
  const storage = isDiskStorage
    ? multer.diskStorage({
        destination: async (
          req: Express.Request,
          file: Express.Multer.File,
          cb: Function,
        ) => {
          await mkdir(dest, { recursive: true });
          cb(null, dest);
        },
        filename: (req, file, cb) => {
          cb(null, Date.now() + '-' + file.originalname);
        },
      })
    : multer.memoryStorage();
  const fileFilter = (
    req: Express.Request,
    file: Express.Multer.File,
    cb: Function,
  ) => {
    if (
      file.mimetype.startsWith('image/') ||
      file.mimetype.startsWith('video/')
    ) {
      cb(null, true);
    } else {
      cb(new BadRequestException('Only image and video files are allowed!'));
    }
  };
  return { storage, fileFilter };
};
