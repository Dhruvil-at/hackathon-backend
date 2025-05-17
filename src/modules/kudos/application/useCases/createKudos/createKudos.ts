import { Kudos } from '../../../domain/entities/kudos.entity';
import { KudosRepository } from '../../../repositories/kudos.repository';
import { CreateKudosRequestDto } from './createKudosRequestDto';
import { CreateKudosResponseDto } from './createKudosResponseDto';

export class CreateKudosUseCase {
  constructor(private kudosRepository: KudosRepository) {}

  async execute(dto: CreateKudosRequestDto, userId: number): Promise<CreateKudosResponseDto> {
    const kudos = Kudos.create({
      recipientId: dto.recipientId,
      categoryId: dto.categoryId,
      message: dto.message,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const createdKudos = await this.kudosRepository.create(kudos);

    return {
      id: createdKudos.getId(),
      recipientId: createdKudos.getRecipientId(),
      teamId: createdKudos.getTeamId(),
      categoryId: createdKudos.getCategoryId(),
      message: createdKudos.getMessage(),
      createdBy: createdKudos.getCreatedBy(),
      createdAt: createdKudos.getCreatedAt(),
    };
  }
}
