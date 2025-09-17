import { supabase } from '../services/supabase';
import { getOwnerSlug } from '../services/tierSettingsService';

// Type definitions for Bible Studies entities
export interface Study {
  id?: string;
  owner_slug: string;
  title: string;
  description?: string;
  cover_image_url?: string;
  character_id?: string;
  visibility?: 'public' | 'private';
  is_premium?: boolean;
  subject?: string;
  character_instructions?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Lesson {
  id?: string;
  study_id: string;
  order_index: number;
  title: string;
  scripture_refs?: string[];
  summary?: string;
  prompts?: Array<{ text: string }> | string[];
  resources?: any[];
  created_at?: string;
  updated_at?: string;
}

export interface StudyProgress {
  id?: string;
  user_id: string;
  study_id: string;
  current_lesson_index?: number;
  completed_lessons?: number[];
  notes?: Record<string, any>;
  last_activity_at?: string;
  created_at?: string;
}

export const bibleStudiesRepository = {
  async listStudies({ ownerSlug, includePrivate = false }: { ownerSlug?: string; includePrivate?: boolean } = {}): Promise<Study[]> {
    try {
      const org = ownerSlug || getOwnerSlug();
      
      let query = supabase
        .from('bible_studies')
        .select('*')
        .eq('owner_slug', org)
        .order('created_at', { ascending: false });
      
      if (!includePrivate) {
        query = query.eq('visibility', 'public');
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('[bibleStudiesRepository] Error listing studies:', error);
        return [];
      }
      
      return data || [];
    } catch (err) {
      console.error('[bibleStudiesRepository] Unexpected error listing studies:', err);
      return [];
    }
  },
  
  async getStudyById(id: string): Promise<Study | null> {
    try {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('bible_studies')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) {
        console.error('[bibleStudiesRepository] Error fetching study:', error);
        return null;
      }
      
      return data;
    } catch (err) {
      console.error('[bibleStudiesRepository] Unexpected error fetching study:', err);
      return null;
    }
  },
  
  async listLessons(studyId: string): Promise<Lesson[]> {
    try {
      if (!studyId) return [];
      
      const { data, error } = await supabase
        .from('bible_study_lessons')
        .select('*')
        .eq('study_id', studyId)
        .order('order_index', { ascending: true });
      
      if (error) {
        console.error('[bibleStudiesRepository] Error listing lessons:', error);
        return [];
      }
      
      // Ensure order_index is a number
      const lessons = (data || []).map(lesson => ({
        ...lesson,
        order_index: typeof lesson.order_index === 'string' 
          ? parseInt(lesson.order_index, 10) 
          : lesson.order_index
      }));
      
      return lessons;
    } catch (err) {
      console.error('[bibleStudiesRepository] Unexpected error listing lessons:', err);
      return [];
    }
  },
  
  async getLessonByIndex(studyId: string, index: number): Promise<Lesson | null> {
    try {
      if (!studyId || index === undefined || index === null) return null;
      
      const { data, error } = await supabase
        .from('bible_study_lessons')
        .select('*')
        .eq('study_id', studyId)
        .eq('order_index', index)
        .maybeSingle();
      
      if (error) {
        console.error('[bibleStudiesRepository] Error fetching lesson:', error);
        return null;
      }
      
      if (!data) return null;
      
      // Ensure order_index is a number
      return {
        ...data,
        order_index: typeof data.order_index === 'string' 
          ? parseInt(data.order_index, 10) 
          : data.order_index
      };
    } catch (err) {
      console.error('[bibleStudiesRepository] Unexpected error fetching lesson:', err);
      return null;
    }
  },
  
  async upsertStudy(study: Study): Promise<Study> {
    try {
      if (!study || typeof study !== 'object') {
        throw new Error('Study payload must be a valid object');
      }
      const payload = {
        ...study,
        owner_slug: study.owner_slug || getOwnerSlug(),
        updated_at: new Date().toISOString(),
      };

      // Allow DB default (generated uuid) when creating a new row
      if (!payload.id) {
        delete payload.id;
      }

      const { data, error } = await supabase
        .from('bible_studies')
        .upsert(payload)
        .select('*')
        .maybeSingle();
      
      if (error) {
        console.error('[bibleStudiesRepository] Error upserting study:', error);
        throw new Error(`Failed to save study: ${error.message}`);
      }
      
      return data as Study;
    } catch (err) {
      console.error('[bibleStudiesRepository] Unexpected error upserting study:', err);
      throw err instanceof Error 
        ? err 
        : new Error(`Failed to save study: ${String(err)}`);
    }
  },
  
  async upsertLesson(lesson: Lesson): Promise<Lesson> {
    try {
      if (!lesson || typeof lesson !== 'object') {
        throw new Error('Lesson payload must be a valid object');
      }
      
      if (!lesson.study_id) {
        throw new Error('Lesson must have a study_id');
      }

      // Ensure order_index is a number
      const order_index = typeof lesson.order_index === 'string'
        ? parseInt(lesson.order_index, 10)
        : lesson.order_index;

      if (isNaN(order_index)) {
        throw new Error('Lesson must have a valid order_index');
      }

      // Process prompts if it's a string
      let processedPrompts = lesson.prompts;
      if (typeof lesson.prompts === 'string') {
        try {
          // Try to parse as JSON
          processedPrompts = JSON.parse(lesson.prompts);
        } catch (e) {
          // If not valid JSON, convert to array of text objects
          const promptsString = String(lesson.prompts);
          processedPrompts = promptsString
            .split('\n')
            .map((line: string) => line.trim())
            .filter((line: string) => line)
            .map((text: string) => ({ text }));
        }
      }

      // Process scripture_refs if it's a string
      let processedScriptureRefs = lesson.scripture_refs;
      if (typeof lesson.scripture_refs === 'string') {
        const refsString = String(lesson.scripture_refs);
        processedScriptureRefs = refsString
          .split(',')
          .map((ref: string) => ref.trim())
          .filter((ref: string) => ref);
      }

      const payload = {
        ...lesson,
        order_index,
        prompts: processedPrompts,
        scripture_refs: processedScriptureRefs,
        updated_at: new Date().toISOString(),
      };

      // Allow DB default (generated uuid) when creating a new row
      if (!payload.id) {
        delete payload.id;
      }

      const { data, error } = await supabase
        .from('bible_study_lessons')
        .upsert(payload)
        .select('*')
        .maybeSingle();
      
      if (error) {
        console.error('[bibleStudiesRepository] Error upserting lesson:', error);
        throw new Error(`Failed to save lesson: ${error.message}`);
      }
      
      return data as Lesson;
    } catch (err) {
      console.error('[bibleStudiesRepository] Unexpected error upserting lesson:', err);
      throw err instanceof Error 
        ? err 
        : new Error(`Failed to save lesson: ${String(err)}`);
    }
  },
  
  async saveProgress({ 
    userId, 
    studyId, 
    currentLessonIndex, 
    completedLessons, 
    notes 
  }: {
    userId: string;
    studyId: string;
    currentLessonIndex?: number;
    completedLessons?: number[];
    notes?: Record<string, any>;
  }): Promise<StudyProgress> {
    try {
      if (!userId || !studyId) {
        throw new Error('User ID and Study ID are required');
      }
      
      const payload: Partial<StudyProgress> = {
        user_id: userId,
        study_id: studyId,
        last_activity_at: new Date().toISOString()
      };
      
      if (currentLessonIndex !== undefined) {
        payload.current_lesson_index = currentLessonIndex;
      }
      
      if (completedLessons) {
        payload.completed_lessons = completedLessons;
      }
      
      if (notes) {
        payload.notes = notes;
      }
      
      const { data, error } = await supabase
        .from('user_study_progress')
        .upsert(payload)
        .select('*')
        .maybeSingle();
      
      if (error) {
        console.error('[bibleStudiesRepository] Error saving progress:', error);
        throw new Error(`Failed to save progress: ${error.message}`);
      }
      
      return data as StudyProgress;
    } catch (err) {
      console.error('[bibleStudiesRepository] Unexpected error saving progress:', err);
      throw err instanceof Error 
        ? err 
        : new Error(`Failed to save progress: ${String(err)}`);
    }
  },
  
  async getProgress({ 
    userId, 
    studyId 
  }: {
    userId: string;
    studyId: string;
  }): Promise<StudyProgress | null> {
    try {
      if (!userId || !studyId) return null;
      
      const { data, error } = await supabase
        .from('user_study_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('study_id', studyId)
        .maybeSingle();
      
      if (error) {
        console.error('[bibleStudiesRepository] Error fetching progress:', error);
        return null;
      }
      
      return data as StudyProgress;
    } catch (err) {
      console.error('[bibleStudiesRepository] Unexpected error fetching progress:', err);
      return null;
    }
  },

  /**
   * Permanently delete a Bible study (admin / superadmin only via RLS)
   * @param id - bible_studies.id (uuid)
   * @returns Promise<boolean> true on success, false on failure
   */
  async deleteStudy(id: string): Promise<boolean> {
    try {
      if (!id) throw new Error('Study id required');

      const { error } = await supabase
        .from('bible_studies')
        .delete()
        .eq('id', id);

      if (error) throw new Error(error.message);
      return true;
    } catch (err) {
      console.error('[bibleStudiesRepository] Error deleting study:', err);
      return false;
    }
  },

  /**
   * Permanently delete a lesson (admin / superadmin only via RLS)
   * @param id - bible_study_lessons.id (uuid)
   * @returns Promise<boolean> true on success, false on failure
   */
  async deleteLesson(id: string): Promise<boolean> {
    try {
      if (!id) throw new Error('Lesson id required');

      const { error } = await supabase
        .from('bible_study_lessons')
        .delete()
        .eq('id', id);

      if (error) throw new Error(error.message);
      return true;
    } catch (err) {
      console.error('[bibleStudiesRepository] Error deleting lesson:', err);
      return false;
    }
  }
};

export default bibleStudiesRepository;
