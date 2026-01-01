import { Component } from '../Entities/component.entity';
import { ComponentService } from '../Services/component.service';
export declare class ComponentController {
    private readonly componentService;
    constructor(componentService: ComponentService);
    findAll(): Promise<Component[]>;
    findOne(id: string): Promise<Component | null>;
    create(data: any, files: {
        image?: Express.Multer.File[];
    }): Promise<Component>;
    update(id: string, data: any, files: {
        image?: Express.Multer.File[];
    }): Promise<Component | null>;
    remove(id: string): Promise<void>;
}
