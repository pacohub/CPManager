import { Repository } from 'typeorm';
import { Event } from '../Entities/event.entity';
import { Mechanic } from '../Entities/mechanic.entity';
import { Objective } from '../Entities/objective.entity';
type ObjectiveFilters = {
    eventId?: number;
    mechanicId?: number;
    chapterId?: number;
};
export declare class ObjectiveService {
    private objectiveRepository;
    private eventRepository;
    private mechanicRepository;
    constructor(objectiveRepository: Repository<Objective>, eventRepository: Repository<Event>, mechanicRepository: Repository<Mechanic>);
    private normalizeText;
    private assertDifficulty;
    private toInt;
    findAll(filters?: ObjectiveFilters): Promise<Objective[]>;
    findOne(id: number): Promise<Objective | null>;
    create(data: any): Promise<Objective>;
    update(id: number, data: any): Promise<Objective>;
    remove(id: number): Promise<void>;
}
export {};
