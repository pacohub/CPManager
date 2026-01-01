export declare class BackupController {
    createBackup(): Promise<{
        ok: boolean;
        path: string;
        backupUrl: string;
        uploaded: boolean;
        driveFileId: string | null;
        driveWebViewLink: string | null;
    }>;
    lastBackup(): Promise<{
        ok: boolean;
        file: null;
    } | {
        ok: boolean;
        file: {
            name: string;
            path: string;
            mtime: number;
            url: string;
        };
    }>;
}
