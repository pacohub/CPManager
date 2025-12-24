"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SagaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const saga_entity_1 = require("../Entities/saga.entity");
let SagaService = class SagaService {
    sagaRepository;
    constructor(sagaRepository) {
        this.sagaRepository = sagaRepository;
    }
    findAll() {
        return this.sagaRepository.find({ order: { order: 'ASC' } });
    }
    findOne(id) {
        return this.sagaRepository.findOneBy({ id });
    }
    async create(data) {
        const maxOrderResult = await this.sagaRepository
            .createQueryBuilder('saga')
            .select('MAX(saga.order)', 'max')
            .getRawOne();
        const maxOrder = maxOrderResult?.max ?? 0;
        const saga = this.sagaRepository.create({
            ...data,
            order: data.order ?? (Number(maxOrder) + 1),
        });
        console.log('[DEBUG] Saga order before save:', saga.order);
        return await this.sagaRepository.save(saga);
    }
    async update(id, data) {
        const { ids, ...safeData } = data;
        if (!id || isNaN(id)) {
            console.error('[BACKEND] [UPDATE SAGA] id inválido:', id);
            throw new Error('ID inválido para actualizar saga');
        }
        if (!safeData || Object.keys(safeData).length === 0) {
            console.error('[BACKEND] [UPDATE SAGA] body vacío:', safeData);
            throw new Error('Datos vacíos para actualizar saga');
        }
        console.log('[BACKEND] [UPDATE SAGA] id:', id, 'body recibido:', data, 'body enviado:', safeData);
        await this.sagaRepository.update(id, safeData);
        return this.findOne(id);
    }
    async remove(id) {
        await this.sagaRepository.delete(id);
    }
    async saveOrder(ids) {
        try {
            if (!Array.isArray(ids) || ids.length === 0) {
                throw new Error('No saga IDs provided for ordering');
            }
            console.log('[BACKEND] [saveOrder] Recibido ids:', ids);
            for (let i = 0; i < ids.length; i++) {
                const result = await this.sagaRepository.update(ids[i], { order: i });
                console.log(`[BACKEND] [saveOrder] Actualizando saga id=${ids[i]} a order=${i}. Resultado:`, result);
            }
            return { success: true };
        }
        catch (error) {
            console.error('[BACKEND] [saveOrder] Error:', error);
            throw error;
        }
    }
};
exports.SagaService = SagaService;
exports.SagaService = SagaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(saga_entity_1.Saga)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SagaService);
//# sourceMappingURL=saga.service.js.map