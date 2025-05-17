export interface CategoryProps {
  id?: number;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export class Category {
  private props: CategoryProps;

  private constructor(props: CategoryProps) {
    this.props = {
      ...props,
      deletedAt: props.deletedAt || null,
    };
  }

  public static create(props: CategoryProps): Category {
    return new Category(props);
  }

  get id(): number | undefined {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get createdAt(): Date {
    return this.props.createdAt as Date;
  }

  get updatedAt(): Date {
    return this.props.updatedAt as Date;
  }

  get deletedAt(): Date | null {
    return this.props.deletedAt as Date | null;
  }

  public toJSON(): CategoryProps {
    return { ...this.props };
  }

  public update(name: string): void {
    this.props.name = name;
    this.props.updatedAt = new Date();
  }

  public delete(): void {
    this.props.deletedAt = new Date();
  }
}
