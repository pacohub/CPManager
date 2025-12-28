import { Objective } from '../Entities/objective.entity';
import { ObjectiveService } from '../Services/objective.service';
export declare class ObjectiveController {
    private readonly objectiveService;
    constructor(objectiveService: ObjectiveService);
    findAll(eventId?: string, mechanicId?: string, chapterId?: string): Promise<Objective[]>;
    findOne(id: string): Promise<Objective | null>;
    create(data: any): Promise<Objective>;
    update(id: string, data: any): Promise<Objective>;
    remove(id: string): Promise<void>;
}
