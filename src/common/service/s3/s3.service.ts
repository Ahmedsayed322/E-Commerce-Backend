import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

import { randomUUID } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { Upload } from '@aws-sdk/lib-storage';
import { Types } from 'mongoose';
import { extname } from 'node:path';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
@Injectable()
export class S3Service {
  private s3: S3Client;
  constructor() {
    this.s3 = new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }
  async uploadFile({
    key = 'General',
    isDiskStorage = false,
    subFolder,
    ACL = ObjectCannedACL.private,
    file,
    expires,
    baseFolder = 'users',
  }: {
    file: Express.Multer.File;
    key?: string;
    isDiskStorage?: boolean;
    ACL?: ObjectCannedACL;
    subFolder?: Types.ObjectId | string;
    expires?: boolean;
    baseFolder?: string;
  }): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      ACL,
      Key: `${baseFolder}/${subFolder}/${key}${extname(file.originalname)}`,
      Tagging: `storyTtl=${expires ? true : false}`,
      ContentType: file.mimetype,
      Body: isDiskStorage ? createReadStream(file.path) : file.buffer,
    });
    if (!command.input.Key) {
      throw new InternalServerErrorException('failed to upload file');
    }
    await this.s3.send(command);
    return command.input.Key;
  }
  async uploadLargeFile({
    key = 'General',
    subFolder,
    ACL = ObjectCannedACL.private,
    file,
    expires = false,
  }: {
    file: Express.Multer.File;
    key?: string;
    ACL?: ObjectCannedACL;
    subFolder: Types.ObjectId | string;
    expires?: boolean;
  }): Promise<string> {
    const command = new Upload({
      client: this.s3,
      params: {
        Bucket: process.env.AWS_BUCKET_NAME,
        ACL,
        Key: `users/${subFolder}/${key}/${randomUUID()}-${file.originalname}`,
        Tagging: `storyTtl=${expires ? true : false}`,
        ContentType: file.mimetype,
        Body: createReadStream(file.path),
      },
    });

    const op = await command.done();
    return op.Key as string;
  }
  async uploadFiles({
    key,
    subFolder,
    baseFolder,
    ACL = ObjectCannedACL.private,
    files,
    isLargeFiles = false,
    expires = false,
  }: {
    files: Express.Multer.File[];
    key?: string;
    isLargeFiles?: boolean;
    ACL?: ObjectCannedACL;
    subFolder: Types.ObjectId | string;
    baseFolder: string;
    expires?: boolean;
  }) {
  

    let urls: string[] = [];
    if (isLargeFiles) {
      urls = await Promise.all(
        files.map((file) =>
          this.uploadLargeFile({
            file,
            key: randomUUID(),
            subFolder,
            ACL,
            expires,
          }),
        ),
      );
    } else {
      urls = await Promise.all(
        files.map((file) =>
          this.uploadFile({
            file,
            key:randomUUID(),
            expires,
            subFolder,
            baseFolder,
            ACL,
            isDiskStorage: false,
          }),
        ),
      );
    }
    return urls;
  }
  async createPresignedUrl({
    key,
    ACL = ObjectCannedACL.private,
    ContentType,
    OriginalName,
    expiresIn = 2 * 60 * 60,
    rootName = 'general',
    subFolder,
  }: {
    key: string;
    ACL?: ObjectCannedACL;
    ContentType: string;
    expiresIn?: number;
    OriginalName: string;
    subFolder?: Types.ObjectId | string;
    rootName?: string;
  }): Promise<{ url: string; key: string }> {
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      ACL,
      Key: `${rootName}/${subFolder ? `${subFolder}/` : ''}${key}-${OriginalName}`,
      ContentType,
    });
    const url = await getSignedUrl(this.s3, command, { expiresIn });

    return { url, key: command.input.Key as string };
  }
  async getFile(key: string) {
    try {
      const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
      });
      const file = await this.s3.send(command);
      return file;
    } catch (e) {
      throw new InternalServerErrorException('no such path');
    }
  }
  async getPresignedLink(
    key: string,
    download?: boolean,
    expiresIn = 2 * 60 * 60,
  ) {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      ResponseContentDisposition: download
        ? `attachment; filename="${key.split('/').at(-1)}"`
        : undefined,
    });
    const url = await getSignedUrl(this.s3, command, { expiresIn });
    return url;
  }
  async deleteFile(key: string) {
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    });
    return await this.s3.send(command);
  }
  async getFiles(prefix: string) {
    const files = new ListObjectsV2Command({
      Bucket: process.env.AWS_BUCKET_NAME,
      Prefix: prefix,
    });
    return await this.s3.send(files);
  }
  async deleteFiles(keys: string[]) {
    const command = new DeleteObjectsCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Delete: {
        Objects: keys.map((key) => ({ Key: key })),
        Quiet: true,
      },
    });
    return await this.s3.send(command);
  }
  async deleteFolder(key: string) {
    const filesNames: { Key: string }[] =
      (await this.getFiles(key)).Contents?.map((f) => ({
        Key: f.Key as string,
      })) || [];
    const command = new DeleteObjectsCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Delete: {
        Objects: filesNames,
        Quiet: true,
      },
    });
    return await this.s3.send(command);
  }
}
