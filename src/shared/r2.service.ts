import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as path from 'path';

@Injectable()
export class R2Service {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor() {
    const accountId = process.env.R2_ACCOUNT_ID!;
    this.bucket = process.env.R2_BUCKET_NAME!;
    this.publicUrl = (process.env.R2_PUBLIC_URL || '').replace(/\/+$/, '');

    this.s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }

  private buildPublicUrl(key: string): string {
    return `${this.publicUrl}/${key}`;
  }

  private sanitizeFileName(originalName: string): string {
    const ext = path.extname(originalName).toLowerCase();
    const base = path
      .basename(originalName, ext)
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .slice(0, 50);
    return `${Date.now()}-${randomUUID().slice(0, 8)}-${base}${ext}`;
  }

  /**
   * Upload file lớn (50MB+) bằng multipart upload để tránh timeout/lỗi chunk
   */
  async uploadLargeFile(
    file: Express.Multer.File,
    folder = 'apps',
  ): Promise<{ url: string; key: string; size: number; fileName: string }> {
    const safeName = this.sanitizeFileName(file.originalname);
    const key = `${folder}/${safeName}`;

    try {
      const parallelUpload = new Upload({
        client: this.s3,
        params: {
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype || 'application/octet-stream',
        },
        queueSize: 4,
        partSize: 10 * 1024 * 1024, // 10MB mỗi part cho file >= 50MB
        leavePartsOnError: false,
      });

      await parallelUpload.done();

      return {
        url: this.buildPublicUrl(key),
        key,
        size: file.size,
        fileName: file.originalname,
      };
    } catch (err) {
      console.error('R2 uploadLargeFile error:', err);
      throw new InternalServerErrorException(
        'Tải file ứng dụng lên Cloudflare R2 thất bại',
      );
    }
  }

  /**
   * Upload ảnh icon ứng dụng (tùy chọn)
   */
  async uploadImage(
    file: Express.Multer.File,
    folder = 'app-icons',
  ): Promise<{ url: string; key: string }> {
    const safeName = this.sanitizeFileName(file.originalname);
    const key = `${folder}/${safeName}`;

    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype || 'image/png',
        }),
      );

      return {
        url: this.buildPublicUrl(key),
        key,
      };
    } catch (err) {
      console.error('R2 uploadImage error:', err);
      throw new InternalServerErrorException('Tải ảnh ứng dụng lên R2 thất bại');
    }
  }

  extractKeyFromUrl(url?: string | null): string | null {
    if (!url) return null;
    if (this.publicUrl && url.startsWith(`${this.publicUrl}/`)) {
      return url.slice(this.publicUrl.length + 1);
    }
    return null;
  }

  async deleteByKey(key?: string | null): Promise<void> {
    if (!key) return;
    try {
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
    } catch (err) {
      console.error('R2 deleteByKey error:', err);
    }
  }
}