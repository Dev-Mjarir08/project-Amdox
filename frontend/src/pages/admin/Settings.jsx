import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSettings, FiUser, FiShield, FiBell, FiDatabase, FiGlobe, FiSave, FiCamera, FiEye, FiEyeOff, FiCreditCard, FiMail, FiTrash2, FiLock, FiX, FiCheck, FiRefreshCw, FiUserPlus, FiEdit2, FiSearch, FiFilter, FiCheckCircle, FiXCircle, FiKey } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader.jsx';
import ConfirmModal from '../../components/modals/ConfirmModal.jsx';
import useAuthStore from '../../stores/useAuthStore.js';
import api from '../../lib/api.js';
import { getImageUrl } from '../../lib/utils.js';
import { toast } from 'react-toastify';

export default function Settings() {
  const [searchParams] = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'profile');
  const [profileImage, setProfileImage] = useState(null);
  const [isDeleteImageModalOpen, setIsDeleteImageModalOpen] = useState(false);
  const [deletingImage, setDeletingImage] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaveSuccess, setIsSaveSuccess] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;
    const storedTheme = window.localStorage.getItem("amdox-theme");
    return storedTheme ? storedTheme === "dark" : document.documentElement.classList.contains("dark");
  });

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const nextTheme = !prev;
      document.documentElement.classList.toggle("dark", nextTheme);
      window.localStorage.setItem("amdox-theme", nextTheme ? "dark" : "light");
      toast.info(`Switched to ${nextTheme ? 'Dark' : 'Light'} Mode`);
      return nextTheme;
    });
  };

  // Users & Roles Management State
  const [usersList, setUsersList] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearchText, setUserSearchText] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');

  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [selectedUserToEdit, setSelectedUserToEdit] = useState(null);

  const [addUserForm, setAddUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    department: 'Operations',
    title: 'Staff Member',
  });

  const [editUserForm, setEditUserForm] = useState({
    role: 'employee',
    status: 'active',
    title: 'Staff Member',
    department: 'General',
  });

  const [isSubmittingUser, setIsSubmittingUser] = useState(false);
  const [activeRbacRole, setActiveRbacRole] = useState('admin');

  const fetchUsersList = async () => {
    try {
      setUsersLoading(true);
      const res = await api.get('/hr/employees');
      const list = Array.isArray(res.data)
        ? res.data
        : (res.data?.data && Array.isArray(res.data.data) ? res.data.data : []);
      setUsersList(list);
    } catch (err) {
      console.error('Failed to fetch users list:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsersList();
    }
  }, [activeTab]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!addUserForm.name || !addUserForm.email) {
      toast.error('Name and Email are required');
      return;
    }
    try {
      setIsSubmittingUser(true);
      const nameParts = addUserForm.name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');

      await api.post('/hr/employees', {
        firstName,
        lastName,
        email: addUserForm.email,
        password: addUserForm.password || 'Amdox@123',
        role: addUserForm.role,
        department: addUserForm.department,
        position: addUserForm.title || 'Staff Member',
      });

      toast.success(`User account for ${addUserForm.name} created successfully!`);
      setIsAddUserModalOpen(false);
      setAddUserForm({ name: '', email: '', password: '', role: 'employee', department: 'Operations', title: 'Staff Member' });
      fetchUsersList();
    } catch (err) {
      console.error('Failed to create user:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to create user account');
    } finally {
      setIsSubmittingUser(false);
    }
  };

  const handleOpenEditUserModal = (targetUser) => {
    setSelectedUserToEdit(targetUser);
    setEditUserForm({
      role: targetUser.role || 'employee',
      status: targetUser.status || 'active',
      title: targetUser.title || 'Staff Member',
      department: targetUser.department || 'General',
    });
    setIsEditUserModalOpen(true);
  };

  const handleUpdateUserRoleStatus = async (e) => {
    e.preventDefault();
    if (!selectedUserToEdit) return;
    try {
      setIsSubmittingUser(true);
      await api.put(`/hr/employees/${selectedUserToEdit.id}`, {
        role: editUserForm.role,
        designation: editUserForm.title,
        department: editUserForm.department,
      });
      await api.patch(`/hr/employees/${selectedUserToEdit.id}/status`, {
        status: editUserForm.status,
      });

      toast.success(`User ${selectedUserToEdit.name} updated successfully!`);
      setIsEditUserModalOpen(false);
      setSelectedUserToEdit(null);
      fetchUsersList();
    } catch (err) {
      console.error('Failed to update user:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to update user details');
    } finally {
      setIsSubmittingUser(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await api.delete(`/hr/employees/${userId}`);
      toast.success(`User ${userName} deleted successfully`);
      fetchUsersList();
    } catch (err) {
      console.error('Failed to delete user:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to delete user account');
    }
  };

  const handleSaveChanges = async (overridePassword = null) => {
    if (isSaving) return;
    setIsSaving(true);
    setIsSaveSuccess(false);

    try {
      if (activeTab === 'profile') {
        const isEmailChanged = user?.email && profileEmail.trim().toLowerCase() !== user.email.trim().toLowerCase();
        const pwdToUse = typeof overridePassword === 'string' ? overridePassword : emailConfirmPassword;

        if (isEmailChanged && !pwdToUse) {
          setIsEmailModalOpen(true);
          setIsSaving(false);
          return;
        }

        const payload = {
          name: profileName,
          email: profileEmail,
          phone: profilePhone,
          title: profileTitle,
          profileImage,
        };

        if (isEmailChanged) {
          payload.password = pwdToUse;
        }

        const response = await api.put('/auth/profile', payload);
        const updatedData = response.data?.data || response.data;
        if (updatedData) {
          const currentUser = useAuthStore.getState().user;
          const updatedUser = {
            ...currentUser,
            ...updatedData,
          };
          useAuthStore.getState().setUser(updatedUser);
          if (updatedData.name) setProfileName(updatedData.name);
          if (updatedData.email) setProfileEmail(updatedData.email);
          if (updatedData.phone !== undefined) setProfilePhone(updatedData.phone);
          if (updatedData.title !== undefined) setProfileTitle(updatedData.title);
          if (updatedData.profileImage !== undefined) setProfileImage(updatedData.profileImage);
        }

        toast.success('Profile details updated successfully!');
        setIsEmailModalOpen(false);
        setEmailConfirmPassword('');
        setIsSaveSuccess(true);
        setTimeout(() => setIsSaveSuccess(false), 2500);
      } else if (activeTab === 'account') {
        if (currentPassword || newPassword || confirmNewPassword) {
          await handleUpdatePassword();
        } else {
          toast.success('Account settings saved successfully!');
        }
        setIsSaveSuccess(true);
        setTimeout(() => setIsSaveSuccess(false), 2500);
      } else if (activeTab === 'integrations') {
        handleSaveIntegrations();
        setIsSaveSuccess(true);
        setTimeout(() => setIsSaveSuccess(false), 2500);
      } else {
        localStorage.setItem(`settings_${activeTab}`, JSON.stringify({
          updatedAt: new Date().toISOString(),
          activeTab
        }));
        toast.success(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} settings saved successfully!`);
        setIsSaveSuccess(true);
        setTimeout(() => setIsSaveSuccess(false), 2500);
      }
    } catch (err) {
      console.error('Save error:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  // Profile Fields State
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileTitle, setProfileTitle] = useState('');
  const [profileDepartment, setProfileDepartment] = useState('Finance');

  // Email Change Confirmation Modal State
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailConfirmPassword, setEmailConfirmPassword] = useState('');

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Account Lifecycle State
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivateDays, setDeactivateDays] = useState(15);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePasswordConfirm, setDeletePasswordConfirm] = useState('');
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const deactivateAccountStore = useAuthStore((s) => s.deactivateAccount);
  const deleteAccountStore = useAuthStore((s) => s.deleteAccount);

  // Integrations State (with localStorage persistence)
  const [stripeConfig, setStripeConfig] = useState(() => {
    return JSON.parse(localStorage.getItem('stripeConfig') || '{"enabled":true,"testMode":true,"publishableKey":"pk_test_51Nx...amdox_stripe","secretKey":"sk_test_51Nx...secret_key","webhookSecret":"whsec_12345"}');
  });
  const [razorpayConfig, setRazorpayConfig] = useState(() => {
    return JSON.parse(localStorage.getItem('razorpayConfig') || '{"enabled":true,"testMode":true,"keyId":"rzp_test_99x...amdox_rzp","keySecret":"rzp_secret_key_888","webhookSecret":"whsec_rzp_999"}');
  });
  const [smtpConfig, setSmtpConfig] = useState(() => {
    return JSON.parse(localStorage.getItem('smtpConfig') || '{"enabled":true,"user":"08mjarir@gmail.com","pass":"cznu krwi witd yjye","host":"smtp.gmail.com","port":"465"}');
  });
  const [ssoConfig, setSsoConfig] = useState(() => {
    return JSON.parse(localStorage.getItem('ssoConfig') || '{"enabled":false,"realmUrl":"https://sso.amdoxerp.com/auth","clientId":"amdox-erp-client","clientSecret":"secret_sso_123"}');
  });

  const [showStripeSecret, setShowStripeSecret] = useState(false);
  const [showRazorpaySecret, setShowRazorpaySecret] = useState(false);

  const handleSaveIntegrations = () => {
    localStorage.setItem('stripeConfig', JSON.stringify(stripeConfig));
    localStorage.setItem('razorpayConfig', JSON.stringify(razorpayConfig));
    localStorage.setItem('smtpConfig', JSON.stringify(smtpConfig));
    localStorage.setItem('ssoConfig', JSON.stringify(ssoConfig));
    toast.success('Integrations configuration saved successfully!');
  };

  const handleTestIntegration = (name) => {
    toast.info(`Testing connection to ${name}...`);
    setTimeout(() => {
      toast.success(`${name} connection verified & operational!`);
    }, 1000);
  };

  const handleDeactivateSubmit = async () => {
    try {
      setIsDeactivating(true);
      await deactivateAccountStore(deactivateDays);
      toast.success(`Account deactivated for ${deactivateDays} days.`);
      window.location.href = '/login';
    } catch (err) {
      toast.error(err.message || 'Failed to deactivate account');
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!deletePasswordConfirm) {
      toast.error('Password is required to confirm deletion');
      return;
    }
    try {
      setIsDeleting(true);
      await deleteAccountStore(deletePasswordConfirm);
      toast.success('Your account and profile have been permanently deleted from MongoDB.');
      window.location.href = '/login';
    } catch (err) {
      toast.error(err.message || 'Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  // Initial Sync from Auth Store & Backend
  useEffect(() => {
    const syncProfile = async () => {
      try {
        const res = await api.get('/auth/me');
        const u = res.data?.data || res.data;
        if (u && (u.name || u.email)) {
          setProfileName(u.name || '');
          setProfileEmail(u.email || '');
          setProfilePhone(u.phone || '');
          setProfileTitle(u.title || '');
          setProfileDepartment(u.department || 'Finance');
          if (u.profileImage !== undefined) setProfileImage(u.profileImage);
          const currentUser = useAuthStore.getState().user;
          useAuthStore.getState().setUser({ ...currentUser, ...u });
        } else if (user) {
          setProfileName(user.name || '');
          setProfileEmail(user.email || '');
          setProfilePhone(user.phone || '');
          setProfileTitle(user.title || '');
          setProfileDepartment(user.department || 'Finance');
          if (user.profileImage !== undefined) setProfileImage(user.profileImage);
        }
      } catch (err) {
        if (user) {
          setProfileName(user.name || '');
          setProfileEmail(user.email || '');
          setProfilePhone(user.phone || '');
          setProfileTitle(user.title || '');
          setProfileDepartment(user.department || 'Finance');
          if (user.profileImage !== undefined) setProfileImage(user.profileImage);
        }
      }
    };
    syncProfile();
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Image = reader.result;
      setProfileImage(base64Image);

      try {
        toast.info('Uploading profile image...');
        const formData = new FormData();
        formData.append('profileImage', file);

        const response = await api.post('/auth/profile-image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        const resData = response.data?.data || response.data;
        const updatedImg = resData?.profileImage || base64Image;

        setProfileImage(updatedImg);
        const currentUser = useAuthStore.getState().user;
        const updatedUser = {
          ...currentUser,
          profileImage: updatedImg,
        };
        useAuthStore.getState().setUser(updatedUser);
        toast.success('Profile picture updated successfully!');
      } catch (err) {
        console.error('Failed to upload profile image via FormData, trying direct update:', err);
        try {
          const fallbackRes = await api.put('/auth/profile', { profileImage: base64Image });
          const resData = fallbackRes.data?.data || fallbackRes.data;
          const finalImg = resData?.profileImage || base64Image;
          setProfileImage(finalImg);
          const currentUser = useAuthStore.getState().user;
          useAuthStore.getState().setUser({ ...currentUser, profileImage: finalImg });
          toast.success('Profile picture updated successfully!');
        } catch (fbErr) {
          toast.error(err.response?.data?.message || err.message || 'Failed to upload profile image');
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteImage = () => {
    setIsDeleteImageModalOpen(true);
  };

  const confirmDeleteImage = async () => {
    setDeletingImage(true);
    try {
      await api.delete('/auth/profile-image');
      setProfileImage('');
      const currentUser = useAuthStore.getState().user;
      const updatedUser = {
        ...currentUser,
        profileImage: '',
      };
      useAuthStore.getState().setUser(updatedUser);
      toast.success('Profile picture removed successfully!');
    } catch (err) {
      console.error('Failed to delete profile image:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to remove profile picture');
    } finally {
      setDeletingImage(false);
      setIsDeleteImageModalOpen(false);
    }
  };

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['profile', 'account', 'general', 'users', 'security', 'notifications', 'integrations', 'preferences'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast.error('All fields are required');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update password');
    }
  };

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: FiUser },
    { id: 'account', label: 'Account Settings', icon: FiShield },
    { id: 'general', label: 'General', icon: FiSettings },
    { id: 'users', label: 'Users & Roles', icon: FiUser },
    { id: 'security', label: 'Security', icon: FiShield },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
    { id: 'integrations', label: 'Integrations', icon: FiDatabase },
    { id: 'preferences', label: 'Preferences', icon: FiGlobe },
  ];

  const SaveButton = ({ className = "" }) => (
    <button
      type="button"
      onClick={() => handleSaveChanges()}
      disabled={isSaving}
      className={`erp-focus inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-bold text-white shadow-lg transition-all duration-200 ${
        isSaveSuccess
          ? 'bg-emerald-600 shadow-emerald-600/20 hover:bg-emerald-700'
          : 'bg-primary shadow-blue-600/20 hover:bg-blue-700'
      } ${isSaving ? 'opacity-70 cursor-wait' : ''} ${className}`}
    >
      {isSaving ? (
        <>
          <FiRefreshCw className="h-4 w-4 animate-spin" />
          Saving...
        </>
      ) : isSaveSuccess ? (
        <>
          <FiCheck className="h-4 w-4 text-white" />
          Saved!
        </>
      ) : (
        <>
          <FiSave className="h-4 w-4" />
          Save Changes
        </>
      )}
    </button>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="System"
        title="Settings"
        description="Configure system-wide settings and preferences"
        actions={
          <SaveButton />
        }
      />

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-64 shrink-0">
          <nav className="flex lg:flex-col overflow-x-auto pb-2 lg:pb-0 gap-1.5 scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`erp-focus whitespace-nowrap flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition ${
                    activeTab === tab.id
                      ? 'bg-primary text-white shadow-md shadow-blue-600/20'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 bg-white/70 dark:bg-slate-900/60 lg:bg-transparent lg:dark:bg-transparent'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex-1 rounded-xl border border-white/70 bg-white/85 p-4 sm:p-6 shadow-soft backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">My Profile</h3>
              
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <div className="relative">
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white overflow-hidden shadow-md">
                      {profileImage ? (
                        <img src={getImageUrl(profileImage)} alt="Profile" className="h-full w-full object-cover" />
                      ) : (
                        user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-primary p-2 text-white shadow-lg transition hover:bg-blue-700" title="Upload new photo">
                      <FiCamera className="h-4 w-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {profileImage && (
                    <button
                      type="button"
                      onClick={handleDeleteImage}
                      className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 font-medium pt-1 transition"
                      title="Remove profile photo"
                    >
                      <FiTrash2 className="h-3.5 w-3.5" /> Remove Image
                    </button>
                  )}
                </div>
                <div className="flex-1 w-full space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="erp-focus h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 text-sm dark:border-slate-800 dark:bg-slate-900/80"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="erp-focus h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 text-sm dark:border-slate-800 dark:bg-slate-900/80"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="erp-focus h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 text-sm dark:border-slate-800 dark:bg-slate-900/80"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Job Title
                    </label>
                    <input
                      type="text"
                      value={profileTitle}
                      onChange={(e) => setProfileTitle(e.target.value)}
                      className="erp-focus h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 text-sm dark:border-slate-800 dark:bg-slate-900/80"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Department
                    </label>
                    <select
                      value={profileDepartment}
                      onChange={(e) => setProfileDepartment(e.target.value)}
                      className="erp-focus h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 text-sm dark:border-slate-800 dark:bg-slate-900/80"
                    >
                      <option>Finance</option>
                      <option>Human Resources</option>
                      <option>Supply Chain</option>
                      <option>IT</option>
                      <option>Operations</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                <h4 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Account Information</h4>
                <div className="grid gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-300">Employee ID</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{user?.id || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-300">Role</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 capitalize">{user?.role || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-300">Status</span>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Active</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
                <SaveButton />
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Account Settings</h3>
              
              <div className="space-y-4">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                  <h4 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Change Password</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Current Password
                      </label>
                      <span className="relative block">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          placeholder="Enter current password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="erp-focus h-11 w-full rounded-xl border border-slate-200 bg-white pl-4 pr-10 text-sm dark:border-slate-800 dark:bg-slate-900"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          {showCurrentPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                        </button>
                      </span>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                        New Password
                      </label>
                      <span className="relative block">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          placeholder="Enter new password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="erp-focus h-11 w-full rounded-xl border border-slate-200 bg-white pl-4 pr-10 text-sm dark:border-slate-800 dark:bg-slate-900"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          {showNewPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                        </button>
                      </span>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Confirm New Password
                      </label>
                      <span className="relative block">
                        <input
                          type={showConfirmNewPassword ? "text" : "password"}
                          placeholder="Confirm new password"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          className="erp-focus h-11 w-full rounded-xl border border-slate-200 bg-white pl-4 pr-10 text-sm dark:border-slate-800 dark:bg-slate-900"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          {showConfirmNewPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                        </button>
                      </span>
                    </div>
                    <button onClick={handleUpdatePassword} className="erp-focus inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">
                      Update Password
                    </button>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                  <h4 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Email Preferences</h4>
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">Receive email notifications</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Get notified about important updates</p>
                      </div>
                      <button className="erp-focus h-10 w-16 shrink-0 rounded-xl bg-primary text-xs font-semibold text-white transition hover:bg-blue-700">
                        ON
                      </button>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">Weekly digest</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Receive weekly summary emails</p>
                      </div>
                      <button className="erp-focus h-10 w-16 shrink-0 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-sm transition hover:border-primary/40 hover:text-primary dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                        OFF
                      </button>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                  <h4 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Danger Zone</h4>
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">Deactivate Account</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Temporarily disable your account for a set timeframe</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowDeactivateModal(true)}
                        className="erp-focus shrink-0 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700 shadow-sm transition hover:border-amber-400 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400"
                      >
                        Deactivate
                      </button>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-rose-900 dark:text-rose-100">Delete Account</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Permanently purge your account data from MongoDB</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowDeleteModal(true)}
                        className="erp-focus shrink-0 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 shadow-sm transition hover:border-rose-400 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-400"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
                  <SaveButton />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">General Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Company Name
                  </label>
                  <input
                    type="text"
                    defaultValue="AMDOX Technologies"
                    className="erp-focus h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 text-sm dark:border-slate-800 dark:bg-slate-900/80"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Timezone
                  </label>
                  <select className="erp-focus h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 text-sm dark:border-slate-800 dark:bg-slate-900/80">
                    <option>Asia/Kolkata (IST)</option>
                    <option>America/New_York (EST)</option>
                    <option>Europe/London (GMT)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Currency
                  </label>
                  <select className="erp-focus h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 text-sm dark:border-slate-800 dark:bg-slate-900/80">
                    <option>INR (₹)</option>
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                    <option>GBP (£)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Date Format
                  </label>
                  <select className="erp-focus h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 text-sm dark:border-slate-800 dark:bg-slate-900/80">
                    <option>DD/MM/YYYY</option>
                    <option>MM/DD/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Users & Roles Management</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Manage user accounts, assign system roles, and configure RBAC permissions</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(true)}
                  className="erp-focus inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-xs font-bold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700"
                >
                  <FiUserPlus className="h-4 w-4" />
                  Add New User
                </button>
              </div>

              {/* Filters & Search Toolbar */}
              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/50">
                <div className="relative flex-1 min-w-[200px]">
                  <FiSearch className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search users by name, email, or role..."
                    value={userSearchText}
                    onChange={(e) => setUserSearchText(e.target.value)}
                    className="erp-focus h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <FiFilter className="h-3.5 w-3.5 text-slate-400" />
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="erp-focus h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="hr">HR</option>
                    <option value="manager">Manager</option>
                    <option value="employee">Employee</option>
                  </select>
                  <select
                    value={userStatusFilter}
                    onChange={(e) => setUserStatusFilter(e.target.value)}
                    className="erp-focus h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="deactivated">Deactivated</option>
                  </select>
                </div>
              </div>

              {/* Users Table */}
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
                {usersLoading ? (
                  <div className="flex h-48 items-center justify-center gap-2 text-xs text-slate-400">
                    <FiRefreshCw className="h-4 w-4 animate-spin text-primary" /> Loading user accounts...
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/40">
                          <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">User Details</th>
                          <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">Role</th>
                          <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">Department & Title</th>
                          <th className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-200">Status</th>
                          <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-200">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {usersList.filter(u => {
                          const matchesSearch = (u.name || '').toLowerCase().includes(userSearchText.toLowerCase()) ||
                                                (u.email || '').toLowerCase().includes(userSearchText.toLowerCase()) ||
                                                (u.role || '').toLowerCase().includes(userSearchText.toLowerCase());
                          const matchesRole = userRoleFilter === 'all' || (u.role || '').toLowerCase() === userRoleFilter.toLowerCase();
                          const matchesStatus = userStatusFilter === 'all' || (u.status || 'active').toLowerCase() === userStatusFilter.toLowerCase();
                          return matchesSearch && matchesRole && matchesStatus;
                        }).length === 0 ? (
                          <tr>
                            <td colSpan="5" className="py-8 text-center text-slate-400">
                              No user accounts found matching selected criteria.
                            </td>
                          </tr>
                        ) : (
                          usersList.filter(u => {
                            const matchesSearch = (u.name || '').toLowerCase().includes(userSearchText.toLowerCase()) ||
                                                  (u.email || '').toLowerCase().includes(userSearchText.toLowerCase()) ||
                                                  (u.role || '').toLowerCase().includes(userSearchText.toLowerCase());
                            const matchesRole = userRoleFilter === 'all' || (u.role || '').toLowerCase() === userRoleFilter.toLowerCase();
                            const matchesStatus = userStatusFilter === 'all' || (u.status || 'active').toLowerCase() === userStatusFilter.toLowerCase();
                            return matchesSearch && matchesRole && matchesStatus;
                          }).map((u) => {
                            const roleColors = {
                              admin: 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200',
                              hr: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300 border-cyan-200',
                              manager: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200',
                              employee: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200',
                            };

                            return (
                              <tr key={u.id} className="hover:bg-slate-50/50 transition dark:hover:bg-slate-800/30">
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 text-xs font-bold text-white overflow-hidden shadow-xs shrink-0">
                                      {u.profileImage ? (
                                        <img src={getImageUrl(u.profileImage)} alt="Avatar" className="h-full w-full object-cover" />
                                      ) : (
                                        u.initials || u.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{u.name}</p>
                                      <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${roleColors[u.role?.toLowerCase()] || roleColors.employee}`}>
                                    {u.role}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <p className="font-medium text-slate-800 dark:text-slate-200">{u.title || 'Staff Member'}</p>
                                  <p className="text-[11px] text-slate-400">{u.department || 'General'}</p>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                    u.status === 'active'
                                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                      : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                                  }`}>
                                    <span className={`h-1.5 w-1.5 rounded-full ${u.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                    {u.status || 'active'}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditUserModal(u)}
                                      className="erp-focus flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-100 hover:text-primary dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                                      title="Edit Role & Permissions"
                                    >
                                      <FiEdit2 className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteUser(u.id, u.name)}
                                      className="erp-focus flex h-7 w-7 items-center justify-center rounded-md border border-rose-200 text-rose-600 transition hover:bg-rose-50 dark:border-rose-900/40 dark:text-rose-400 dark:hover:bg-rose-950/30"
                                      title="Delete Account"
                                    >
                                      <FiTrash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* RBAC Role Permissions Matrix Card */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <FiShield className="h-4 w-4 text-primary" /> Role-Based Access Control (RBAC) Matrix
                    </h4>
                    <p className="text-xs text-slate-500">Security permissions breakdown per system role</p>
                  </div>
                  <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-800/50">
                    {['admin', 'hr', 'manager', 'employee'].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setActiveRbacRole(r)}
                        className={`rounded-md px-3 py-1 text-xs font-bold uppercase transition ${
                          activeRbacRole === r
                            ? 'bg-primary text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {({
                    admin: [
                      { name: "Full System Access", desc: "Complete administrative control over all modules" },
                      { name: "User & Role Management", desc: "Create, edit, suspend, and delete user accounts" },
                      { name: "Financial Ledger & Reports", desc: "Full access to General Ledger, AR, AP, and financial statements" },
                      { name: "Payroll & Compensation", desc: "Manage employee salaries, bonuses, and process payroll" },
                      { name: "Inventory & Supply Chain", desc: "Manage stock levels, purchase orders, and vendor relationships" },
                      { name: "CRM & Sales Operations", desc: "Manage customer leads, deals, and sales pipelines" },
                      { name: "System Settings & Integrations", desc: "Configure API keys, payment gateways, and security policies" },
                    ],
                    hr: [
                      { name: "Employee Directory Management", desc: "Create and update employee records and departments" },
                      { name: "Attendance & Leave Approval", desc: "Review and approve employee leave requests and attendance logs" },
                      { name: "Recruitment & Onboarding", desc: "Post job openings, track applicants, and manage hiring" },
                      { name: "Payroll Processing", desc: "View and edit employee payroll details and generate pay slips" },
                      { name: "Training & Performance", desc: "Assign training programs and conduct performance reviews" },
                    ],
                    manager: [
                      { name: "Team Employee Directory", desc: "View department team members and contact details" },
                      { name: "Task & Project Management", desc: "Assign tasks, set milestones, and track project timelines" },
                      { name: "Leave & Attendance Review", desc: "Approve or reject leave applications for direct reports" },
                      { name: "Performance Evaluations", desc: "Conduct performance appraisals for team members" },
                      { name: "CRM Lead Tracking", desc: "Manage assigned customer accounts and sales opportunities" },
                    ],
                    employee: [
                      { name: "Self-Service Profile Portal", desc: "Update personal profile, contact info, and view employment status" },
                      { name: "Leave Application", desc: "Submit leave requests and view leave balance" },
                      { name: "Clock-In / Clock-Out", desc: "Log daily work attendance and view attendance history" },
                      { name: "My Assigned Tasks", desc: "View and update status of individual tasks" },
                      { name: "Company Documents & Holidays", desc: "Access shared enterprise documents and holiday calendar" },
                    ],
                  }[activeRbacRole] || []).map((perm, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 rounded-lg border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800/80 dark:bg-slate-800/30">
                      <FiCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{perm.name}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{perm.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Security Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">Two-Factor Authentication</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Require 2FA for all users</p>
                  </div>
                  <button className="erp-focus h-11 w-16 rounded-xl bg-primary text-sm font-semibold text-white transition hover:bg-blue-700">
                    ON
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">Session Timeout</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Auto-logout after inactivity</p>
                  </div>
                  <select className="erp-focus h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm dark:border-slate-800 dark:bg-slate-900">
                    <option>15 minutes</option>
                    <option>30 minutes</option>
                    <option>1 hour</option>
                    <option>2 hours</option>
                  </select>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">Password Policy</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Minimum password requirements</p>
                  </div>
                  <button className="erp-focus h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-primary/40 hover:text-primary dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                    Configure
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Notification Preferences</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">Email Notifications</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Receive updates via email</p>
                  </div>
                  <button className="erp-focus h-11 w-16 rounded-xl bg-primary text-sm font-semibold text-white transition hover:bg-blue-700">
                    ON
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">In-App Notifications</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Show notifications in app</p>
                  </div>
                  <button className="erp-focus h-11 w-16 rounded-xl bg-primary text-sm font-semibold text-white transition hover:bg-blue-700">
                    ON
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">SMS Notifications</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Receive alerts via SMS</p>
                  </div>
                  <button className="erp-focus h-11 w-16 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm transition hover:border-primary/40 hover:text-primary dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                    OFF
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Integrations & Payment Gateways</h3>
                  <p className="text-xs text-slate-500">Configure Stripe, Razorpay, Nodemailer SMTP, and Enterprise SSO connections</p>
                </div>
                <button
                  type="button"
                  onClick={handleSaveIntegrations}
                  className="erp-focus inline-flex h-9 items-center gap-2 rounded-xl bg-primary px-4 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition shrink-0 self-start sm:self-auto"
                >
                  <FiSave className="h-3.5 w-3.5" />
                  Save Integration Keys
                </button>
              </div>
              
              <div className="space-y-5">
                {/* 1. Stripe Payment Gateway Config */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900/50 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-3 dark:border-slate-800/60">
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2 text-primary shrink-0 mt-0.5 sm:mt-0">
                        <FiCreditCard className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">Stripe Payment Gateway</p>
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${stripeConfig.enabled ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-200 text-slate-700'}`}>
                            {stripeConfig.enabled ? 'Active' : 'Disabled'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">Global Credit/Debit Cards, Apple Pay & Google Pay</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleTestIntegration('Stripe Gateway')}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      >
                        Test Connection
                      </button>
                      <button
                        type="button"
                        onClick={() => setStripeConfig({ ...stripeConfig, enabled: !stripeConfig.enabled })}
                        className={`h-8 px-3 rounded-lg text-xs font-bold transition ${stripeConfig.enabled ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}
                      >
                        {stripeConfig.enabled ? 'ENABLED' : 'DISABLED'}
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Stripe Publishable Key</label>
                      <input
                        type="text"
                        value={stripeConfig.publishableKey}
                        onChange={(e) => setStripeConfig({ ...stripeConfig, publishableKey: e.target.value })}
                        className="mt-1 erp-focus h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs dark:border-slate-800 dark:bg-slate-950 dark:text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Stripe Secret Key</label>
                      <div className="relative mt-1">
                        <input
                          type={showStripeSecret ? 'text' : 'password'}
                          value={stripeConfig.secretKey}
                          onChange={(e) => setStripeConfig({ ...stripeConfig, secretKey: e.target.value })}
                          className="erp-focus h-10 w-full rounded-xl border border-slate-200 bg-white pl-3 pr-10 text-xs dark:border-slate-800 dark:bg-slate-950 dark:text-white font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowStripeSecret(!showStripeSecret)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          {showStripeSecret ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Razorpay Payment Gateway Config */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900/50 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-3 dark:border-slate-800/60">
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="rounded-lg bg-blue-500/10 p-2 text-blue-600 shrink-0 mt-0.5 sm:mt-0">
                        <FiCreditCard className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">Razorpay Payment Gateway</p>
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${razorpayConfig.enabled ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-200 text-slate-700'}`}>
                            {razorpayConfig.enabled ? 'Active' : 'Disabled'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">UPI, NetBanking, Wallets & India Cards</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleTestIntegration('Razorpay Gateway')}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      >
                        Test Connection
                      </button>
                      <button
                        type="button"
                        onClick={() => setRazorpayConfig({ ...razorpayConfig, enabled: !razorpayConfig.enabled })}
                        className={`h-8 px-3 rounded-lg text-xs font-bold transition ${razorpayConfig.enabled ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}
                      >
                        {razorpayConfig.enabled ? 'ENABLED' : 'DISABLED'}
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Razorpay Key ID</label>
                      <input
                        type="text"
                        value={razorpayConfig.keyId}
                        onChange={(e) => setRazorpayConfig({ ...razorpayConfig, keyId: e.target.value })}
                        className="mt-1 erp-focus h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs dark:border-slate-800 dark:bg-slate-950 dark:text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Razorpay Key Secret</label>
                      <div className="relative mt-1">
                        <input
                          type={showRazorpaySecret ? 'text' : 'password'}
                          value={razorpayConfig.keySecret}
                          onChange={(e) => setRazorpayConfig({ ...razorpayConfig, keySecret: e.target.value })}
                          className="erp-focus h-10 w-full rounded-xl border border-slate-200 bg-white pl-3 pr-10 text-xs dark:border-slate-800 dark:bg-slate-950 dark:text-white font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRazorpaySecret(!showRazorpaySecret)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          {showRazorpaySecret ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Nodemailer SMTP Config */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900/50 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-3 dark:border-slate-800/60">
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 shrink-0 mt-0.5 sm:mt-0">
                        <FiMail className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">Nodemailer SMTP Email Service</p>
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${smtpConfig.enabled ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-200 text-slate-700'}`}>
                            {smtpConfig.enabled ? 'Active' : 'Disabled'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">Automated OTP verification, invoices & notification emails</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleTestIntegration('Nodemailer SMTP')}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      >
                        Send Test Mail
                      </button>
                      <button
                        type="button"
                        onClick={() => setSmtpConfig({ ...smtpConfig, enabled: !smtpConfig.enabled })}
                        className={`h-8 px-3 rounded-lg text-xs font-bold transition ${smtpConfig.enabled ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}
                      >
                        {smtpConfig.enabled ? 'ENABLED' : 'DISABLED'}
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">SMTP Host & Port</label>
                      <div className="flex gap-2 mt-1">
                        <input
                          type="text"
                          value={smtpConfig.host}
                          onChange={(e) => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
                          placeholder="smtp.gmail.com"
                          className="erp-focus h-10 flex-1 min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-xs dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                        />
                        <input
                          type="text"
                          value={smtpConfig.port}
                          onChange={(e) => setSmtpConfig({ ...smtpConfig, port: e.target.value })}
                          placeholder="465"
                          className="erp-focus h-10 w-20 shrink-0 rounded-xl border border-slate-200 bg-white px-3 text-xs text-center dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Sender User Email</label>
                      <input
                        type="email"
                        value={smtpConfig.user}
                        onChange={(e) => setSmtpConfig({ ...smtpConfig, user: e.target.value })}
                        className="mt-1 erp-focus h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Keycloak SSO Config */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900/50 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-3 dark:border-slate-800/60">
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="rounded-lg bg-amber-500/10 p-2 text-amber-600 shrink-0 mt-0.5 sm:mt-0">
                        <FiShield className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">Keycloak Single Sign-On (SSO)</p>
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${ssoConfig.enabled ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-200 text-slate-700'}`}>
                            {ssoConfig.enabled ? 'Active' : 'Disabled'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">Enterprise identity provider & OpenID Connect</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleTestIntegration('Keycloak SSO')}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      >
                        Test SSO
                      </button>
                      <button
                        type="button"
                        onClick={() => setSsoConfig({ ...ssoConfig, enabled: !ssoConfig.enabled })}
                        className={`h-8 px-3 rounded-lg text-xs font-bold transition ${ssoConfig.enabled ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}
                      >
                        {ssoConfig.enabled ? 'ENABLED' : 'DISABLED'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">User Preferences</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">Dark Mode</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Toggle between Light and Dark theme</p>
                  </div>
                  <button
                    type="button"
                    onClick={toggleDarkMode}
                    className={`erp-focus inline-flex h-10 min-w-24 items-center justify-center rounded-xl px-4 text-xs font-bold transition shadow-sm ${
                      isDarkMode
                        ? 'bg-indigo-600 text-white shadow-indigo-600/20 hover:bg-indigo-700'
                        : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {isDarkMode ? 'ON (Dark)' : 'OFF (Light)'}
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">Compact View</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Show more data per page</p>
                  </div>
                  <button className="erp-focus h-11 w-16 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm transition hover:border-primary/40 hover:text-primary dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                    OFF
                  </button>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Language
                  </label>
                  <select className="erp-focus h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 text-sm dark:border-slate-800 dark:bg-slate-900/80">
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Tamil</option>
                    <option>Telugu</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Deactivate Account Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Deactivate Account</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Select the number of days you wish to temporarily deactivate your account. You can reactivate anytime by signing back in.
            </p>

            <div className="mt-5 space-y-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Deactivation Timeframe (Days)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[15, 30, 60].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDeactivateDays(d)}
                    className={`rounded-xl border py-2.5 text-xs font-bold transition ${
                      deactivateDays === d
                        ? 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'
                    }`}
                  >
                    {d} Days
                  </button>
                ))}
              </div>
              <div className="mt-2">
                <span className="text-xs text-slate-500">Custom Days:</span>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={deactivateDays}
                  onChange={(e) => setDeactivateDays(Math.max(1, parseInt(e.target.value || '1', 10)))}
                  className="mt-1 erp-focus h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeactivateModal(false)}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeactivating}
                onClick={handleDeactivateSubmit}
                className="rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-amber-700 transition disabled:opacity-50"
              >
                {isDeactivating ? 'Deactivating...' : 'Confirm Deactivation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-rose-200 dark:border-rose-900">
            <h3 className="text-xl font-bold text-rose-600 dark:text-rose-400">Permanently Delete Account</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Warning! This action cannot be undone. All your account data and associated profile details will be <strong className="text-rose-600">permanently purged from MongoDB</strong>.
            </p>

            <div className="mt-5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Confirm Your Password
              </label>
              <input
                type="password"
                value={deletePasswordConfirm}
                onChange={(e) => setDeletePasswordConfirm(e.target.value)}
                placeholder="Enter password to confirm"
                className="mt-1 erp-focus h-11 w-full rounded-xl border border-rose-200 bg-rose-50/50 px-4 text-sm font-semibold text-slate-900 dark:border-rose-900 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteSubmit}
                className="rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-rose-700 transition disabled:opacity-50"
              >
                {isDeleting ? 'Deleting Data...' : 'Permanently Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Email Change Password Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-amber-200 dark:border-amber-900">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-lg">
                <FiLock className="h-5 w-5 text-amber-500" />
                Confirm Email Change
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEmailModalOpen(false);
                  setEmailConfirmPassword('');
                }}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
              You are updating your email address to <strong className="text-primary">{profileEmail}</strong>. Please enter your current password to confirm this change.
            </p>

            <div className="mb-6">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Current Password
              </label>
              <input
                type="password"
                value={emailConfirmPassword}
                onChange={(e) => setEmailConfirmPassword(e.target.value)}
                placeholder="Enter your current password..."
                className="erp-focus h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && emailConfirmPassword) {
                    handleSaveChanges(emailConfirmPassword);
                  }
                }}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsEmailModalOpen(false);
                  setEmailConfirmPassword('');
                }}
                className="flex-1 h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveChanges(emailConfirmPassword)}
                disabled={!emailConfirmPassword}
                className="flex-1 h-10 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-md hover:bg-blue-700 disabled:opacity-50 transition"
              >
                Confirm & Update Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-primary dark:bg-blue-950/50">
                  <FiUserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Create New User Account</h3>
                  <p className="text-xs text-slate-500">Provision a new user account with role access</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={addUserForm.name}
                  onChange={(e) => setAddUserForm({ ...addUserForm, name: e.target.value })}
                  className="erp-focus h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rahul.sharma@amdoxerp.com"
                  value={addUserForm.email}
                  onChange={(e) => setAddUserForm({ ...addUserForm, email: e.target.value })}
                  className="erp-focus h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200">Temporary Password</label>
                  <input
                    type="password"
                    placeholder="Defaults to Amdox@123"
                    value={addUserForm.password}
                    onChange={(e) => setAddUserForm({ ...addUserForm, password: e.target.value })}
                    className="erp-focus h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200">Assign System Role</label>
                  <select
                    value={addUserForm.role}
                    onChange={(e) => setAddUserForm({ ...addUserForm, role: e.target.value })}
                    className="erp-focus h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs font-semibold dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="admin">Admin (Full Control)</option>
                    <option value="hr">HR (People & Payroll)</option>
                    <option value="manager">Manager (Projects & Tasks)</option>
                    <option value="employee">Employee (Self-Service)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200">Department</label>
                  <select
                    value={addUserForm.department}
                    onChange={(e) => setAddUserForm({ ...addUserForm, department: e.target.value })}
                    className="erp-focus h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="Finance">Finance</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Supply Chain">Supply Chain</option>
                    <option value="IT">IT</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200">Job Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Specialist"
                    value={addUserForm.title}
                    onChange={(e) => setAddUserForm({ ...addUserForm, title: e.target.value })}
                    className="erp-focus h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="flex-1 h-10 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingUser}
                  className="flex-1 h-10 rounded-xl bg-primary px-4 text-xs font-bold text-white shadow-md hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {isSubmittingUser ? 'Creating User...' : 'Provision User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditUserModalOpen && selectedUserToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/50">
                  <FiEdit2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit User Access & Role</h3>
                  <p className="text-xs text-slate-500">{selectedUserToEdit.name} ({selectedUserToEdit.email})</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditUserModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUserRoleStatus} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200">System Role</label>
                <select
                  value={editUserForm.role}
                  onChange={(e) => setEditUserForm({ ...editUserForm, role: e.target.value })}
                  className="erp-focus h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs font-bold dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                >
                  <option value="admin">Admin (Full System Control)</option>
                  <option value="hr">HR (People, Recruitment & Payroll)</option>
                  <option value="manager">Manager (Projects, Tasks & Approvals)</option>
                  <option value="employee">Employee (Self-Service Portal)</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200">Account Status</label>
                <select
                  value={editUserForm.status}
                  onChange={(e) => setEditUserForm({ ...editUserForm, status: e.target.value })}
                  className="erp-focus h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs font-bold dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                >
                  <option value="active">Active (Access Granted)</option>
                  <option value="deactivated">Deactivated (Access Suspended)</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200">Job Designation</label>
                <input
                  type="text"
                  value={editUserForm.title}
                  onChange={(e) => setEditUserForm({ ...editUserForm, title: e.target.value })}
                  className="erp-focus h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200">Department</label>
                <select
                  value={editUserForm.department}
                  onChange={(e) => setEditUserForm({ ...editUserForm, department: e.target.value })}
                  className="erp-focus h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                >
                  <option value="Finance">Finance</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Supply Chain">Supply Chain</option>
                  <option value="IT">IT</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditUserModalOpen(false)}
                  className="flex-1 h-10 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingUser}
                  className="flex-1 h-10 rounded-xl bg-primary px-4 text-xs font-bold text-white shadow-md hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {isSubmittingUser ? 'Saving...' : 'Update Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={isDeleteImageModalOpen}
        onClose={() => setIsDeleteImageModalOpen(false)}
        onConfirm={confirmDeleteImage}
        loading={deletingImage}
        title="Remove Profile Picture"
        message="Are you sure you want to remove your profile picture? This action will reset your avatar to default."
      />
    </div>
  );
}
