import { supabase, isSupabaseConfigured, ServiceResult } from '../lib/supabase';
import { LearningResource, ResourceType } from '../types';
import { INITIAL_RESOURCES } from '../lib/constants';

const RESOURCES_STORAGE_KEY = 'skilllab_resources_list';

function getStoredResources(): LearningResource[] {
  const saved = localStorage.getItem(RESOURCES_STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fallback
    }
  }
  return INITIAL_RESOURCES;
}

function saveStoredResources(resources: LearningResource[]) {
  localStorage.setItem(RESOURCES_STORAGE_KEY, JSON.stringify(resources));
}

export const resourceService = {
  async getResources(filter?: { category?: string; moduleId?: string; query?: string }): Promise<ServiceResult<LearningResource[]>> {
    let all = getStoredResources();

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('resources')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          all = data as LearningResource[];
        }
      } catch (err: unknown) {
        console.warn('Supabase resources query warning:', err);
      }
    }

    let filtered = [...all];

    if (filter?.category && filter.category !== 'ALL') {
      filtered = filtered.filter(r => r.file_type === filter.category);
    }

    if (filter?.moduleId && filter.moduleId !== 'ALL') {
      filtered = filtered.filter(r => r.module_id === filter.moduleId);
    }

    if (filter?.query && filter.query.trim()) {
      const q = filter.query.toLowerCase().trim();
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.module_title?.toLowerCase().includes(q)
      );
    }

    return { data: filtered, error: null };
  },

  async uploadResource(
    file: { name: string; size: number },
    metadata: {
      title: string;
      description: string;
      file_type: ResourceType;
      module_id?: string;
      module_title?: string;
      author_name?: string;
    }
  ): Promise<ServiceResult<LearningResource>> {
    const fileSizeFormatted = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    const filePath = `resources/${Date.now()}-${file.name.replace(/\s+/g, '_')}`;

    const newResource: LearningResource = {
      id: `res-${Date.now()}`,
      title: metadata.title,
      description: metadata.description,
      file_type: metadata.file_type,
      file_size: fileSizeFormatted,
      file_path: filePath,
      module_id: metadata.module_id,
      module_title: metadata.module_title,
      download_count: 0,
      created_at: new Date().toISOString().split('T')[0],
      author_name: metadata.author_name || 'Skill Lab Faculty',
    };

    // 1. If Supabase is configured, upload binary to Supabase Storage bucket 'resources'
    if (isSupabaseConfigured && supabase) {
      try {
        const { error: storageError } = await supabase.storage
          .from('resources')
          .upload(filePath, file as any);

        if (storageError) {
          console.warn('Supabase storage upload error:', storageError.message);
        }

        const { error: dbError } = await supabase
          .from('resources')
          .insert(newResource);

        if (dbError) {
          console.warn('Supabase db insert error:', dbError.message);
        }
      } catch (err: unknown) {
        console.warn('Supabase upload exception:', err);
      }
    }

    // 2. Add to stored resources
    const current = getStoredResources();
    const updated = [newResource, ...current];
    saveStoredResources(updated);

    return { data: newResource, error: null };
  },

  async deleteResource(resourceId: string): Promise<ServiceResult<boolean>> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('resources').delete().eq('id', resourceId);
      } catch (err: unknown) {
        console.warn('Supabase delete error:', err);
      }
    }

    const current = getStoredResources();
    const updated = current.filter(r => r.id !== resourceId);
    saveStoredResources(updated);

    return { data: true, error: null };
  },

  async downloadResource(resource: LearningResource): Promise<void> {
    // Increment download count locally & in DB
    const current = getStoredResources();
    const updated = current.map(r => r.id === resource.id ? { ...r, download_count: r.download_count + 1 } : r);
    saveStoredResources(updated);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data } = supabase.storage.from('resources').getPublicUrl(resource.file_path);
        if (data?.publicUrl) {
          const link = document.createElement('a');
          link.href = data.publicUrl;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          return;
        }
      } catch {
        // fallback
      }
    }

    // Friendly academic file download simulation with real content blob
    const sampleContent = `# ${resource.title}\n\nSkillLab Educational Resource\nModule: ${resource.module_title || 'General'}\nType: ${resource.file_type}\nSize: ${resource.file_size}\n\n${resource.description}\n\n(c) 2026 SkillLab - Private College Learning Platform\nInstructor Verified`;
    const blob = new Blob([sampleContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const extension = resource.file_type === 'PDF' ? 'pdf' : resource.file_type === 'ZIP' ? 'zip' : resource.file_type === 'CODE' ? 'ts' : 'txt';
    link.download = `${resource.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
