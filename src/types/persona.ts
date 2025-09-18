/**
 * Types for Charlie Kirk Debate Bot
 */

/**
 * Debate mode options
 * - Debate: Adversarial tone, challenges user positions
 * - Lecture: Explanatory tone, educates on worldview without confrontation
 */
export type DebateMode = 'Debate' | 'Lecture';

/**
 * Persona definition
 */
export interface Persona {
  id: string;
  name: string;
  systemPrompt: string;
  avatar_url?: string;
  feature_image_url?: string;
}

/**
 * RAG (Retrieval-Augmented Generation) snippet
 * Represents content retrieved from Charlie Kirk's writings/transcripts
 */
export interface RagSnippet {
  content: string;
  source?: string;
  score?: number;
}
