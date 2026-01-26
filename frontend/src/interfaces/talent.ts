export interface TalentItem {
  id: number;
  name: string;
  description?: string | null;
  icon?: string | null;
  file?: string | null;
  skills?: any[];
  visuals?: any[];
}

export type TalentCreate = Partial<TalentItem>;
