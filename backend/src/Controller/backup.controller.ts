import { Controller, Post, Get } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import archiver from 'archiver';
import { google } from 'googleapis';

@Controller('backup')
export class BackupController {
  @Post('create')
  async createBackup() {
    const root = process.cwd();
    const uploadsDir = path.join(root, 'uploads');
    const dbPath = path.join(root, 'database.sqlite');
    const backupsDir = path.join(root, 'backups');
    if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir, { recursive: true });

    const ts = Date.now();
    const zipName = `backup-${ts}.zip`;
    const zipPath = path.join(backupsDir, zipName);

    await new Promise<void>((resolve, reject) => {
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });
      output.on('close', () => resolve());
      archive.on('error', (err: any) => reject(err));
      archive.pipe(output);
      // include database if exists
      if (fs.existsSync(dbPath)) archive.file(dbPath, { name: 'database.sqlite' });
      // include uploads folder
      if (fs.existsSync(uploadsDir)) archive.directory(uploadsDir, 'uploads');
      archive.finalize();
    });

    // Optionally upload to Google Drive if credentials present
    const saKeyRaw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || process.env.GOOGLE_SERVICE_ACCOUNT_BASE64 || null;
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || null;
    let uploaded = false;
    let driveFileId: string | null = null;
    let driveWebViewLink: string | null = null;

    if (saKeyRaw && folderId) {
      try {
        let saKey = saKeyRaw;
        // if base64, try decode
        if (!saKey.trim().startsWith('{')) {
          try { saKey = Buffer.from(saKeyRaw, 'base64').toString('utf8'); } catch {}
        }
        const key = JSON.parse(saKey);
        const jwtClient = new google.auth.JWT({
          email: key.client_email,
          key: key.private_key,
          scopes: ['https://www.googleapis.com/auth/drive.file'],
        });
        await jwtClient.authorize();
        const drive = google.drive({ version: 'v3', auth: jwtClient });
        const res = await drive.files.create({
          requestBody: {
            name: zipName,
            parents: [folderId],
          },
          media: {
            mimeType: 'application/zip',
            body: fs.createReadStream(zipPath),
          },
        });
        driveFileId = res.data.id ?? null;
        if (driveFileId) {
          // try to get webViewLink
          await drive.permissions.create({ fileId: driveFileId, requestBody: { role: 'reader', type: 'anyone' } }).catch(() => {});
          const meta = await drive.files.get({ fileId: driveFileId, fields: 'webViewLink,webContentLink' });
          driveWebViewLink = (meta.data.webViewLink as string) || (meta.data.webContentLink as string) || null;
          uploaded = true;
        }
      } catch (e) {
        // ignore upload errors but return info
        console.error('Drive upload failed', e);
      }
    }

    // build a public URL for the created zip (served from /backups)
    const publicUrl = `${process.env.BASE_URL ?? `http://localhost:${process.env.PORT ?? 4000}`}/backups/${zipName}`;
    return { ok: true, path: zipPath, backupUrl: publicUrl, uploaded, driveFileId, driveWebViewLink };
  }

  @Get('last')
  async lastBackup() {
    const root = process.cwd();
    const backupsDir = path.join(root, 'backups');
    if (!fs.existsSync(backupsDir)) return { ok: true, file: null };
    const files = fs.readdirSync(backupsDir)
      .filter((f) => f.endsWith('.zip'))
      .map((f) => ({ name: f, path: path.join(backupsDir, f), stat: fs.statSync(path.join(backupsDir, f)) }))
      .sort((a, b) => b.stat.mtimeMs - a.stat.mtimeMs);
    if (files.length === 0) return { ok: true, file: null };
    const latest = files[0];
    const ts = latest.stat.mtimeMs;
    const publicUrl = `${process.env.BASE_URL ?? `http://localhost:${process.env.PORT ?? 4000}`}/backups/${latest.name}`;
    return { ok: true, file: { name: latest.name, path: latest.path, mtime: ts, url: publicUrl } };
  }
}
