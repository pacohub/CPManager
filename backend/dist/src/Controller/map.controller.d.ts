import { Component } from '../Entities/component.entity';
import { Map } from '../Entities/map.entity';
import { MapService } from '../Services/map.service';
export declare class MapController {
    private readonly mapService;
    constructor(mapService: MapService);
    findAll(): Promise<Map[]>;
    findOne(id: string): Promise<Map | null>;
    create(data: any, files: {
        image?: Express.Multer.File[];
    }): Promise<Map>;
    update(id: string, data: any, files: {
        image?: Express.Multer.File[];
    }): Promise<Map | null>;
    remove(id: string): Promise<void>;
    getComponents(id: string): Promise<Component[]>;
    setComponents(id: string, body: any): Promise<Map>;
}
