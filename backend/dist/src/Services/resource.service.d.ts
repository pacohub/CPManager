import { Repository } from 'typeorm';
import { Resource } from '../Entities/resource.entity';
import { ResourceType } from '../Entities/resourceType.entity';
export declare class ResourceService {
    private resourceRepository;
    private resourceTypeRepository;
    constructor(resourceRepository: Repository<Resource>, resourceTypeRepository: Repository<ResourceType>);
    findAll(): Promise<Resource[]>;
    findOne(id: number): Promise<Resource | null>;
    private normalizeText;
    create(data: any): Promise<Resource>;
    update(id: number, data: any): Promise<Resource | null>;
    remove(id: number): Promise<void>;
}
