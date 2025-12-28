import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Character } from '../Entities/character.entity';
import { Class } from '../Entities/class.entity';
import { Race } from '../Entities/race.entity';

function normalizeText(v: any): string {
	if (typeof v !== 'string') return '';
	return v.trim();
}

@Injectable()
export class CharacterService {
	constructor(
		@InjectRepository(Character)
		private characterRepository: Repository<Character>,
		@InjectRepository(Class)
		private classRepository: Repository<Class>,
		@InjectRepository(Race)
		private raceRepository: Repository<Race>,
	) {}

	async findAll(): Promise<Character[]> {
		// Solo personajes raíz (los hijos se gestionan como "instancias")
		return this.characterRepository
			.createQueryBuilder('character')
			.leftJoinAndSelect('character.class', 'class')
			.leftJoinAndSelect('character.race', 'race')
			.where('character.parentId IS NULL')
			.orderBy('LOWER(character.name)', 'ASC')
			.addOrderBy('character.id', 'ASC')
			.getMany();
	}

	async findOne(id: number): Promise<Character | null> {
		return this.characterRepository.findOne({ where: { id }, relations: { class: true, race: true } as any });
	}

	async create(data: any): Promise<Character> {
		const name = normalizeText(data?.name);
		const icon = normalizeText(data?.icon) || null;
		const image = normalizeText(data?.image) || null;
		const model = normalizeText(data?.model) || null;
		const classId = Number(data?.classId);
		const raceIdRaw = data?.raceId;
		const raceId = raceIdRaw === undefined || raceIdRaw === null || String(raceIdRaw).trim() === '' ? null : Number(raceIdRaw);
		if (!name) throw new Error('Nombre requerido');
		if (!Number.isFinite(classId) || classId <= 0) throw new Error('classId requerido');

		const klass = await this.classRepository.findOneBy({ id: classId });
		if (!klass) throw new Error('Clase no encontrada');

		let race: Race | null = null;
		if (raceId !== null) {
			if (!Number.isFinite(raceId) || raceId <= 0) throw new Error('raceId inválido');
			race = await this.raceRepository.findOneBy({ id: raceId });
			if (!race) throw new Error('Raza no encontrada');
		}

		const character = this.characterRepository.create({
			name,
			icon,
			image,
			model,
			classId: klass.id,
			class: klass,
			raceId: race ? race.id : null,
			race,
			parentId: null,
			parent: null,
		});
		return this.characterRepository.save(character);
	}

	async update(id: number, data: any): Promise<Character | null> {
		const patch: Partial<Character> = {};
		if (typeof data?.name === 'string') patch.name = normalizeText(data.name);
		if (typeof data?.icon === 'string') patch.icon = normalizeText(data.icon) || null;
		if (typeof data?.image === 'string') patch.image = normalizeText(data.image) || null;
		if (typeof data?.model === 'string') patch.model = normalizeText(data.model) || null;

		if (data?.classId !== undefined) {
			const classId = Number(data.classId);
			if (!Number.isFinite(classId) || classId <= 0) throw new Error('classId inválido');
			const klass = await this.classRepository.findOneBy({ id: classId });
			if (!klass) throw new Error('Clase no encontrada');
			patch.classId = klass.id;
			patch.class = klass;
		}

		if (data?.raceId !== undefined) {
			const raw = data.raceId;
			const nextRaceId = raw === null || String(raw).trim() === '' ? null : Number(raw);
			if (nextRaceId === null) {
				patch.raceId = null;
				patch.race = null;
			} else {
				if (!Number.isFinite(nextRaceId) || nextRaceId <= 0) throw new Error('raceId inválido');
				const race = await this.raceRepository.findOneBy({ id: nextRaceId });
				if (!race) throw new Error('Raza no encontrada');
				patch.raceId = race.id;
				patch.race = race;
			}
		}

		await this.characterRepository.update(id, patch);
		return this.findOne(id);
	}

	async remove(id: number): Promise<void> {
		await this.characterRepository.delete(id);
	}

	async getChildren(parentId: number): Promise<Character[]> {
		return this.characterRepository
			.createQueryBuilder('character')
			.leftJoinAndSelect('character.class', 'class')
			.leftJoinAndSelect('character.race', 'race')
			.where('character.parentId = :parentId', { parentId })
			.orderBy('LOWER(character.name)', 'ASC')
			.addOrderBy('character.id', 'ASC')
			.getMany();
	}

	async createChild(parentId: number, data: any): Promise<Character> {
		const parent = await this.characterRepository.findOne({ where: { id: parentId }, relations: { class: true } });
		if (!parent) throw new Error('Personaje no encontrado');
		if (parent.parentId) throw new Error('Las instancias no pueden tener otras instancias');

		const name = normalizeText(data?.name);
		const icon = normalizeText(data?.icon) || null;
		const image = normalizeText(data?.image) || null;
		const model = normalizeText(data?.model) || null;
		const classId = Number(data?.classId);
		const raceIdRaw = data?.raceId;
		const raceId = raceIdRaw === undefined || raceIdRaw === null || String(raceIdRaw).trim() === '' ? null : Number(raceIdRaw);
		if (!name) throw new Error('Nombre requerido');
		if (!Number.isFinite(classId) || classId <= 0) throw new Error('classId requerido');
		const klass = await this.classRepository.findOneBy({ id: classId });
		if (!klass) throw new Error('Clase no encontrada');

		let race: Race | null = null;
		if (raceId !== null) {
			if (!Number.isFinite(raceId) || raceId <= 0) throw new Error('raceId inválido');
			race = await this.raceRepository.findOneBy({ id: raceId });
			if (!race) throw new Error('Raza no encontrada');
		}

		const child = this.characterRepository.create({
			name,
			icon,
			image,
			model,
			classId: klass.id,
			class: klass,
			raceId: race ? race.id : null,
			race,
			parentId: parent.id,
			parent,
		});
		return this.characterRepository.save(child);
	}

	async updateChild(parentId: number, childId: number, data: any): Promise<Character | null> {
		const existing = await this.characterRepository.findOne({ where: { id: childId, parentId }, relations: { class: true } });
		if (!existing) return null;

		const patch: Partial<Character> = {};
		if (typeof data?.name === 'string') patch.name = normalizeText(data.name);
		if (typeof data?.icon === 'string') patch.icon = normalizeText(data.icon) || null;
		if (typeof data?.image === 'string') patch.image = normalizeText(data.image) || null;
		if (typeof data?.model === 'string') patch.model = normalizeText(data.model) || null;

		if (data?.classId !== undefined) {
			const classId = Number(data.classId);
			if (!Number.isFinite(classId) || classId <= 0) throw new Error('classId inválido');
			const klass = await this.classRepository.findOneBy({ id: classId });
			if (!klass) throw new Error('Clase no encontrada');
			patch.classId = klass.id;
			patch.class = klass;
		}

		if (data?.raceId !== undefined) {
			const raw = data.raceId;
			const nextRaceId = raw === null || String(raw).trim() === '' ? null : Number(raw);
			if (nextRaceId === null) {
				patch.raceId = null;
				patch.race = null;
			} else {
				if (!Number.isFinite(nextRaceId) || nextRaceId <= 0) throw new Error('raceId inválido');
				const race = await this.raceRepository.findOneBy({ id: nextRaceId });
				if (!race) throw new Error('Raza no encontrada');
				patch.raceId = race.id;
				patch.race = race;
			}
		}

		await this.characterRepository.update(childId, patch);
		return this.characterRepository.findOne({ where: { id: childId, parentId }, relations: { class: true, race: true } as any });
	}

	async removeChild(parentId: number, childId: number): Promise<void> {
		await this.characterRepository.delete({ id: childId, parentId });
	}
}
