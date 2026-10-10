import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { resourceService } from '../../../services/resourceService';
import { LearningResource, ResourceType } from '../../../types';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import { Modal } from '../../../components/common/Modal';
import {
  FolderArchive,
  Search,
  Upload,
  Download,
  Trash2,
  FileText,
  FileCode,
  FileSpreadsheet,
  FileArchive,
  File,
  Filter,
  CheckCircle2,
  CloudUpload
} from 'lucide-react';
import { useToast } from '../../../context/ToastContext';

export function ResourcesPage() {
  const { role } = useAuth();
  const isAdmin = role === 'ADMIN';

  const [resources, setResources] = useState<LearningResource[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const [resourceToDelete, setResourceToDelete] = useState<LearningResource | null>(null);

  // Upload modal form states
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newType, setNewType] = useState<ResourceType>('PDF');
  const [newModuleTitle, setNewModuleTitle] = useState('4. APIs & JSON');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { showToast } = useToast();

  const loadResources = async () => {
    const res = await resourceService.getResources({
      category: selectedCategory,
      query: searchQuery,
    });
    if (res.data) {
      setResources(res.data);
    }
  };

  useEffect(() => {
    loadResources();
  }, [selectedCategory, searchQuery]);

  const handleDownload = async (resource: LearningResource) => {
    setDownloadingId(resource.id);
    await resourceService.downloadResource(resource);
    setDownloadingId(null);
    showToast('Download Started', `Downloaded "${resource.title}" (${resource.file_size})`, 'success');
    loadResources();
  };

  const handleDelete = (resource: LearningResource) => {
    setResourceToDelete(resource);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) {
      showToast('Validation Error', 'Title and description are required', 'error');
      return;
    }

    setUploading(true);

    // If no real file selected in browser, prepare a safe file descriptor
    const fallbackExtension = newType === 'PDF' ? 'pdf' : newType === 'ZIP' ? 'zip' : 'ts';
    const fileToUpload = selectedFile || {
      name: `${newTitle.toLowerCase().replace(/\s+/g, '-')}.${fallbackExtension}`,
      size: 245000,
    };

    const { data, error } = await resourceService.uploadResource(fileToUpload, {
      title: newTitle,
      description: newDescription,
      file_type: newType,
      module_title: newModuleTitle,
      author_name: 'SkillLab Faculty',
    });

    setUploading(false);

    if (error || !data) {
      showToast('Upload Error', error || 'Failed to upload file', 'error');
    } else {
      showToast('Resource Uploaded', `Successfully added to repository.`, 'success');
      setIsUploadModalOpen(false);
      setNewTitle('');
      setNewDescription('');
      setSelectedFile(null);
      loadResources();
    }
  };

  const getFileIcon = (type: ResourceType) => {
    switch (type) {
      case 'PDF':
        return <FileText className="w-5 h-5 text-rose-600" />;
      case 'CODE':
        return <FileCode className="w-5 h-5 text-indigo-600" />;
      case 'ZIP':
        return <FileArchive className="w-5 h-5 text-amber-600" />;
      case 'CHEATSHEET':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
      case 'NOTES':
      default:
        return <File className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100 mb-2">
            <FolderArchive className="w-3.5 h-3.5" />
            Supabase Storage Learning Repository
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Learning Resources Hub</h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Download verified code templates, visual architecture diagrams, cheatsheets, and lecture notes directly synchronized with the curriculum.
          </p>
        </div>

        {isAdmin && (
          <Button
            variant="primary"
            onClick={() => setIsUploadModalOpen(true)}
            icon={<Upload className="w-4 h-4" />}
            className="rounded-xl shadow-xs"
          >
            Upload New Resource
          </Button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search 20 resources, titles, topics..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['ALL', 'PDF', 'CODE', 'ZIP', 'CHEATSHEET', 'NOTES'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'ALL' ? 'All Files (20)' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map(res => (
          <Card key={res.id} className="flex flex-col justify-between p-5 hover:border-indigo-200 transition-all">
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 shrink-0">
                  {getFileIcon(res.file_type)}
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge variant="default" size="sm">
                    {res.file_type}
                  </Badge>
                  <span className="text-[11px] font-mono text-slate-400">{res.file_size}</span>
                </div>
              </div>

              <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">{res.title}</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{res.description}</p>

              {res.module_title && (
                <div className="mt-3 px-2 py-1 rounded bg-slate-50 border border-slate-100 text-[11px] text-slate-600 font-medium truncate">
                  {res.module_title}
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">
                {res.download_count} downloads
              </span>

              <div className="flex items-center gap-1.5">
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(res)}
                    title="Delete Resource"
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  loading={downloadingId === res.id}
                  onClick={() => handleDownload(res)}
                  className="text-xs text-indigo-700 hover:bg-indigo-50 border-indigo-200 font-semibold"
                  icon={<Download className="w-3.5 h-3.5" />}
                >
                  Download
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {resources.length === 0 && (
        <Card className="p-12 text-center text-xs text-slate-500">
          No resources found matching your search criteria.
        </Card>
      )}

      {/* Admin Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Learning Resource"
        subtitle="Upload file to Supabase Storage and register in the SkillLab catalog"
        maxWidth="md"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Resource Title</label>
            <input
              type="text"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="e.g. Supabase RLS Security Policy Templates"
              required
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
            <textarea
              value={newDescription}
              onChange={e => setNewDescription(e.target.value)}
              rows={2}
              placeholder="Brief summary of what students will learn from this file..."
              required
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Resource Type</label>
              <select
                value={newType}
                onChange={e => setNewType(e.target.value as ResourceType)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="PDF">PDF Document</option>
                <option value="CODE">Source Code (.ts/.zip)</option>
                <option value="ZIP">ZIP Archive</option>
                <option value="CHEATSHEET">Cheatsheet</option>
                <option value="NOTES">Course Notes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Associated Module</label>
              <select
                value={newModuleTitle}
                onChange={e => setNewModuleTitle(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="1. Modern Development Foundation">1. Modern Development Foundation</option>
                <option value="2. Git & GitHub">2. Git & GitHub</option>
                <option value="3. Project Creation">3. Project Creation</option>
                <option value="4. APIs & JSON">4. APIs & JSON</option>
                <option value="5. Databases">5. Databases</option>
                <option value="6. AI Development">6. AI Development</option>
                <option value="7. RAG & AI Applications">7. RAG & AI Applications</option>
                <option value="8. Final Project">8. Final Project</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">File Attachment</label>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-indigo-400 transition-colors bg-slate-50/50">
              <CloudUpload className="w-7 h-7 text-indigo-500 mx-auto mb-1.5" />
              <input
                type="file"
                id="file-upload"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer block"
              >
                {selectedFile ? selectedFile.name : 'Choose a file or click to browse'}
              </label>
              <p className="text-[10px] text-slate-400 mt-1">PDF, ZIP, TS, MD up to 10 MB</p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={uploading}>
              Save and Upload
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      {resourceToDelete && (
        <Modal
          isOpen={Boolean(resourceToDelete)}
          onClose={() => setResourceToDelete(null)}
          title="Remove Learning Resource"
          maxWidth="sm"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Are you sure you want to remove <strong className="text-slate-900">{resourceToDelete.title}</strong> from the student repository?
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setResourceToDelete(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={async () => {
                  const target = resourceToDelete;
                  setResourceToDelete(null);
                  const { error } = await resourceService.deleteResource(target.id);
                  if (!error) {
                    showToast('Resource Deleted', 'The resource was removed from the library.', 'info');
                    loadResources();
                  }
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
