import { Repository } from 'typeorm';
import { CharacterTalentTree } from '../Entities/characterTalentTree.entity';
import { Character } from '../Entities/character.entity';
import { TalentTree } from '../Entities/talentTree.entity';
export declare class CharacterTalentTreeService {
    private cttRepository;
    private characterRepository;
    private treeRepository;
    constructor(cttRepository: Repository<CharacterTalentTree>, characterRepository: Repository<Character>, treeRepository: Repository<TalentTree>);
    setEnabled(characterId: number, talentTreeId: number, enabled: boolean): Promise<CharacterTalentTree>;
}
