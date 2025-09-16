export type DebateMode = 'Debate' | 'Lecture';

export interface RagSnippet {
  content: string;
  source?: string;
}

export interface Persona {
  id: string;
  name: string;
  systemPrompt: string;
  avatar_url?: string;
  feature_image_url?: string;
}
