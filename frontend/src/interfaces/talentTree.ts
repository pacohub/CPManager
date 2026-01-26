import { TalentItem } from './talent';

export interface TalentTreeItem {
  id: number;
  name: string;
  file?: string | null;
  entries?: Array<{
    id?: number;
    talentId: number;
    talent?: TalentItem;
    posX?: number;
    posY?: number;
    order?: number;
  }>;
  links?: Array<{
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
  }>;
}

export type TalentTreeCreate = Partial<TalentTreeItem>;
