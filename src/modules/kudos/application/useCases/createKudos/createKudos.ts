import { Kudos } from '../../../domain/entities/kudos.entity';
import { KudosRepository } from '../../../repositories/kudos.repository';
import { CreateKudosRequestDto } from './createKudosRequestDto';

export class CreateKudosUseCase {
  constructor(private kudosRepository: KudosRepository) {}

  async execute(dto: CreateKudosRequestDto, userId: number): Promise<void> {
    const kudos = Kudos.create({
      recipientId: dto.recipientId,
      categoryId: dto.categoryId,
      message: dto.message,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.kudosRepository.create(kudos);
  }
}
