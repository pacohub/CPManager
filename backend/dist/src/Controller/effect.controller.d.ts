import { Effect } from '../Entities/effect.entity';
import { EffectService } from '../Services/effect.service';
import { CreateEffectDto } from '../Dto/create-effect.dto';
import { UpdateEffectDto } from '../Dto/update-effect.dto';
export declare class EffectController {
    private readonly effectService;
    constructor(effectService: EffectService);
    findAll(): Promise<Effect[]>;
    findOne(id: string): Promise<Effect | null>;
    create(data: CreateEffectDto): Promise<Effect>;
    update(id: string, data: UpdateEffectDto): Promise<Effect | null>;
    remove(id: string): Promise<void>;
}
