import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Animation } from '../Entities/animation.entity';
import { ArmorType } from '../Entities/armorType.entity';
import { Race, RACE_DEATH_TYPES, RACE_MOVEMENT_TYPES } from '../Entities/race.entity';
import { Sound } from '../Entities/sound.entity';

@Injectable()
export class RaceService {
	constructor(
		@InjectRepository(Race)
		private raceRepository: Repository<Race>,
		@InjectRepository(ArmorType)
		private armorTypeRepository: Repository<ArmorType>,
		@InjectRepository(Sound)
		private soundRepository: Repository<Sound>,
		@InjectRepository(Animation)
		private animationRepository: Repository<Animation>,
	) {}

	private async resolveArmorTypeId(data: any): Promise<number | null | undefined> {
		if (data?.armorTypeId !== undefined) {
			const raw = data.armorTypeId;
			if (raw === null || raw === '') return null;
			const n = Number.parseInt(String(raw), 10);
			if (!Number.isFinite(n) || n <= 0) throw new BadRequestException('armorTypeId inválido');
			const exists = await this.armorTypeRepository.findOneBy({ id: n });
			if (!exists) throw new BadRequestException('armorTypeId inválido');
			return n;
		}

		// Legacy fallback: armorType string -> ArmorType.name
		const legacy = String(data?.armorType ?? '').trim();
		if (!legacy) return undefined;
		const found = await this.armorTypeRepository
			.createQueryBuilder('a')
			.where('LOWER(a.name) = LOWER(:name)', { name: legacy })
			.getOne();
		if (found) return found.id;
		// Do not auto-create armor types from legacy strings.
		throw new BadRequestException('armorType inválido');
	}

	private async ensureAnimationsExistByName(names: string[]): Promise<Animation[]> {
		const unique = Array.from(new Set((names || []).map((x) => String(x || '').trim()).filter(Boolean)));
		if (unique.length === 0) return [];
		const existing = await this.animationRepository.find({ where: { name: In(unique) } });
		const existingNames = new Set((existing || []).map((a) => a.name));
		const missing = unique.filter((n) => !existingNames.has(n));
		if (missing.length === 0) return existing;
		const created = await this.animationRepository.save(missing.map((name) => this.animationRepository.create({ name })));
		return [...existing, ...(created || [])];
	}

	private async resolveDefaultAnimationsForRace(data: Partial<Race>): Promise<Animation[]> {
		const names: string[] = ['Stand', 'Die'];
		const deathType = String((data as any)?.deathType ?? '').trim();
		const movementType = String((data as any)?.movementType ?? '').trim();
		if (deathType === 'revive, se pudre' || deathType === 'no revive, se pudre') names.push('Decay');
		if (movementType && movementType !== 'ninguno') names.push('Walk');
		return this.ensureAnimationsExistByName(names);
	}

	async findAll(): Promise<Race[]> {
		return this.raceRepository
			.createQueryBuilder('r')
			.leftJoinAndSelect('r.movementSound', 'ms')
			.leftJoinAndSelect('ms.types', 'mst')
			.leftJoinAndSelect('r.armorTypeEntity', 'at')
			.leftJoinAndSelect('r.animations', 'a')
			.orderBy('LOWER(r.name)', 'ASC')
			.addOrderBy('r.id', 'ASC')
			.getMany();
	}

	async findOne(id: number): Promise<Race | null> {
		return this.raceRepository.findOne({
			where: { id },
			relations: { movementSound: { types: true }, armorTypeEntity: true, animations: true },
		});
	}

	private coerceIdArray(value: any): number[] {
		if (!Array.isArray(value)) return [];
		const out: number[] = [];
		const seen = new Set<number>();
		for (const raw of value) {
			const n = Number.parseInt(String(raw), 10);
			if (!Number.isFinite(n) || n <= 0) continue;
			if (seen.has(n)) continue;
			seen.add(n);
			out.push(n);
		}
		return out;
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
		if (data.armorTypeId !== undefined) {
			const v = data.armorTypeId;
			data.armorTypeId = v === null || v === '' ? null : Number.parseInt(String(v), 10);
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
		const resolvedArmorTypeId = await this.resolveArmorTypeId(data as any);
		const entity = this.raceRepository.create(data);
		if (resolvedArmorTypeId !== undefined) {
			entity.armorTypeId = resolvedArmorTypeId as any;
			entity.armorTypeEntity = resolvedArmorTypeId ? await this.armorTypeRepository.findOneBy({ id: resolvedArmorTypeId }) : null;
		}
		entity.animations = await this.resolveDefaultAnimationsForRace(entity);
		return this.raceRepository.save(entity);
	}

	async update(id: number, data: Partial<Race>): Promise<Race | null> {
		this.coerceNumbers(data as any);
		this.normalize(data);
		this.validateEnums(data);
		await this.ensureSoundExists(data.movementSoundId ?? undefined);
		const resolvedArmorTypeId = await this.resolveArmorTypeId(data as any);
		const animationIdsRaw = (data as any)?.animationIds;
		const shouldUpdateAnimations = animationIdsRaw !== undefined;
		delete (data as any).animationIds;
		delete (data as any).armorTypeEntity;

		const existing = await this.raceRepository.findOne({
			where: { id },
			relations: { movementSound: { types: true }, armorTypeEntity: true, animations: true },
		});
		if (!existing) throw new NotFoundException('Raza no encontrada');

		Object.assign(existing, data);

		if (data.movementSoundId !== undefined) {
			const nextId = (data.movementSoundId as any) === '' ? null : (data.movementSoundId ?? null);
			if (!nextId) {
				existing.movementSoundId = null;
				existing.movementSound = null;
			} else {
				const s = await this.soundRepository.findOne({ where: { id: Number(nextId) }, relations: { types: true } });
				if (!s) throw new BadRequestException('movementSoundId inválido');
				existing.movementSoundId = s.id;
				existing.movementSound = s;
			}
		}

		if (shouldUpdateAnimations) {
			const ids = this.coerceIdArray(animationIdsRaw);
			existing.animations = ids.length ? await this.animationRepository.find({ where: { id: In(ids) } }) : [];
		}

		if (resolvedArmorTypeId !== undefined) {
			if (!resolvedArmorTypeId) {
				existing.armorTypeId = null;
				existing.armorTypeEntity = null;
			} else {
				const at = await this.armorTypeRepository.findOneBy({ id: resolvedArmorTypeId });
				if (!at) throw new BadRequestException('armorTypeId inválido');
				existing.armorTypeId = at.id;
				existing.armorTypeEntity = at;
			}
		}

		return this.raceRepository.save(existing);
	}

	async remove(id: number): Promise<void> {
		await this.raceRepository.delete(id);
	}
}
