import { Kudos } from '../../../domain/entities/kudos.entity';
import { KudosRepository } from '../../../repositories/kudos.repository';
import { CreateKudosRequestDto } from './createKudosRequestDto';
import { BasecampService } from '../../../../../shared/services/basecamp.service';
import { KudosDetailsRepository } from '../../../repositories/kudosDetailsRepository';

export class CreateKudosUseCase {
  constructor(
    private kudosRepository: KudosRepository,
    private kudosDetailsRepository: KudosDetailsRepository,
  ) {}

  async execute(dto: CreateKudosRequestDto, userId: number): Promise<void> {
    const kudos = Kudos.create({
      recipientId: dto.recipientId,
      categoryId: dto.categoryId,
      message: dto.message,
      teamId: dto.teamId,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.kudosRepository.create(kudos);

    // Get details from kudos details repository
    try {
      // Get all needed details using the kudos details repository
      const recipientName = await this.kudosDetailsRepository.getUserNameById(dto.recipientId);
      const categoryName = await this.kudosDetailsRepository.getCategoryNameById(dto.categoryId);
      const teamName = await this.kudosDetailsRepository.getTeamNameById(dto.teamId);
      const creatorName = await this.kudosDetailsRepository.getUserNameById(userId);

      // Send notification to Basecamp with real data
      const basecampMessage = `
        <div >
          <h2>🏆 New Kudos!</h2>
          <p>"${dto.message}"</p>
          <div style="margin-top: 15px;">
            <p><strong>🙋 Recipient:</strong> ${recipientName}</p>
            <p><strong>🏅 Category:</strong> ${categoryName}</p>
            <p><strong>👥 Team:</strong> ${teamName}</p>
            <p><strong>👏 From:</strong> ${creatorName}</p>
          </div>
        </div>
      `;
      await BasecampService.sendMessage(basecampMessage);
    } catch (error) {
      console.error('Failed to send Basecamp notification:', error);
      // We don't throw the error here to avoid affecting the main flow
    }
  }
}
