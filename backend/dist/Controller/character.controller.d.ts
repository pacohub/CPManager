import { Character } from '../Entities/character.entity';
import { CharacterService } from '../Services/character.service';
export declare class CharacterController {
    private readonly characterService;
    constructor(characterService: CharacterService);
    findAll(): Promise<Character[]>;
    findOne(id: string): Promise<Character | null>;
    create(data: any): Promise<Character>;
    uploadIcon(file?: Express.Multer.File): Promise<{
        icon: string;
    }>;
    uploadImage(file?: Express.Multer.File): Promise<{
        image: string;
    }>;
    update(id: string, data: any): Promise<Character | null>;
    remove(id: string): Promise<void>;
    getInstances(id: string): Promise<Character[]>;
    createInstance(id: string, data: any): Promise<Character>;
    updateInstance(id: string, instanceId: string, data: any): Promise<Character | null>;
    removeInstance(id: string, instanceId: string): Promise<void>;
}
