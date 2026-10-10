import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import {
  User,
  Mail,
  Phone,
  Hash,
  Camera,
  Check,
  Edit2,
  Lock,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

const AVATAR_PRESETS = [
  '/avatars/spiderman.jpeg',
  '/avatars/suniyo.jpeg',
  '/avatars/shizuka.jpeg',
  '/avatars/gian.jpeg',
  '/avatars/doremon.jpeg',
  '/avatars/doremi.jpeg',
  '/avatars/nobita.jpeg',
  '/avatars/jerry.jpeg',
  '/avatars/sinchan.jpeg',
  '/avatars/mini.jpeg',
  '/avatars/Mr.Bean.jpeg',
  '/avatars/powerpuff_girls.jpeg',
];

export function StudentProfilePage() {
  const { user, updateProfile } = useAuth();

  // Form states for editable fields
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [usn, setUsn] = useState(user?.student_number || '');
  const [mobileNumber, setMobileNumber] = useState(user?.mobile_number || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || AVATAR_PRESETS[0]);

  // UI state
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Avatar picker modal state
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar_url || AVATAR_PRESETS[0]);


  // Sync state whenever authenticated user changes
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setUsn(user.student_number || '');
      setMobileNumber(user.mobile_number || '');
      setAvatarUrl(user.avatar_url || AVATAR_PRESETS[0]);
      setSelectedAvatar(user.avatar_url || AVATAR_PRESETS[0]);
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
    setAvatarUrl(selectedAvatar);
    setShowAvatarModal(false);

    // Save avatar immediately to user profile
    setIsSaving(true);
    setErrorMessage('');
    const res = await updateProfile({ avatar_url: selectedAvatar });
    setIsSaving(false);

    if (res.success) {
      setSuccessMessage('Avatar updated successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } else {
      setErrorMessage(res.error || 'Failed to update avatar.');
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      setFullName(user.full_name || '');
      setUsn(user.student_number || '');
      setMobileNumber(user.mobile_number || '');
      setAvatarUrl(user.avatar_url || AVATAR_PRESETS[0]);
    }
    setErrorMessage('');
    setIsEditing(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Student Name is required.');
      return;
    }

    setIsSaving(true);
    const res = await updateProfile({
      full_name: fullName.trim(),
      student_number: usn.trim(),
      mobile_number: mobileNumber.trim(),
      avatar_url: avatarUrl,
    });
    setIsSaving(false);

    if (res.success) {
      setIsEditing(false);
      setSuccessMessage('Profile information saved successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } else {
      setErrorMessage(res.error || 'Failed to update profile. Please try again.');
    }
  };

  const activeAvatar = avatarUrl || AVATAR_PRESETS[0];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Messages */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-sm animate-in fade-in duration-200">
          <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Student Profile Card */}
      <Card className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8 border-b border-slate-100">
          {/* Avatar Section */}
          <div className="flex items-center gap-5">
            <div className="relative group shrink-0">
              <img
                src={activeAvatar}
                alt={user?.full_name || 'Student Avatar'}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-indigo-100 shadow-sm bg-slate-50"
              />
              <button
                type="button"
                onClick={handleOpenAvatarModal}
                className="absolute inset-0 bg-slate-950/40 text-white rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-xs"
                title="Change Avatar"
              >
                <Camera className="w-6 h-6 mb-1 text-white" />
                <span className="text-[11px] font-semibold">Change</span>
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
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {user?.full_name || 'Student Account'}
                </h1>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {user?.student_number ? `USN: ${user.student_number}` : 'SkillLab Student'}
              </p>
              <div className="mt-3">
                <Button
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

          {/* Action button */}
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 self-start sm:self-center"
            >
              <Edit2 className="w-3.5 h-3.5 text-slate-600" />
              Edit Information
            </Button>
          ) : (
            <div className="flex items-center gap-2 self-start sm:self-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelEdit}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="flex items-center gap-1.5"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>

        {/* Profile Information List / Form */}
        <form onSubmit={handleSaveProfile} className="mt-8 space-y-5">
          {/* 1. Student Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-600" />
              Student Name
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

          {/* 2. USN */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-indigo-600" />
              USN / Student ID
            </label>
            {isEditing ? (
              <input
                type="text"
                value={usn}
                onChange={(e) => setUsn(e.target.value)}
                placeholder="e.g. 1MS21CS001"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-mono font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors uppercase"
              />
            ) : (
              <div className="px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/80 rounded-xl text-sm font-mono font-semibold text-slate-900">
                {user?.student_number || 'Not provided'}
              </div>
            )}
          </div>

          {/* 3. Mobile Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-indigo-600" />
              Mobile Number
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            ) : (
              <div className="px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/80 rounded-xl text-sm font-medium text-slate-900">
                {user?.mobile_number || 'Not provided'}
              </div>
            )}
          </div>

          {/* 4. Registered Email (Read-only, authenticated email) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-600" />
                Registered Email
              </label>
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" />
                Verified login email
              </span>
            </div>
            <div className="px-3.5 py-2.5 bg-slate-100/80 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 flex items-center justify-between">
              <span>{user?.email || '—'}</span>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                Primary
              </span>
            </div>
            <p className="text-[11px] text-slate-400 pl-0.5">
              Email is tied to your login credentials and cannot be edited directly here.
            </p>
          </div>

          {/* Form Actions for edit mode */}
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

      {/* Avatar Picker Modal */}
      <Modal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        title="Choose Your Avatar"
      >
        <div className="space-y-5">
          <p className="text-xs text-slate-500">
            Select an avatar preset below.
          </p>

          {/* Selected Preview */}
          <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <img
              src={selectedAvatar}
              alt="Preview"
              className="w-16 h-16 rounded-xl object-cover border-2 border-indigo-600 shadow-xs"
            />
            <div>
              <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Selected Preview
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                This avatar will be displayed on your profile and dashboard.
              </p>
            </div>
          </div>

          {/* Presets Grid */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Preset Avatars
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
              {AVATAR_PRESETS.map((preset, idx) => {
                const isSelected = selectedAvatar === preset;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectAvatarPreset(preset)}
                    className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all p-0.5 cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 ring-2 ring-indigo-200 scale-95'
                        : 'border-slate-200 hover:border-slate-300 hover:scale-105'
                    }`}
                  >
                    <img
                      src={preset}
                      alt={`Preset ${idx + 1}`}
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


          {/* Modal Actions */}
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
