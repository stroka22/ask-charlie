import type { Persona } from '../../types/persona';
import prompt from './charlie-kirk.md?raw';

export const CHARLIE: Persona = {
  id: 'charlie-kirk',
  name: 'Charlie Kirk',
  systemPrompt: prompt,
  // Optional images for UI
  avatar_url: '/images/charlie-avatar.png', // replace with real asset path
  feature_image_url: '/images/charlie-feature.jpg', // replace with real asset path
};

export default CHARLIE;
