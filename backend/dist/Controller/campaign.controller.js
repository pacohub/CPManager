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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const campaign_service_1 = require("../Services/campaign.service");
const multer_1 = require("multer");
const path = __importStar(require("path"));
function fileName(req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    cb(null, `${base}-${Date.now()}${ext}`);
}
let CampaignController = class CampaignController {
    campaignService;
    constructor(campaignService) {
        this.campaignService = campaignService;
    }
    async findAllBySaga(sagaId) {
        return this.campaignService.findAllBySaga(Number(sagaId));
    }
    async findOne(id) {
        return this.campaignService.findOne(Number(id));
    }
    async create(data, files) {
        if (data?.sagaId !== undefined)
            data.sagaId = Number(data.sagaId);
        if (data?.order !== undefined)
            data.order = Number(data.order);
        if (files?.image?.[0])
            data.image = `/uploads/images/${files.image[0].filename}`;
        if (files?.file?.[0])
            data.file = `/uploads/files/${files.file[0].filename}`;
        return this.campaignService.create(data);
    }
    async update(id, data, files) {
        if (data?.sagaId !== undefined)
            data.sagaId = Number(data.sagaId);
        if (data?.order !== undefined)
            data.order = Number(data.order);
        if (files?.image?.[0])
            data.image = `/uploads/images/${files.image[0].filename}`;
        if (files?.file?.[0])
            data.file = `/uploads/files/${files.file[0].filename}`;
        return this.campaignService.update(Number(id), data);
    }
    async remove(id) {
        return this.campaignService.remove(Number(id));
    }
};
exports.CampaignController = CampaignController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('sagaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CampaignController.prototype, "findAllBySaga", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CampaignController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'image', maxCount: 1 },
        { name: 'file', maxCount: 1 },
    ], {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                if (file.fieldname === 'image')
                    cb(null, './uploads/images');
                else
                    cb(null, './uploads/files');
            },
            filename: fileName,
        }),
        limits: { fileSize: 10 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CampaignController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'image', maxCount: 1 },
        { name: 'file', maxCount: 1 },
    ], {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                if (file.fieldname === 'image')
                    cb(null, './uploads/images');
                else
                    cb(null, './uploads/files');
            },
            filename: fileName,
        }),
        limits: { fileSize: 10 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], CampaignController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CampaignController.prototype, "remove", null);
exports.CampaignController = CampaignController = __decorate([
    (0, common_1.Controller)('campaigns'),
    __metadata("design:paramtypes", [campaign_service_1.CampaignService])
], CampaignController);
//# sourceMappingURL=campaign.controller.js.map