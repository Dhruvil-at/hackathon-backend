export interface MarkDto {
  subject: string;
  score: number;
}

export interface GetStudentDetailsResponseDto {
  id: string;
  name: string;
  age: number;
  grade: string;
  marks: MarkDto[];
  averageScore: number;
  isPassing: boolean;
}
