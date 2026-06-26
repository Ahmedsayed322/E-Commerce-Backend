import { Injectable } from '@nestjs/common';
import { pipeline } from 'stream';
import { promisify } from 'util';
import { NextFunction, Request, Response } from 'express';
import { S3Service } from './common/service/s3/s3.service';
@Injectable()
export class AppService {
  private s3WritableStream;
  constructor(private s3: S3Service) {
    this.s3WritableStream = promisify(pipeline);
  }
  async previewUpload(req: Request, res: Response, next: NextFunction) {
    try {
      const { path } = req.params as { path: string[] };
      const key = path.join('/');
      const url = await this.s3.getFile(key);
      res.setHeader(
        'Content-Type',
        url.ContentType || 'application/octet-stream',
      );
      res.set('Cross-Origin-Resource-Policy', 'cross-origin');
      if (req.query.download) {
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="${key.split('/').at(-1)}"`,
        );
      }
      await this.s3WritableStream(url.Body as ReadableStream, res);
    } catch (err: any) {
      if (err.code === 'ERR_STREAM_PREMATURE_CLOSE') return;
      if (!res.headersSent) {
        next(err);
      }
    }
  }
}

