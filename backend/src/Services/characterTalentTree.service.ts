import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CharacterTalentTree } from '../Entities/characterTalentTree.entity';
import { Character } from '../Entities/character.entity';
import { TalentTree } from '../Entities/talentTree.entity';

@Injectable()
export class CharacterTalentTreeService {
  constructor(
    @InjectRepository(CharacterTalentTree)
    private cttRepository: Repository<CharacterTalentTree>,
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
    @InjectRepository(TalentTree)
    private treeRepository: Repository<TalentTree>,
  ) {}

  async setEnabled(characterId: number, talentTreeId: number, enabled: boolean): Promise<CharacterTalentTree> {
    const existing = await this.cttRepository.findOneBy({ characterId, talentTreeId } as any);
    if (existing) {
      existing.enabled = !!enabled;
      const saved = await this.cttRepository.save(existing);
      return (saved as unknown) as CharacterTalentTree;
    }
    const character = await this.characterRepository.findOneBy({ id: characterId } as any);
    const tree = await this.treeRepository.findOneBy({ id: talentTreeId } as any);
    const created = this.cttRepository.create({ character, characterId, talentTree: tree, talentTreeId, enabled: !!enabled } as any);
    const saved = await this.cttRepository.save(created);
    return (saved as unknown) as CharacterTalentTree;
  }
}
