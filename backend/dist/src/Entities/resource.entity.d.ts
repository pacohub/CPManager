import { Chapter } from './chapter.entity';
import { ResourceType } from './resourceType.entity';
export declare class Resource {
    id: number;
    name: string;
    description: string;
    icon: string;
    fileLink: string;
    resourceType: ResourceType;
    chapters: Chapter[];
}
