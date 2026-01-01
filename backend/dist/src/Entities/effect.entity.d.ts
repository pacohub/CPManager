import { VisualEffect } from './visualEffect.entity';
export declare class Effect {
    id: number;
    name: string;
    description: string;
    type: string;
    benefit: string;
    file: string;
    visualEffect: VisualEffect | null;
}
