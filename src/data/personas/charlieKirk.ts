import type { Persona } from '../../types/persona';
// Import the raw MD string (Vite supports ?raw)
// @ts-ignore
import prompt from './charlie-kirk.md?raw';

export const CHARLIE: Persona = {
  id: 'charlie-kirk',
  name: 'Charlie Kirk',
  systemPrompt: prompt,
  avatar_url: '/images/charlie-avatar.png',           // optional
  feature_image_url: '/images/charlie-feature.jpg',   // optional
};

export default CHARLIE;
