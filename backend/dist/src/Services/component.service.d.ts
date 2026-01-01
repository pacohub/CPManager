import { Repository } from 'typeorm';
import { Component } from '../Entities/component.entity';
export declare class ComponentService {
    private componentRepository;
    constructor(componentRepository: Repository<Component>);
    findAll(): Promise<Component[]>;
    findOne(id: number): Promise<Component | null>;
    private normalize;
    private validateType;
    create(data: Partial<Component>): Promise<Component>;
    update(id: number, data: Partial<Component>): Promise<Component | null>;
    remove(id: number): Promise<void>;
}
