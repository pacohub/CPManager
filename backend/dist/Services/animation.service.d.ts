import { Repository } from 'typeorm';
import { Animation } from '../Entities/animation.entity';
export declare class AnimationService {
    private animationRepository;
    constructor(animationRepository: Repository<Animation>);
    findAll(): Promise<Animation[]>;
    findOne(id: number): Promise<Animation | null>;
    private normalize;
    create(data: Partial<Animation>): Promise<Animation>;
    update(id: number, data: Partial<Animation>): Promise<Animation | null>;
    remove(id: number): Promise<void>;
}
