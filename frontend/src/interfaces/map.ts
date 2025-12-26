export interface MapItem {
  id: number;
  name: string;
  description?: string;
  image?: string;
  file?: string;
  regions?: { id: number; name: string; description?: string; link?: string }[];
}
