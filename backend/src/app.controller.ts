import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import * as fs from 'fs';
import * as path from 'path';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('debug/uploads')
  debugUploads(@Query('file') file?: string) {
    const uploadsDir = path.join(__dirname, '..', 'uploads', 'images');
    const result: any = { uploadsDir };
    try {
      const list = fs.readdirSync(uploadsDir);
      result.files = list.slice(0, 300);
      if (file) {
        const safe = String(file).replace(/^[\/]+/, '');
        result.exists = fs.existsSync(path.join(uploadsDir, safe));
        result.requested = safe;
      }
    } catch (e: any) {
      result.error = e?.message || String(e);
    }
    return result;
  }
}
