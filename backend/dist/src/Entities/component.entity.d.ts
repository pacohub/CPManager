import { Map } from './map.entity';
export declare const COMPONENT_TYPES: readonly ["puentes y rampas", "cinemático (efectos)", "efecto en terreno o paredes", "entorno (sin collider)", "adorno (con collider)", "estructura", "árboles y destructibles", "agua"];
export type ComponentType = (typeof COMPONENT_TYPES)[number];
export declare class Component {
    id: number;
    name: string;
    description: string;
    type: string;
    model: string;
    image: string;
    maps: Map[];
}
