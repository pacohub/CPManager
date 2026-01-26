import { CharacterTalentTreeService } from '../Services/characterTalentTree.service';
export declare class CharacterTalentTreeController {
    private readonly cttService;
    constructor(cttService: CharacterTalentTreeService);
    setEnabled(characterId: string, treeId: string, body: {
        enabled: boolean;
    }): Promise<import("../Entities/characterTalentTree.entity").CharacterTalentTree>;
}
