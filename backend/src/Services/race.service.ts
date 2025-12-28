import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Race, RACE_ARMOR_TYPES, RACE_DEATH_TYPES, RACE_MOVEMENT_TYPES } from '../Entities/race.entity';
import { Sound } from '../Entities/sound.entity';

@Injectable()
export class RaceService {
	constructor(
		@InjectRepository(Race)
		private raceRepository: Repository<Race>,
		@InjectRepository(Sound)
		private soundRepository: Repository<Sound>,
	) {}

	async findAll(): Promise<Race[]> {
		return this.raceRepository
			.createQueryBuilder('r')
			.leftJoinAndSelect('r.movementSound', 'ms')
			.leftJoinAndSelect('ms.types', 'mst')
			.orderBy('LOWER(r.name)', 'ASC')
			.addOrderBy('r.id', 'ASC')
			.getMany();
	}

	async findOne(id: number): Promise<Race | null> {
		return this.raceRepository.findOne({ where: { id }, relations: { movementSound: { types: true } } });
	}

	private normalize(data: Partial<Race>) {
		if (typeof data.name === 'string') data.name = data.name.trim();
		for (const key of ['icon', 'deathType', 'movementType', 'attack1', 'attack2', 'defenseType', 'armorType'] as const) {
			const v = (data as any)[key];
			if (typeof v === 'string') (data as any)[key] = v.trim();
		}
	}

	private validateEnums(data: Partial<Race>) {
		if (data.deathType !== undefined && data.deathType !== null) {
			if (!RACE_DEATH_TYPES.includes(data.deathType as any)) {
				throw new BadRequestException(`deathType inválido. Debe ser uno de: ${RACE_DEATH_TYPES.join(' | ')}`);
			}
		}
		if (data.movementType !== undefined && data.movementType !== null) {
			if (!RACE_MOVEMENT_TYPES.includes(data.movementType as any)) {
				throw new BadRequestException(`movementType inválido. Debe ser uno de: ${RACE_MOVEMENT_TYPES.join(' | ')}`);
			}
		}
		if (data.armorType !== undefined && data.armorType !== null) {
			if (!RACE_ARMOR_TYPES.includes(data.armorType as any)) {
				throw new BadRequestException(`armorType inválido. Debe ser uno de: ${RACE_ARMOR_TYPES.join(' | ')}`);
			}
		}
	}

	private coerceNumbers(data: any) {
		const intFields = ['baseDefense', 'movementSpeed', 'baseLife', 'baseMana', 'initialMana', 'transportSize'];
		for (const k of intFields) {
			if (data[k] !== undefined && data[k] !== null && data[k] !== '') data[k] = Number.parseInt(String(data[k]), 10);
		}
		const floatFields = ['lifeRegen', 'baseManaRegen'];
		for (const k of floatFields) {
			if (data[k] !== undefined && data[k] !== null && data[k] !== '') data[k] = Number.parseFloat(String(data[k]));
		}
		if (data.movementSoundId !== undefined) {
			const v = data.movementSoundId;
			data.movementSoundId = v === null || v === '' ? null : Number.parseInt(String(v), 10);
		}
	}

	private async ensureSoundExists(soundId?: number | null) {
		if (!soundId) return;
		const s = await this.soundRepository.findOne({ where: { id: soundId }, relations: { types: true } });
		if (!s) throw new BadRequestException('movementSoundId inválido');
	}

	async create(data: Partial<Race>): Promise<Race> {
		this.coerceNumbers(data as any);
		this.normalize(data);
		this.validateEnums(data);
		if (!data.name) throw new BadRequestException('name es requerido');
		await this.ensureSoundExists(data.movementSoundId ?? null);
		const entity = this.raceRepository.create(data);
		return this.raceRepository.save(entity);
	}

	async update(id: number, data: Partial<Race>): Promise<Race | null> {
		this.coerceNumbers(data as any);
		this.normalize(data);
		this.validateEnums(data);
		await this.ensureSoundExists(data.movementSoundId ?? undefined);
		const existing = await this.findOne(id);
		if (!existing) throw new NotFoundException('Raza no encontrada');
		await this.raceRepository.update(id, data);
		return this.findOne(id);
	}

	async remove(id: number): Promise<void> {
		await this.raceRepository.delete(id);
	}
}
