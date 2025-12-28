import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Campaign } from '../Entities/campaign.entity';
import { GameObject } from '../Entities/gameObject.entity';

@Injectable()
export class GameObjectService {
	constructor(
		@InjectRepository(GameObject)
		private gameObjectRepository: Repository<GameObject>,
		@InjectRepository(Campaign)
		private campaignRepository: Repository<Campaign>,
	) {}

	private normalizeText(value: any): string | undefined {
		if (value === undefined) return undefined;
		if (value === null) return '';
		return String(value).trim();
	}

	async findAll(): Promise<GameObject[]> {
		return this.gameObjectRepository
			.createQueryBuilder('obj')
			.orderBy('LOWER(obj.name)', 'ASC')
			.addOrderBy('obj.id', 'ASC')
			.getMany();
	}

	async findOne(id: number): Promise<GameObject | null> {
		return this.gameObjectRepository.findOneBy({ id });
	}

	async create(data: any): Promise<GameObject> {
		const name = this.normalizeText(data?.name);
		if (!name) throw new BadRequestException('name es requerido');

		const obj = this.gameObjectRepository.create({
			name,
			icon: this.normalizeText(data?.icon) ?? '',
			description: this.normalizeText(data?.description) ?? '',
			fileLink: this.normalizeText(data?.fileLink) ?? '',
		});

		return this.gameObjectRepository.save(obj);
	}

	async update(id: number, data: any): Promise<GameObject | null> {
		const patch: Partial<GameObject> = {};

		if (data?.name !== undefined) {
			const name = this.normalizeText(data?.name);
			if (!name) throw new BadRequestException('name es requerido');
			patch.name = name;
		}
		if (data?.icon !== undefined) patch.icon = this.normalizeText(data?.icon) ?? '';
		if (data?.description !== undefined) patch.description = this.normalizeText(data?.description) ?? '';
		if (data?.fileLink !== undefined) patch.fileLink = this.normalizeText(data?.fileLink) ?? '';

		await this.gameObjectRepository.update(id, patch);
		return this.findOne(id);
	}

	async remove(id: number): Promise<void> {
		await this.gameObjectRepository.delete(id);
	}

	async getCampaigns(objectId: number): Promise<Campaign[]> {
		const obj = await this.gameObjectRepository.findOne({
			where: { id: objectId },
			relations: { campaigns: true },
		});
		if (!obj) throw new NotFoundException('Objeto no encontrado');
		return obj.campaigns ?? [];
	}

	async setCampaignIds(objectId: number, campaignIds: number[]): Promise<GameObject> {
		const obj = await this.gameObjectRepository.findOne({
			where: { id: objectId },
			relations: { campaigns: true },
		});
		if (!obj) throw new NotFoundException('Objeto no encontrado');

		const uniqueIds = Array.from(
			new Set((campaignIds ?? []).map((x) => Number(x)).filter((x) => Number.isFinite(x))),
		);

		const campaigns = uniqueIds.length
			? await this.campaignRepository.findBy({ id: In(uniqueIds) })
			: [];

		obj.campaigns = campaigns;
		return this.gameObjectRepository.save(obj);
	}
}
