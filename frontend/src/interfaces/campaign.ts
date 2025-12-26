export interface Campaign {
  id: number;
  name: string;
  description: string;
  image?: string;
  file?: string;
  sagaId: number;
  order: number;
}
