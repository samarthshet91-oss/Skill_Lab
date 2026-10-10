
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import {
  User,
  Mail,
  Camera,
  Check,
  Edit2,
  Lock,
  AlertCircle,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

const ADMIN_AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=240&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=240&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=240&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=240&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=240&auto=format&fit=crop&q=80',
];

export function AdminProfilePage() {
  const { user, updateProfile } = useAuth();

  // Form state
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState(
    user?.avatar_url || ADMIN_AVATAR_PRESETS[0]
  );

  // UI state
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Avatar picker state
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(
    user?.avatar_url || ADMIN_AVATAR_PRESETS[0]
  );

  // Synchronize with the authenticated user
  useEffect(() => {
    if (user) {
      const currentAvatar =
        user.avatar_url || ADMIN_AVATAR_PRESETS[0];

      setFullName(user.full_name || '');
      setAvatarUrl(currentAvatar);
      setSelectedAvatar(currentAvatar);
    }
  }, [user]);

  const handleOpenAvatarModal = () => {
    setSelectedAvatar(avatarUrl);
    setShowAvatarModal(true);
  };

  const handleSelectAvatarPreset = (url: string) => {
    setSelectedAvatar(url);
  };

  const handleConfirmAvatar = async () => {
    setIsSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    const res = await updateProfile({
      avatar_url: selectedAvatar,
    });

    setIsSaving(false);

    if (res.success) {
      setAvatarUrl(selectedAvatar);
      setShowAvatarModal(false);
      setSuccessMessage('Avatar updated successfully.');

      setTimeout(() => setSuccessMessage(''), 4000);
    } else {
      setErrorMessage(
        res.error || 'Failed to update avatar.'
      );
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      setFullName(user.full_name || '');
      setAvatarUrl(
        user.avatar_url || ADMIN_AVATAR_PRESETS[0]
      );
    }

    setErrorMessage('');
    setIsEditing(false);
  };

  const handleSaveProfile = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setErrorMessage('');
    setSuccessMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Administrator name is required.');
      return;
    }

    setIsSaving(true);

    const res = await updateProfile({
      full_name: fullName.trim(),
      avatar_url: avatarUrl,
    });

    setIsSaving(false);

    if (res.success) {
      setIsEditing(false);
      setSuccessMessage(
        'Administrator profile updated successfully.'
      );

      setTimeout(() => setSuccessMessage(''), 4000);
    } else {
      setErrorMessage(
        res.error ||
          'Failed to update administrator profile.'
      );
    }
  };

  const activeAvatar =
    avatarUrl || ADMIN_AVATAR_PRESETS[0];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Success notification */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-sm animate-in fade-in duration-200">
          <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error notification */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Admin Profile Card */}
      <Card className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8 border-b border-slate-100">
          {/* Avatar and identity */}
          <div className="flex items-center gap-5">
            <div className="relative group shrink-0">
              <img
                src={activeAvatar}
                alt={user?.full_name || 'Admin Avatar'}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-indigo-100 shadow-sm bg-slate-50"
              />

              <button
                type="button"
                onClick={handleOpenAvatarModal}
                className="absolute inset-0 bg-slate-950/40 text-white rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-xs"
                title="Change Avatar"
              >
                <Camera className="w-6 h-6 mb-1 text-white" />
                <span className="text-[11px] font-semibold">
                  Change
                </span>
              </button>

              <button
                type="button"
                onClick={handleOpenAvatarModal}
                className="absolute -bottom-2 -right-2 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md border-2 border-white transition-transform active:scale-95 cursor-pointer"
                title="Change Avatar"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {user?.full_name || 'Administrator'}
                </h1>

                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin
                </span>
              </div>

              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {user?.email}
              </p>

              <div className="mt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleOpenAvatarModal}
                  className="text-xs h-8 px-3 flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5 text-indigo-600" />
                  Choose Avatar
                </Button>
              </div>
            </div>
          </div>

          {/* Edit profile action */}
          {!isEditing && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 self-start sm:self-center"
            >
              <Edit2 className="w-3.5 h-3.5 text-slate-600" />
              Edit Profile
            </Button>
          )}
        </div>

        {/* Profile information form */}
        <form
          id="admin-profile-form"
          onSubmit={handleSaveProfile}
          className="mt-8 space-y-5"
        >
          {/* Administrator name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-600" />
              Administrator Name
            </label>

            {isEditing ? (
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                required
              />
            ) : (
              <div className="px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/80 rounded-xl text-sm font-semibold text-slate-900">
                {user?.full_name || '—'}
              </div>
            )}
          </div>

          {/* Read-only administrator email */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-600" />
                Administrator Email
              </label>

              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" />
                Authenticated Login Email
              </span>
            </div>

            <div className="px-3.5 py-2.5 bg-slate-100/80 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 flex items-center justify-between gap-3">
              <span className="break-all">
                {user?.email || '—'}
              </span>

              <span className="shrink-0 text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                Primary Admin
              </span>
            </div>

            <p className="text-[11px] text-slate-400 pl-0.5">
              This email is associated with your authenticated
              Supabase session.
            </p>
          </div>

          {/* Form actions */}
          {isEditing && (
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={handleCancelEdit}
                disabled={isSaving}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                {isSaving ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          )}
        </form>
      </Card>

      {/* Avatar picker modal */}
      <Modal
        isOpen={showAvatarModal}
        onClose={() => {
          if (!isSaving) {
            setShowAvatarModal(false);
          }
        }}
        title="Choose Administrator Avatar"
      >
        <div className="space-y-5">
          <p className="text-xs text-slate-500">
            Select an avatar from the collection below.
          </p>

          {/* Selected avatar preview */}
          <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <img
              src={selectedAvatar}
              alt="Selected avatar preview"
              className="w-16 h-16 rounded-xl object-cover border-2 border-indigo-600 shadow-xs"
            />

            <div>
              <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Selected Preview
              </p>

              <p className="text-[11px] text-slate-500 mt-0.5">
                This avatar will appear on your admin navigation
                and profile.
              </p>
            </div>
          </div>

          {/* Preset avatar grid */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Preset Avatars
            </label>

            <div className="grid grid-cols-4 gap-2.5">
              {ADMIN_AVATAR_PRESETS.map((preset, idx) => {
                const isSelected = selectedAvatar === preset;

                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleSelectAvatarPreset(preset)}
                    aria-label={`Select avatar ${idx + 1}`}
                    aria-pressed={isSelected}
                    className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all p-0.5 cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 ring-2 ring-indigo-200 scale-95'
                        : 'border-slate-200 hover:border-slate-300 hover:scale-105'
                    }`}
                  >
                    <img
                      src={preset}
                      alt={`Preset avatar ${idx + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />

                    {isSelected && (
                      <div className="absolute inset-0 bg-indigo-600/30 flex items-center justify-center">
                        <div className="w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-xs">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Modal actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAvatarModal(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleConfirmAvatar}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Set as Avatar'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}