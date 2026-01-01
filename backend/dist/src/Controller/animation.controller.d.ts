import { Animation } from '../Entities/animation.entity';
import { AnimationService } from '../Services/animation.service';
export declare class AnimationController {
    private readonly animationService;
    constructor(animationService: AnimationService);
    findAll(): Promise<Animation[]>;
    findOne(id: string): Promise<Animation | null>;
    create(data: any): Promise<Animation>;
    update(id: string, data: any): Promise<Animation | null>;
    remove(id: string): Promise<void>;
}
