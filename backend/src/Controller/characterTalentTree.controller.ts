import { Body, Controller, Param, Put } from '@nestjs/common';
import { CharacterTalentTreeService } from '../Services/characterTalentTree.service';

@Controller('characters')
export class CharacterTalentTreeController {
  constructor(private readonly cttService: CharacterTalentTreeService) {}

  @Put(':characterId/talent-trees/:treeId')
  async setEnabled(@Param('characterId') characterId: string, @Param('treeId') treeId: string, @Body() body: { enabled: boolean }) {
    const enabled = !!body.enabled;
    return this.cttService.setEnabled(Number(characterId), Number(treeId), enabled);
  }
}
