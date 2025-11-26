export enum LessonId {
  INTRO = 'intro',
  MATH_BASICS = 'math_basics',
  HYPOTHESIS = 'hypothesis',
  LOSS_FUNCTION = 'loss_function',
  GRADIENT_DESCENT = 'gradient_descent',
  APPLICATIONS = 'applications',
  PLAYGROUND = 'playground'
}

export interface DataPoint {
  x: number;
  y: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface LessonContent {
  id: LessonId;
  title: string;
  description: string;
}
