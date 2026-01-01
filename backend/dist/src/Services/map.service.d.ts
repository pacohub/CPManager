import { Repository } from 'typeorm';
import { Component } from '../Entities/component.entity';
import { Map } from '../Entities/map.entity';
export declare class MapService {
    private mapRepository;
    private componentRepository;
    constructor(mapRepository: Repository<Map>, componentRepository: Repository<Component>);
    findAll(): Promise<Map[]>;
    findOne(id: number): Promise<Map | null>;
    create(data: Partial<Map>): Promise<Map>;
    update(id: number, data: Partial<Map>): Promise<Map | null>;
    remove(id: number): Promise<void>;
    getComponents(mapId: number): Promise<Component[]>;
    setComponentIds(mapId: number, componentIds: number[]): Promise<Map>;
}
