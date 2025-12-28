import { Resource } from '../Entities/resource.entity';
import { ResourceService } from '../Services/resource.service';
export declare class ResourceController {
    private readonly resourceService;
    constructor(resourceService: ResourceService);
    findAll(): Promise<Resource[]>;
    findOne(id: string): Promise<Resource | null>;
    create(data: any, files: {
        icon?: Express.Multer.File[];
    }): Promise<Resource>;
    update(id: string, data: any, files: {
        icon?: Express.Multer.File[];
    }): Promise<Resource | null>;
    remove(id: string): Promise<void>;
}
