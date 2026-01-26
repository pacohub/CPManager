import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SoundType } from '../Entities/soundType.entity';
import { Sound } from '../Entities/sound.entity';

@Injectable()
export class SoundTypeService {
	constructor(
		@InjectRepository(SoundType)
		private soundTypeRepository: Repository<SoundType>,
		@InjectRepository(Sound)
		private soundRepository: Repository<Sound>,
	) {}

	async findAll(): Promise<SoundType[]> {
		return this.soundTypeRepository
			.createQueryBuilder('t')
			.orderBy('LOWER(t.name)', 'ASC')
			.addOrderBy('t.id', 'ASC')
			.getMany();
	}

	async findOne(id: number): Promise<SoundType | null> {
		return this.soundTypeRepository.findOneBy({ id });
	}

	private normalize(data: Partial<SoundType>) {
		if (typeof data.name === 'string') data.name = data.name.trim();
	}

	async create(data: Partial<SoundType>): Promise<SoundType> {
		this.normalize(data);
		if (!data.name) throw new BadRequestException('name es requerido');
		const entity = this.soundTypeRepository.create(data);
		return this.soundTypeRepository.save(entity);
	}

	async update(id: number, data: Partial<SoundType>): Promise<SoundType | null> {
		this.normalize(data);
		await this.soundTypeRepository.update(id, data);
		return this.findOne(id);
	}

	async getUsage(id: number): Promise<{ count: number; soundIds: number[] }> {
		const sounds = await this.soundRepository
			.createQueryBuilder('s')
			.innerJoin('s.types', 't', 't.id = :id', { id })
			.select(['s.id'])
			.getMany();
		const ids = (sounds || []).map((s) => s.id);
		return { count: ids.length, soundIds: ids };
	}

	async remove(id: number): Promise<{ removedCount: number; removedSoundIds: number[] }> {
		const usage = await this.getUsage(id);
		// attempt to remove join-table rows directly, then delete the sound type inside a transaction
		const removedIds: number[] = usage.soundIds || [];

		try {
			await this.soundTypeRepository.manager.transaction(async (manager) => {
				// inspect join table columns to find the sound-type column name
				const info: Array<{ cid: number; name: string }> = await manager.query("PRAGMA table_info('sound_types')");
				const colNames = (info || []).map((c: any) => String(c.name));

				let typeCol = colNames.find((n: string) => /sound.*type/i.test(n) || /type.*sound/i.test(n));
				if (!typeCol) typeCol = colNames.find((n: string) => /type/i.test(n));
				if (!typeCol) typeCol = 'soundTypeId';

				// debug logs for troubleshooting
				console.log('[soundType.remove] sound_types columns=', colNames);
				const sql = `DELETE FROM sound_types WHERE "${typeCol}" = ?`;
				console.log('[soundType.remove] executing:', sql, 'with id=', id);
				const res = await manager.query(sql, [id]);
				console.log('[soundType.remove] delete join result=', res);

				// finally delete the sound type row
				console.log('[soundType.remove] deleting sound_type id=', id);
				await manager.delete(SoundType, id);
			});
		} catch (err) {
			console.error('[soundType.remove] error during removal', err);
			throw err;
		}

		return { removedCount: removedIds.length, removedSoundIds: removedIds };
	}
}
