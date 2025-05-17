import { KudosProps } from '../interfaces/kudos.interfaces';

export class Kudos {
  private props: KudosProps;

  private constructor() {}

  static create(props: KudosProps): Kudos {
    // Domain validation
    if (!props.recipientId || props.recipientId.length < 1) {
      throw new Error('Recipient name is required');
    }

    if (!props.message || props.message.trim().length < 5) {
      throw new Error('Message must be at least 5 characters long');
    }

    const kudos = new Kudos();
    kudos.props = props;
    return kudos;
  }

  getId(): string {
    return this.props.id || '';
  }

  getRecipientId(): string {
    return this.props.recipientId;
  }

  getTeamId(): number {
    return this.props.teamId || 0;
  }

  getCategoryId(): number {
    return this.props.categoryId;
  }
  getCategoryName(): string {
    return this.props?.categoryName || '';
  }

  getTeamName(): string {
    return this.props?.teamName || '';
  }

  getMessage(): string {
    return this.props.message;
  }

  getCreatedBy(): number {
    return this.props.createdBy;
  }

  getCreatedAt(): Date {
    return this.props.createdAt;
  }

  getUpdatedAt(): Date {
    return this.props.updatedAt;
  }

  getDeletedAt(): Date | null | undefined {
    return this.props.deletedAt;
  }

  softDelete(): void {
    this.props.deletedAt = new Date();
    this.props.updatedAt = new Date();
  }
}
