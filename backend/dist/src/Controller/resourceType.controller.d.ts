import { ResourceType } from '../Entities/resourceType.entity';
import { ResourceTypeService } from '../Services/resourceType.service';
export declare class ResourceTypeController {
    private readonly resourceTypeService;
    constructor(resourceTypeService: ResourceTypeService);
    findAll(): Promise<ResourceType[]>;
    findOne(id: string): Promise<ResourceType | null>;
    create(data: any): Promise<ResourceType>;
    update(id: string, data: any): Promise<ResourceType | null>;
    remove(id: string): Promise<void>;
}
