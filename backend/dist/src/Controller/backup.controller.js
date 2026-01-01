"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupController = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const archiver_1 = __importDefault(require("archiver"));
const googleapis_1 = require("googleapis");
let BackupController = class BackupController {
    async createBackup() {
        const root = process.cwd();
        const uploadsDir = path.join(root, 'uploads');
        const dbPath = path.join(root, 'database.sqlite');
        const backupsDir = path.join(root, 'backups');
        if (!fs.existsSync(backupsDir))
            fs.mkdirSync(backupsDir, { recursive: true });
        const ts = Date.now();
        const zipName = `backup-${ts}.zip`;
        const zipPath = path.join(backupsDir, zipName);
        await new Promise((resolve, reject) => {
            const output = fs.createWriteStream(zipPath);
            const archive = (0, archiver_1.default)('zip', { zlib: { level: 9 } });
            output.on('close', () => resolve());
            archive.on('error', (err) => reject(err));
            archive.pipe(output);
            if (fs.existsSync(dbPath))
                archive.file(dbPath, { name: 'database.sqlite' });
            if (fs.existsSync(uploadsDir))
                archive.directory(uploadsDir, 'uploads');
            archive.finalize();
        });
        const saKeyRaw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || process.env.GOOGLE_SERVICE_ACCOUNT_BASE64 || null;
        const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || null;
        let uploaded = false;
        let driveFileId = null;
        let driveWebViewLink = null;
        if (saKeyRaw && folderId) {
            try {
                let saKey = saKeyRaw;
                if (!saKey.trim().startsWith('{')) {
                    try {
                        saKey = Buffer.from(saKeyRaw, 'base64').toString('utf8');
                    }
                    catch { }
                }
                const key = JSON.parse(saKey);
                const jwtClient = new googleapis_1.google.auth.JWT({
                    email: key.client_email,
                    key: key.private_key,
                    scopes: ['https://www.googleapis.com/auth/drive.file'],
                });
                await jwtClient.authorize();
                const drive = googleapis_1.google.drive({ version: 'v3', auth: jwtClient });
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
                    await drive.permissions.create({ fileId: driveFileId, requestBody: { role: 'reader', type: 'anyone' } }).catch(() => { });
                    const meta = await drive.files.get({ fileId: driveFileId, fields: 'webViewLink,webContentLink' });
                    driveWebViewLink = meta.data.webViewLink || meta.data.webContentLink || null;
                    uploaded = true;
                }
            }
            catch (e) {
                console.error('Drive upload failed', e);
            }
        }
        const publicUrl = `${process.env.BASE_URL ?? `http://localhost:${process.env.PORT ?? 4000}`}/backups/${zipName}`;
        return { ok: true, path: zipPath, backupUrl: publicUrl, uploaded, driveFileId, driveWebViewLink };
    }
    async lastBackup() {
        const root = process.cwd();
        const backupsDir = path.join(root, 'backups');
        if (!fs.existsSync(backupsDir))
            return { ok: true, file: null };
        const files = fs.readdirSync(backupsDir)
            .filter((f) => f.endsWith('.zip'))
            .map((f) => ({ name: f, path: path.join(backupsDir, f), stat: fs.statSync(path.join(backupsDir, f)) }))
            .sort((a, b) => b.stat.mtimeMs - a.stat.mtimeMs);
        if (files.length === 0)
            return { ok: true, file: null };
        const latest = files[0];
        const ts = latest.stat.mtimeMs;
        const publicUrl = `${process.env.BASE_URL ?? `http://localhost:${process.env.PORT ?? 4000}`}/backups/${latest.name}`;
        return { ok: true, file: { name: latest.name, path: latest.path, mtime: ts, url: publicUrl } };
    }
};
exports.BackupController = BackupController;
__decorate([
    (0, common_1.Post)('create'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "createBackup", null);
__decorate([
    (0, common_1.Get)('last'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "lastBackup", null);
exports.BackupController = BackupController = __decorate([
    (0, common_1.Controller)('backup')
], BackupController);
//# sourceMappingURL=backup.controller.js.map