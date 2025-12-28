export interface Chapter {
  id: number;
  campaignId: number;
  name: string;
  order?: number;
  description?: string;
  image?: string;
  file?: string;
	specialType?: string | null;
}
