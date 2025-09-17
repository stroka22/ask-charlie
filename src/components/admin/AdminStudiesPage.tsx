import React, { useState, useEffect, useRef } from 'react';
import { bibleStudiesRepository } from '../../repositories/bibleStudiesRepository';
import type { Study, Lesson } from '../../repositories/bibleStudiesRepository';
import { getOwnerSlug } from '../../services/tierSettingsService';
import { characterRepository } from '../../repositories/characterRepository';
import type { Character } from '../../services/supabase';

interface AdminStudiesPageProps {
  embedded?: boolean;
}

// Local form type that uses strings for easier form handling
type LessonForm = {
  id?: string;
  order_index: number;
  title: string;
  scripture_refs: string;
  summary: string;
  prompts: string;
};

const AdminStudiesPage: React.FC<AdminStudiesPageProps> = () => {
  // State for studies and lessons
  const [studies, setStudies] = useState<Study[]>([]);
  const [selectedStudy, setSelectedStudy] = useState<Study | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state for study
  const [studyForm, setStudyForm] = useState<Partial<Study>>({
    title: '',
    description: '',
    cover_image_url: '',
    character_id: '',
    visibility: 'public',
    is_premium: false,
    subject: '',
    character_instructions: ''
  });

  // Form state for lesson with string-based fields
  const [lessonForm, setLessonForm] = useState<LessonForm>({
    order_index: 0,
    title: '',
    scripture_refs: '',
    summary: '',
    prompts: ''
  });

  // Refs for file inputs
  const studiesFileInputRef = useRef<HTMLInputElement>(null);
  const lessonsFileInputRef = useRef<HTMLInputElement>(null);

  // Editing state
  const [editingStudyId, setEditingStudyId] = useState<string | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);

  // Load studies on component mount
  useEffect(() => {
    fetchStudies();
    fetchCharacters();
  }, []);

  // Load lessons when a study is selected
  useEffect(() => {
    if (selectedStudy) {
      fetchLessons(selectedStudy.id!);
    } else {
      setLessons([]);
    }
  }, [selectedStudy]);

  // Fetch all studies
  const fetchStudies = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const ownerSlug = getOwnerSlug();
      const fetchedStudies = await bibleStudiesRepository.listStudies({ 
        ownerSlug, 
        includePrivate: true 
      });
      setStudies(fetchedStudies);
    } catch (err) {
      console.error('Error fetching studies:', err);
      setError('Failed to load studies. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch characters for dropdown
  const fetchCharacters = async () => {
    try {
      const fetchedCharacters = await characterRepository.getAll(true);
      setCharacters(fetchedCharacters);
    } catch (err) {
      console.error('Error fetching characters:', err);
    }
  };

  // Fetch lessons for a study
  const fetchLessons = async (studyId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedLessons = await bibleStudiesRepository.listLessons(studyId);
      setLessons(fetchedLessons);
    } catch (err) {
      console.error('Error fetching lessons:', err);
      setError('Failed to load lessons. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle study form input changes
  const handleStudyInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setStudyForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setStudyForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle lesson form input changes
  const handleLessonInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'order_index') {
      setLessonForm(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      // All other fields are stored as strings
      setLessonForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Reset study form
  const resetStudyForm = () => {
    setStudyForm({
      title: '',
      description: '',
      cover_image_url: '',
      character_id: '',
      visibility: 'public',
      is_premium: false,
      subject: '',
      character_instructions: ''
    });
    setEditingStudyId(null);
  };

  // Reset lesson form
  const resetLessonForm = () => {
    setLessonForm({
      order_index: lessons.length,
      title: '',
      scripture_refs: '',
      summary: '',
      prompts: ''
    });
    setEditingLessonId(null);
  };

  // Handle study form submission
  const handleStudySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Prepare study data
      const studyData: Study = {
        ...studyForm,
        owner_slug: getOwnerSlug()
      } as Study;
      
      if (editingStudyId) {
        studyData.id = editingStudyId;
      }
      
      // Save study
      const savedStudy = await bibleStudiesRepository.upsertStudy(studyData);
      
      // Update UI
      if (editingStudyId) {
        setStudies(prev => prev.map(s => s.id === editingStudyId ? savedStudy : s));
        setSuccessMessage('Study updated successfully!');
      } else {
        setStudies(prev => [...prev, savedStudy]);
        setSuccessMessage('Study created successfully!');
      }
      
      // Reset form
      resetStudyForm();
      
      // Refresh studies
      fetchStudies();
    } catch (err) {
      console.error('Error saving study:', err);
      setError(err instanceof Error ? err.message : 'Failed to save study.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle lesson form submission
  const handleLessonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudy) {
      setError('Please select a study first.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Convert form strings to proper types for the API
      const scriptureRefs = lessonForm.scripture_refs
        .split(',')
        .map(ref => ref.trim())
        .filter(ref => ref);
      
      // Process prompts
      let processedPrompts;
      try {
        // Try to parse as JSON
        processedPrompts = JSON.parse(lessonForm.prompts);
      } catch (e) {
        // If not valid JSON, convert to array of text objects
        processedPrompts = lessonForm.prompts
          .split('\n')
          .map(line => line.trim())
          .filter(line => line)
          .map(text => ({ text }));
      }
      
      // Prepare lesson data
      const lessonData: Lesson = {
        study_id: selectedStudy.id!,
        order_index: lessonForm.order_index,
        title: lessonForm.title,
        summary: lessonForm.summary,
        scripture_refs: scriptureRefs,
        prompts: processedPrompts
      };
      
      if (editingLessonId) {
        lessonData.id = editingLessonId;
      }
      
      // Save lesson
      const savedLesson = await bibleStudiesRepository.upsertLesson(lessonData);
      
      // Update UI
      if (editingLessonId) {
        setLessons(prev => prev.map(l => l.id === editingLessonId ? savedLesson : l));
        setSuccessMessage('Lesson updated successfully!');
      } else {
        setLessons(prev => [...prev, savedLesson]);
        setSuccessMessage('Lesson created successfully!');
      }
      
      // Reset form
      resetLessonForm();
      
      // Refresh lessons
      fetchLessons(selectedStudy.id!);
    } catch (err) {
      console.error('Error saving lesson:', err);
      setError(err instanceof Error ? err.message : 'Failed to save lesson.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle editing a study
  const handleEditStudy = (study: Study) => {
    setStudyForm({
      title: study.title || '',
      description: study.description || '',
      cover_image_url: study.cover_image_url || '',
      character_id: study.character_id || '',
      visibility: study.visibility || 'public',
      is_premium: study.is_premium || false,
      subject: study.subject || '',
      character_instructions: study.character_instructions || ''
    });
    setEditingStudyId(study.id!);
    
    // Scroll to form
    document.getElementById('studyForm')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle editing a lesson
  const handleEditLesson = (lesson: Lesson) => {
    // Convert prompts to string if it's an array
    let promptsStr = '';
    if (Array.isArray(lesson.prompts)) {
      if (lesson.prompts.length > 0 && typeof lesson.prompts[0] === 'object' && 'text' in lesson.prompts[0]) {
        promptsStr = lesson.prompts.map(p => (p as { text: string }).text).join('\n');
      } else {
        promptsStr = lesson.prompts.join('\n');
      }
    } else if (typeof lesson.prompts === 'string') {
      promptsStr = lesson.prompts;
    }
    
    // Convert scripture_refs to string if it's an array
    const scriptureRefsStr = Array.isArray(lesson.scripture_refs) 
      ? lesson.scripture_refs.join(', ') 
      : (lesson.scripture_refs || '');
    
    setLessonForm({
      id: lesson.id,
      order_index: lesson.order_index,
      title: lesson.title || '',
      scripture_refs: scriptureRefsStr,
      summary: lesson.summary || '',
      prompts: promptsStr
    });
    setEditingLessonId(lesson.id!);
    
    // Scroll to form
    document.getElementById('lessonForm')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle deleting a study
  const handleDeleteStudy = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this study? This will also delete all associated lessons.')) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const success = await bibleStudiesRepository.deleteStudy(id);
      
      if (success) {
        setStudies(prev => prev.filter(s => s.id !== id));
        
        // If the deleted study was selected, clear selection
        if (selectedStudy && selectedStudy.id === id) {
          setSelectedStudy(null);
        }
        
        setSuccessMessage('Study deleted successfully!');
      } else {
        setError('Failed to delete study.');
      }
    } catch (err) {
      console.error('Error deleting study:', err);
      setError('An error occurred while deleting the study.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle deleting a lesson
  const handleDeleteLesson = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const success = await bibleStudiesRepository.deleteLesson(id);
      
      if (success) {
        setLessons(prev => prev.filter(l => l.id !== id));
        setSuccessMessage('Lesson deleted successfully!');
      } else {
        setError('Failed to delete lesson.');
      }
    } catch (err) {
      console.error('Error deleting lesson:', err);
      setError('An error occurred while deleting the lesson.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle importing studies CSV
  const handleImportStudiesCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const text = await file.text();
      const lines = text.trim().split('\n');
      
      if (lines.length < 2) {
        throw new Error('CSV file must contain a header row and at least one data row.');
      }
      
      const headers = lines[0].split(',').map(h => h.trim());
      const requiredHeaders = ['title'];
      
      // Check for required headers
      for (const required of requiredHeaders) {
        if (!headers.includes(required)) {
          throw new Error(`CSV file must contain a '${required}' column.`);
        }
      }
      
      // Parse data rows
      const studies: Partial<Study>[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        
        if (values.length !== headers.length) {
          console.warn(`Skipping row ${i + 1}: column count mismatch`);
          continue;
        }
        
        const study: Partial<Study> = {
          owner_slug: getOwnerSlug()
        };
        
        headers.forEach((header, index) => {
          const value = values[index];
          
          switch (header) {
            case 'title':
              study.title = value;
              break;
            case 'description':
              study.description = value;
              break;
            case 'cover_image_url':
              study.cover_image_url = value;
              break;
            case 'character_id':
              study.character_id = value;
              break;
            case 'visibility':
              study.visibility = value === 'private' ? 'private' : 'public';
              break;
            case 'is_premium':
              study.is_premium = value.toLowerCase() === 'true';
              break;
            case 'subject':
              study.subject = value;
              break;
            case 'character_instructions':
              study.character_instructions = value;
              break;
            case 'owner_slug':
              // Override owner_slug if provided
              if (value) study.owner_slug = value;
              break;
          }
        });
        
        // Validate required fields
        if (!study.title) {
          console.warn(`Skipping row ${i + 1}: missing title`);
          continue;
        }
        
        studies.push(study);
      }
      
      // Save studies
      if (studies.length === 0) {
        throw new Error('No valid studies found in CSV file.');
      }
      
      let savedCount = 0;
      for (const study of studies) {
        await bibleStudiesRepository.upsertStudy(study as Study);
        savedCount++;
      }
      
      // Refresh studies
      fetchStudies();
      
      setSuccessMessage(`Successfully imported ${savedCount} studies.`);
      
      // Reset file input
      if (studiesFileInputRef.current) {
        studiesFileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Error importing studies:', err);
      setError(err instanceof Error ? err.message : 'Failed to import studies.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle importing lessons CSV
  const handleImportLessonsCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!selectedStudy) {
      setError('Please select a study first.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const text = await file.text();
      const lines = text.trim().split('\n');
      
      if (lines.length < 2) {
        throw new Error('CSV file must contain a header row and at least one data row.');
      }
      
      const headers = lines[0].split(',').map(h => h.trim());
      const requiredHeaders = ['title', 'order_index'];
      
      // Check for required headers
      for (const required of requiredHeaders) {
        if (!headers.includes(required)) {
          throw new Error(`CSV file must contain a '${required}' column.`);
        }
      }
      
      // Parse data rows
      const lessons: Partial<Lesson>[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        
        if (values.length !== headers.length) {
          console.warn(`Skipping row ${i + 1}: column count mismatch`);
          continue;
        }
        
        const lesson: Partial<Lesson> = {
          study_id: selectedStudy.id
        };
        
        headers.forEach((header, index) => {
          const value = values[index];
          
          switch (header) {
            case 'title':
              lesson.title = value;
              break;
            case 'order_index':
              lesson.order_index = parseInt(value) || 0;
              break;
            case 'scripture_refs':
              lesson.scripture_refs = value.split(';').map(ref => ref.trim()).filter(ref => ref);
              break;
            case 'summary':
              lesson.summary = value;
              break;
            case 'prompts':
              lesson.prompts = value.split(';').map(prompt => prompt.trim()).filter(prompt => prompt);
              break;
            case 'study_id':
              // Override study_id if provided
              if (value) lesson.study_id = value;
              break;
          }
        });
        
        // Validate required fields
        if (!lesson.title || lesson.order_index === undefined) {
          console.warn(`Skipping row ${i + 1}: missing required fields`);
          continue;
        }
        
        lessons.push(lesson);
      }
      
      // Save lessons
      if (lessons.length === 0) {
        throw new Error('No valid lessons found in CSV file.');
      }
      
      let savedCount = 0;
      for (const lesson of lessons) {
        await bibleStudiesRepository.upsertLesson(lesson as Lesson);
        savedCount++;
      }
      
      // Refresh lessons
      fetchLessons(selectedStudy.id!);
      
      setSuccessMessage(`Successfully imported ${savedCount} lessons.`);
      
      // Reset file input
      if (lessonsFileInputRef.current) {
        lessonsFileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Error importing lessons:', err);
      setError(err instanceof Error ? err.message : 'Failed to import lessons.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle exporting studies to CSV
  const handleExportStudiesCSV = () => {
    if (studies.length === 0) {
      setError('No studies to export.');
      return;
    }
    
    try {
      // Define headers
      const headers = [
        'id',
        'owner_slug',
        'title',
        'description',
        'cover_image_url',
        'character_id',
        'visibility',
        'is_premium',
        'subject',
        'character_instructions'
      ];
      
      // Create CSV content
      let csvContent = headers.join(',') + '\n';
      
      studies.forEach(study => {
        const row = [
          study.id || '',
          study.owner_slug || '',
          `"${(study.title || '').replace(/"/g, '""')}"`,
          `"${(study.description || '').replace(/"/g, '""')}"`,
          study.cover_image_url || '',
          study.character_id || '',
          study.visibility || 'public',
          study.is_premium ? 'true' : 'false',
          `"${(study.subject || '').replace(/"/g, '""')}"`,
          `"${(study.character_instructions || '').replace(/"/g, '""')}"`
        ];
        
        csvContent += row.join(',') + '\n';
      });
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'studies.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccessMessage('Studies exported successfully!');
    } catch (err) {
      console.error('Error exporting studies:', err);
      setError('Failed to export studies.');
    }
  };

  // Handle exporting lessons to CSV
  const handleExportLessonsCSV = () => {
    if (!selectedStudy) {
      setError('Please select a study first.');
      return;
    }
    
    if (lessons.length === 0) {
      setError('No lessons to export.');
      return;
    }
    
    try {
      // Define headers
      const headers = [
        'id',
        'study_id',
        'order_index',
        'title',
        'scripture_refs',
        'summary',
        'prompts'
      ];
      
      // Create CSV content
      let csvContent = headers.join(',') + '\n';
      
      lessons.forEach(lesson => {
        // Format scripture_refs as semicolon-separated string
        const scriptureRefs = Array.isArray(lesson.scripture_refs) 
          ? lesson.scripture_refs.join(';') 
          : '';
        
        // Format prompts as semicolon-separated string
        let promptsStr = '';
        if (Array.isArray(lesson.prompts)) {
          if (lesson.prompts.length > 0 && typeof lesson.prompts[0] === 'object' && 'text' in lesson.prompts[0]) {
            promptsStr = lesson.prompts.map(p => (p as { text: string }).text).join(';');
          } else {
            promptsStr = lesson.prompts.join(';');
          }
        }
        
        const row = [
          lesson.id || '',
          lesson.study_id || '',
          lesson.order_index.toString(),
          `"${(lesson.title || '').replace(/"/g, '""')}"`,
          `"${scriptureRefs.replace(/"/g, '""')}"`,
          `"${(lesson.summary || '').replace(/"/g, '""')}"`,
          `"${promptsStr.replace(/"/g, '""')}"`
        ];
        
        csvContent += row.join(',') + '\n';
      });
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `lessons_${selectedStudy.id}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccessMessage('Lessons exported successfully!');
    } catch (err) {
      console.error('Error exporting lessons:', err);
      setError('Failed to export lessons.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Messages */}
      {isLoading && (
        <div className="p-3 bg-blue-100 text-blue-700 rounded">
          Loading...
        </div>
      )}
      
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}
      
      {successMessage && (
        <div className="p-3 bg-green-100 text-green-700 rounded">
          Success: {successMessage}
        </div>
      )}
      
      {/* Studies Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">Bible Studies</h2>
          
          <div className="flex space-x-2">
            <button
              onClick={handleExportStudiesCSV}
              disabled={studies.length === 0 || isLoading}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 text-sm"
            >
              Export CSV
            </button>
            
            <label className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 text-sm cursor-pointer">
              Import CSV
              <input
                type="file"
                accept=".csv"
                ref={studiesFileInputRef}
                onChange={handleImportStudiesCSV}
                disabled={isLoading}
                className="hidden"
              />
            </label>
          </div>
        </div>
        
        {/* Study Form */}
        <form id="studyForm" onSubmit={handleStudySubmit} className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-xl font-medium text-gray-700 mb-4">
            {editingStudyId ? 'Edit Study' : 'Add New Study'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title*
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={studyForm.title}
                onChange={handleStudyInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
              />
            </div>
            
            <div>
              <label htmlFor="character_id" className="block text-sm font-medium text-gray-700 mb-1">
                Character
              </label>
              <select
                id="character_id"
                name="character_id"
                value={studyForm.character_id}
                onChange={handleStudyInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
              >
                <option value="">None</option>
                {characters.map(character => (
                  <option key={character.id} value={character.id}>
                    {character.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="cover_image_url" className="block text-sm font-medium text-gray-700 mb-1">
                Cover Image URL
              </label>
              <input
                type="url"
                id="cover_image_url"
                name="cover_image_url"
                value={studyForm.cover_image_url}
                onChange={handleStudyInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
              />
            </div>
            
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={studyForm.subject}
                onChange={handleStudyInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
              />
            </div>
            
            <div>
              <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 mb-1">
                Visibility
              </label>
              <select
                id="visibility"
                name="visibility"
                value={studyForm.visibility}
                onChange={handleStudyInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_premium"
                name="is_premium"
                checked={studyForm.is_premium}
                onChange={handleStudyInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="is_premium" className="ml-2 block text-sm font-medium text-gray-700">
                Premium Content
              </label>
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={studyForm.description}
              onChange={handleStudyInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
            ></textarea>
          </div>
          
          <div className="mb-4">
            <label htmlFor="character_instructions" className="block text-sm font-medium text-gray-700 mb-1">
              Character Instructions
            </label>
            <textarea
              id="character_instructions"
              name="character_instructions"
              rows={3}
              value={studyForm.character_instructions}
              onChange={handleStudyInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
            ></textarea>
          </div>
          
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isLoading ? 'Saving...' : editingStudyId ? 'Update Study' : 'Add Study'}
            </button>
            
            {editingStudyId && (
              <button
                type="button"
                onClick={resetStudyForm}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
        
        {/* Studies List */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-700">Existing Studies</h3>
          
          {studies.length === 0 ? (
            <p className="text-gray-500 italic">No studies found. Create your first study above.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {studies.map(study => (
                <div 
                  key={study.id} 
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedStudy?.id === study.id 
                      ? 'border-blue-600 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedStudy(study)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-lg font-medium text-gray-800">
                      {study.title}
                      {study.visibility === 'private' && (
                        <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                          Private
                        </span>
                      )}
                      {study.is_premium && (
                        <span className="ml-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">
                          Premium
                        </span>
                      )}
                    </h4>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditStudy(study);
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit Study"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                          <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteStudy(study.id!);
                        }}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Delete Study"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {study.description && (
                    <p className="text-gray-600 text-sm line-clamp-2 mb-2">{study.description}</p>
                  )}
                  
                  {study.subject && (
                    <div className="text-xs text-gray-500 mt-1">
                      Subject: {study.subject}
                    </div>
                  )}
                  
                  {study.character_id && (
                    <div className="text-xs text-gray-500 mt-1">
                      Character: {characters.find(c => c.id === study.character_id)?.name || 'Unknown'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Lessons Section (only shown when a study is selected) */}
      {selectedStudy && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              Lessons for "{selectedStudy.title}"
            </h2>
            
            <div className="flex space-x-2">
              <button
                onClick={handleExportLessonsCSV}
                disabled={lessons.length === 0 || isLoading}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 text-sm"
              >
                Export CSV
              </button>
              
              <label className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 text-sm cursor-pointer">
                Import CSV
                <input
                  type="file"
                  accept=".csv"
                  ref={lessonsFileInputRef}
                  onChange={handleImportLessonsCSV}
                  disabled={isLoading}
                  className="hidden"
                />
              </label>
            </div>
          </div>
          
          {/* Lesson Form */}
          <form id="lessonForm" onSubmit={handleLessonSubmit} className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-xl font-medium text-gray-700 mb-4">
              {editingLessonId ? 'Edit Lesson' : 'Add New Lesson'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title*
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={lessonForm.title}
                  onChange={handleLessonInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
                />
              </div>
              
              <div>
                <label htmlFor="order_index" className="block text-sm font-medium text-gray-700 mb-1">
                  Order Index*
                </label>
                <input
                  type="number"
                  id="order_index"
                  name="order_index"
                  value={lessonForm.order_index}
                  onChange={handleLessonInputChange}
                  required
                  min="0"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
                />
              </div>
              
              <div>
                <label htmlFor="scripture_refs" className="block text-sm font-medium text-gray-700 mb-1">
                  Scripture References (comma-separated)
                </label>
                <input
                  type="text"
                  id="scripture_refs"
                  name="scripture_refs"
                  value={lessonForm.scripture_refs}
                  onChange={handleLessonInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-1">
                Summary
              </label>
              <textarea
                id="summary"
                name="summary"
                rows={3}
                value={lessonForm.summary}
                onChange={handleLessonInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
              ></textarea>
            </div>
            
            <div className="mb-4">
              <label htmlFor="prompts" className="block text-sm font-medium text-gray-700 mb-1">
                Prompts (one per line or JSON)
              </label>
              <textarea
                id="prompts"
                name="prompts"
                rows={5}
                value={lessonForm.prompts}
                onChange={handleLessonInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
              ></textarea>
            </div>
            
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                {isLoading ? 'Saving...' : editingLessonId ? 'Update Lesson' : 'Add Lesson'}
              </button>
              
              {editingLessonId && (
                <button
                  type="button"
                  onClick={resetLessonForm}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
          
          {/* Lessons List */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-700">Existing Lessons</h3>
            
            {lessons.length === 0 ? (
              <p className="text-gray-500 italic">No lessons found. Create your first lesson above.</p>
            ) : (
              <div className="space-y-4">
                {lessons
                  .sort((a, b) => a.order_index - b.order_index)
                  .map(lesson => (
                    <div 
                      key={lesson.id} 
                      className="border rounded-lg p-4 hover:border-blue-300 hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-lg font-medium text-gray-800">
                          {lesson.order_index}. {lesson.title}
                        </h4>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditLesson(lesson)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit Lesson"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                              <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                            </svg>
                          </button>
                          
                          <button
                            onClick={() => handleDeleteLesson(lesson.id!)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Delete Lesson"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      {lesson.summary && (
                        <p className="text-gray-600 text-sm mb-2">{lesson.summary}</p>
                      )}
                      
                      {Array.isArray(lesson.scripture_refs) && lesson.scripture_refs.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          Scripture: {lesson.scripture_refs.join(', ')}
                        </div>
                      )}
                      
                      {Array.isArray(lesson.prompts) && lesson.prompts.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          Prompts: {lesson.prompts.length}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudiesPage;
