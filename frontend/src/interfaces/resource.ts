import { ResourceTypeItem } from './resourceType';

export interface ResourceItem {
	id: number;
	name: string;
	description?: string;
	icon?: string;
	fileLink?: string;
	resourceType?: ResourceTypeItem | null;
}
