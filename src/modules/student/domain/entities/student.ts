export interface Mark {
  subject: string;
  score: number;
}

export interface StudentProps {
  id: string;
  name: string;
  age: number;
  grade: string;
  marks: Mark[];
}

export class Student {
  private props: StudentProps;

  private constructor(props: StudentProps) {
    this.props = props;
  }

  static create(props: StudentProps): Student {
    if (!props.id) {
      throw new Error('Student ID is required');
    }

    if (!props.name || props.name.trim() === '') {
      throw new Error('Student name is required');
    }

    if (props.age <= 0) {
      throw new Error('Age must be a positive number');
    }

    if (!props.marks || !Array.isArray(props.marks)) {
      props.marks = [];
    }

    return new Student(props);
  }

  getId(): string {
    return this.props.id;
  }

  getName(): string {
    return this.props.name;
  }

  getAge(): number {
    return this.props.age;
  }

  getGrade(): string {
    return this.props.grade;
  }

  getMarks(): Mark[] {
    return [...this.props.marks];
  }

  getAverageScore(): number {
    if (this.props.marks.length === 0) {
      return 0;
    }

    const totalScore = this.props.marks.reduce((sum, mark) => sum + mark.score, 0);
    return totalScore / this.props.marks.length;
  }

  isPassing(): boolean {
    return this.getAverageScore() >= 40;
  }
}
