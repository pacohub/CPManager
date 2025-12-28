import { Repository } from 'typeorm';
import { ResourceType } from '../Entities/resourceType.entity';
export declare class ResourceTypeService {
    private resourceTypeRepository;
    constructor(resourceTypeRepository: Repository<ResourceType>);
    findAll(): Promise<ResourceType[]>;
    findOne(id: number): Promise<ResourceType | null>;
    private normalize;
    create(data: Partial<ResourceType>): Promise<ResourceType>;
    update(id: number, data: Partial<ResourceType>): Promise<ResourceType | null>;
    remove(id: number): Promise<void>;
}
