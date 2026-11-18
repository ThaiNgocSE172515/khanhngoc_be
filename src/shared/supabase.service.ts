import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import envInstance from './env.config.js';
import { extname } from 'path';
import 'multer';

@Injectable()
export class SupabaseService {
  supabaseClient: SupabaseClient;

  constructor() {
    const SUPABASE_URL = envInstance.SUPABASE_URL;
    const SUPABASE_KEY = envInstance.SUPABASE_KEY;

    this.supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
  }

  getClient() {
    return this.supabaseClient;
  }

  // Hàm chuẩn hóa tên file dùng chung
  private buildSafeFilePath(originalName: string, folder?: string): string {
    const ext = extname(originalName).toLowerCase();
    const safeName = originalName
      .replace(ext, '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .replace(/[^a-zA-Z0-9-_]/g, '_');

    const fileName = `${Date.now()}_${Math.round(Math.random() * 1e4)}_${safeName}${ext}`;
    return folder ? `${folder}/${fileName}` : fileName;
  }

  // Tách filePath từ URL Supabase để xóa
  private extractFilePath(filePathOrUrl: string, bucket: string): string {
    if (!filePathOrUrl.startsWith('http')) return filePathOrUrl;

    const urlWithoutQuery = filePathOrUrl.split('?')[0];
    const marker = `/${bucket}/`;
    const index = urlWithoutQuery.indexOf(marker);

    if (index !== -1) {
      return decodeURIComponent(urlWithoutQuery.slice(index + marker.length));
    }
    const parts = urlWithoutQuery.split('/');
    return decodeURIComponent(parts[parts.length - 1]);
  }

  // ================= DÙNG CHO DỰ ÁN (HÌNH ẢNH) =================
  async uploadProjectImage(
    file: Express.Multer.File,
    folder = 'images',
    bucket = 'PROJECTS',
  ): Promise<string> {
    const filePath = this.buildSafeFilePath(file.originalname, folder);

    const { error } = await this.supabaseClient.storage
      .from(bucket)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new InternalServerErrorException(
        `Upload hình ảnh thất bại: ${error.message}`,
      );
    }

    const { data } = this.supabaseClient.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async deleteProjectFiles(
    urls: (string | null | undefined)[],
    bucket = 'PROJECTS',
  ): Promise<void> {
    const paths = urls
      .filter((u): u is string => Boolean(u))
      .map((u) => this.extractFilePath(u, bucket));

    if (paths.length === 0) return;

    const { error } = await this.supabaseClient.storage
      .from(bucket)
      .remove(paths);

    if (error) {
      console.error(`Lỗi xóa ảnh trên bucket ${bucket}:`, error.message);
    }
  }

  // ================= DÙNG CHO TUYỂN DỤNG (CV) =================
  async uploadCv(file: Express.Multer.File, bucket = 'CVS'): Promise<string> {
    const filePath = this.buildSafeFilePath(file.originalname);

    const { error } = await this.supabaseClient.storage
      .from(bucket)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new InternalServerErrorException(
        `Upload CV thất bại: ${error.message}`,
      );
    }

    const { data } = this.supabaseClient.storage
      .from(bucket)
      .getPublicUrl(filePath);
    return data.publicUrl;
  }

  async getSignedCvUrl(
    filePathOrUrl?: string | null,
    expiresInSeconds = 300,
    bucket = 'CVS',
  ): Promise<string | null> {
    if (!filePathOrUrl) return null;

    const cleanPath = this.extractFilePath(filePathOrUrl, bucket);

    const { data, error } = await this.supabaseClient.storage
      .from(bucket)
      .createSignedUrl(cleanPath, expiresInSeconds);

    if (error) {
      console.error(`Lỗi tạo signed URL cho file ${cleanPath}:`, error.message);
      return null;
    }

    return data.signedUrl;
  }

  async deleteCv(filePathOrUrl?: string | null, bucket = 'CVS'): Promise<void> {
    if (!filePathOrUrl) return;
    await this.deleteProjectFiles([filePathOrUrl], bucket);
  }
}