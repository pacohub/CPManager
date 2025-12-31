import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ArmorType } from '../Entities/armorType.entity';
import { Race } from '../Entities/race.entity';
import { Sound } from '../Entities/sound.entity';

const DEFAULT_ARMOR_TYPES = ['carne', 'etérea', 'metal', 'piedra', 'madera'];

@Injectable()
export class ArmorTypeService {
	constructor(
		@InjectRepository(ArmorType)
		private armorTypeRepository: Repository<ArmorType>,
		@InjectRepository(Race)
		private raceRepository: Repository<Race>,
		@InjectRepository(Sound)
		private soundRepository: Repository<Sound>,
	) {}

	private normalize(data: Partial<ArmorType>) {
		if (typeof data.name === 'string') data.name = data.name.trim();
	}

	private async ensureSeeded(): Promise<void> {
		const count = await this.armorTypeRepository.count();
		if (count > 0) return;
		await this.armorTypeRepository.save(
			DEFAULT_ARMOR_TYPES.map((name) => this.armorTypeRepository.create({ name, sounds: [] })),
		);
	}

	private async resolveSounds(soundIds?: any): Promise<Sound[]> {
		if (soundIds === undefined || soundIds === null) return [];
		if (!Array.isArray(soundIds)) throw new BadRequestException('soundIds debe ser un array de ids');
		const ids = soundIds.map((x) => Number(x)).filter((n) => Number.isFinite(n) && n > 0);
		if (ids.length === 0) return [];
		return this.soundRepository.find({ where: { id: In(ids) }, relations: { types: true } });
	}

	async findAll(): Promise<ArmorType[]> {
		await this.ensureSeeded();
		return this.armorTypeRepository
			.createQueryBuilder('a')
			.leftJoinAndSelect('a.sounds', 's')
			.leftJoinAndSelect('s.types', 'st')
			.orderBy('LOWER(a.name)', 'ASC')
			.addOrderBy('a.id', 'ASC')
			.getMany();
	}

	async findOne(id: number): Promise<ArmorType | null> {
		return this.armorTypeRepository.findOne({ where: { id }, relations: { sounds: { types: true } } });
	}

	async create(data: Partial<ArmorType> & { soundIds?: any }): Promise<ArmorType> {
		this.normalize(data);
		if (!data.name) throw new BadRequestException('name es requerido');
		const sounds = await this.resolveSounds((data as any).soundIds);
		const entity = this.armorTypeRepository.create({ name: data.name, sounds });
		return this.armorTypeRepository.save(entity);
	}

	async update(id: number, data: Partial<ArmorType> & { soundIds?: any }): Promise<ArmorType | null> {
		this.normalize(data);
		const existing = await this.findOne(id);
		if (!existing) throw new NotFoundException('Tipo de armadura no encontrado');

		let sounds = existing.sounds;
		if ((data as any).soundIds !== undefined) {
			sounds = await this.resolveSounds((data as any).soundIds);
		}

		await this.armorTypeRepository.save({ ...existing, ...data, sounds });
		return this.findOne(id);
	}

	async resetToDefaults(): Promise<ArmorType[]> {
		await this.armorTypeRepository.manager.transaction(async (manager) => {
			// Keep races on default values (no armor type assigned)
			await manager.getRepository(Race).createQueryBuilder().update().set({ armorTypeId: null, armorType: null as any }).execute();

			// Clear join table first (safe even if empty)
			await manager.query('DELETE FROM armor_type_sounds');
			await manager.getRepository(ArmorType).createQueryBuilder().delete().execute();

			await manager.getRepository(ArmorType).save(
				DEFAULT_ARMOR_TYPES.map((name) => manager.getRepository(ArmorType).create({ name, sounds: [] })),
			);
		});

		return this.findAll();
	}

	async remove(id: number): Promise<void> {
		await this.armorTypeRepository.delete(id);
	}
}
