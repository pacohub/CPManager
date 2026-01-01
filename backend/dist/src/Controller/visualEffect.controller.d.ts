import { VisualEffect } from '../Entities/visualEffect.entity';
import { VisualEffectService } from '../Services/visualEffect.service';
import { CreateVisualEffectDto } from '../Dto/create-visualEffect.dto';
import { UpdateVisualEffectDto } from '../Dto/update-visualEffect.dto';
export declare class VisualEffectController {
    private readonly visualEffectService;
    constructor(visualEffectService: VisualEffectService);
    findAll(): Promise<VisualEffect[]>;
    findOne(id: string): Promise<VisualEffect | null>;
    create(data: CreateVisualEffectDto): Promise<VisualEffect>;
    update(id: string, data: UpdateVisualEffectDto): Promise<VisualEffect | null>;
    remove(id: string): Promise<void>;
}
