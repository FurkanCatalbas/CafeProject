import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, Users, Mail, Shield } from 'lucide-react';
import { usersService } from '../../services/usersService';
import ModalOverlay from '../../components/common/ModalOverlay';

interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  roleName: 'ADMIN' | 'MANAGER' | 'WAITER' | 'CASHIER' | 'CUSTOMER';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  type: number;
  password?: string;
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    username: '',
    emailAddress: '',
    password: '',
    roleName: 'CUSTOMER' as User['roleName'],
    status: 'ACTIVE' as User['status'],
    type: 1,
  });
  const [editUser, setEditUser] = useState({
    firstName: '',
    lastName: '',
    username: '',
    emailAddress: '',
    roleName: 'CUSTOMER' as User['roleName'],
    status: 'ACTIVE' as User['status'],
    type: 1,
    password: '',
  });

  const mapUser = (item: any): User => ({
    id: item.id,
    username: item.username,
    firstName: item.firstName,
    lastName: item.lastName,
    emailAddress: item.emailAddress,
    roleName: item.roleName ?? 'CUSTOMER',
    status: item.status ?? 'ACTIVE',
    type: item.type ?? 1,
    password: item.password,
  });

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await usersService.getAll();
      setUsers((data || []).map(mapUser));
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
          'Kullanıcılar backend tarafından alınamadı. Kullanıcı listesi uç noktası kullanılamıyor olabilir.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const resetNewUser = () => {
    setNewUser({
      firstName: '',
      lastName: '',
      username: '',
      emailAddress: '',
      password: '',
      roleName: 'CUSTOMER',
      status: 'ACTIVE',
      type: 1,
    });
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setIsSubmitting(false);
    resetNewUser();
  };

  const handleCreateUser = async () => {
    if (
      !newUser.firstName.trim() ||
      !newUser.lastName.trim() ||
      !newUser.username.trim() ||
      !newUser.emailAddress.trim() ||
      !newUser.password.trim()
    ) {
      setError('Kullanıcı oluşturmadan önce tüm zorunlu alanları doldurun.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await usersService.create({
        ...newUser,
        firstName: newUser.firstName.trim(),
        lastName: newUser.lastName.trim(),
        username: newUser.username.trim(),
        emailAddress: newUser.emailAddress.trim(),
      });
      await loadUsers();
      closeCreateModal();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Kullanıcı oluşturulamadı.');
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    const confirmed = window.confirm('Bu kullanıcıyı silmek istiyor musunuz?');
    if (!confirmed) {
      return;
    }

    setError(null);
    try {
      await usersService.delete(id);
      await loadUsers();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Kullanıcı silinemedi.');
    }
  };

  const handleOpenEditUser = (user: User) => {
    setEditingUserId(user.id);
    setEditUser({
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      emailAddress: user.emailAddress,
      roleName: user.roleName,
      status: user.status,
      type: user.type,
      password: user.password ?? '',
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setIsSubmitting(false);
    setEditingUserId(null);
  };

  const handleUpdateUser = async () => {
    if (!editingUserId) {
      return;
    }

    if (
      !editUser.firstName.trim() ||
      !editUser.lastName.trim() ||
      !editUser.username.trim() ||
      !editUser.emailAddress.trim()
    ) {
      setError('Kullanıcı güncellemeden önce tüm zorunlu alanları doldurun.');
      return;
    }

    if (!editUser.password) {
      setError('Kullanıcı güncellemesi için şifre bilgisi bulunamadı.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await usersService.update({
        id: editingUserId,
        firstName: editUser.firstName.trim(),
        lastName: editUser.lastName.trim(),
        username: editUser.username.trim(),
        emailAddress: editUser.emailAddress.trim(),
        roleName: editUser.roleName,
        status: editUser.status,
        type: editUser.type,
        password: editUser.password,
      });
      await loadUsers();
      closeEditModal();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Kullanıcı güncellenemedi.');
      setIsSubmitting(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-600';
      case 'MANAGER': return 'bg-blue-600';
      case 'WAITER': return 'bg-green-600';
      case 'CASHIER': return 'bg-yellow-600';
      case 'CUSTOMER': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-600';
      case 'INACTIVE': return 'bg-gray-600';
      case 'SUSPENDED': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getRoleLabel = (role: User['roleName']) => {
    switch (role) {
      case 'ADMIN': return 'Yönetici';
      case 'MANAGER': return 'Müdür';
      case 'WAITER': return 'Garson';
      case 'CASHIER': return 'Kasiyer';
      case 'CUSTOMER': return 'Müşteri';
      default: return role;
    }
  };

  const getStatusLabel = (status: User['status']) => {
    switch (status) {
      case 'ACTIVE': return 'Aktif';
      case 'INACTIVE': return 'Pasif';
      case 'SUSPENDED': return 'Askıda';
      default: return status;
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.emailAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.roleName === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Kullanıcılar</h1>
          <p className="text-gray-600">Kafenizdeki personel ve müşterileri yönetin</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          data-testid="users-open-create-modal"
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Kullanıcı Ekle
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {/* Filtreler */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Kullanıcılarda ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10 w-full"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="input-field"
        >
          <option value="all">Tüm Roller</option>
          <option value="ADMIN">Yönetici</option>
          <option value="MANAGER">Müdür</option>
          <option value="WAITER">Garson</option>
          <option value="CASHIER">Kasiyer</option>
          <option value="CUSTOMER">Müşteri</option>
        </select>
      </div>

      {/* Kullanıcı Tablosu */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2.5 px-4 text-gray-700 font-medium">Kullanıcı</th>
              <th className="text-left py-2.5 px-4 text-gray-700 font-medium">E-posta</th>
              <th className="text-left py-2.5 px-4 text-gray-700 font-medium">Rol</th>
              <th className="text-left py-2.5 px-4 text-gray-700 font-medium">Durum</th>
              <th className="text-left py-2.5 px-4 text-gray-700 font-medium">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-2.5 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-gray-500">@{user.username}</p>
                    </div>
                  </div>
                </td>
                <td className="py-2.5 px-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-800">{user.emailAddress}</span>
                  </div>
                </td>
                <td className="py-2.5 px-4">
                  <div className="flex items-center gap-2">
                    <Shield className={`w-4 h-4 ${getRoleColor(user.roleName).replace('bg-', 'text-')}`} />
                    <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getRoleColor(user.roleName)}`}>
                      {getRoleLabel(user.roleName)}
                    </span>
                  </div>
                </td>
                <td className="py-2.5 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(user.status)}`}>
                    {getStatusLabel(user.status)}
                  </span>
                </td>
                <td className="py-2.5 px-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditUser(user)}
                      className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 px-4 text-center text-sm text-gray-500">
                  Kullanıcı bulunamadı.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Kullanıcı Ekleme Modalı */}
      {showCreateModal && (
        <ModalOverlay>
          <div className="bg-white border border-gray-200 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Yeni Kullanıcı Ekle</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Ad"
                  value={newUser.firstName}
                  onChange={(e) => setNewUser((prev) => ({ ...prev, firstName: e.target.value }))}
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder="Soyad"
                  value={newUser.lastName}
                  onChange={(e) => setNewUser((prev) => ({ ...prev, lastName: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Kullanıcı Adı"
                  value={newUser.username}
                  onChange={(e) => setNewUser((prev) => ({ ...prev, username: e.target.value }))}
                  className="input-field"
                />
                <input
                  type="email"
                  placeholder="E-posta Adresi"
                  value={newUser.emailAddress}
                  onChange={(e) => setNewUser((prev) => ({ ...prev, emailAddress: e.target.value }))}
                  className="input-field"
                />
              </div>
              <input
                type="password"
                placeholder="Şifre"
                value={newUser.password}
                onChange={(e) => setNewUser((prev) => ({ ...prev, password: e.target.value }))}
                className="input-field w-full"
              />
              <div className="grid grid-cols-2 gap-4">
                <select
                  className="input-field"
                  value={newUser.roleName}
                  onChange={(e) => setNewUser((prev) => ({ ...prev, roleName: e.target.value as User['roleName'] }))}
                >
                  <option value="ADMIN">Yönetici</option>
                  <option value="MANAGER">Müdür</option>
                  <option value="WAITER">Garson</option>
                  <option value="CASHIER">Kasiyer</option>
                  <option value="CUSTOMER">Müşteri</option>
                </select>
                <select
                  className="input-field"
                  value={newUser.status}
                  onChange={(e) => setNewUser((prev) => ({ ...prev, status: e.target.value as User['status'] }))}
                >
                  <option value="ACTIVE">Aktif</option>
                  <option value="INACTIVE">Pasif</option>
                  <option value="SUSPENDED">Askıda</option>
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={closeCreateModal}
                  className="btn-secondary"
                >
                  İptal
                </button>
                <button
                  onClick={handleCreateUser}
                  disabled={isSubmitting}
                  data-testid="users-submit-create"
                  className="btn-primary disabled:opacity-50"
                >
                  {isSubmitting ? 'Ekleniyor...' : 'Kullanıcı Ekle'}
                </button>
              </div>
            </div>
          </div>
        </ModalOverlay>
      )}

      {showEditModal && (
        <ModalOverlay>
          <div className="bg-white border border-gray-200 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Kullanıcı Düzenle</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Ad"
                  value={editUser.firstName}
                  onChange={(e) => setEditUser((prev) => ({ ...prev, firstName: e.target.value }))}
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder="Soyad"
                  value={editUser.lastName}
                  onChange={(e) => setEditUser((prev) => ({ ...prev, lastName: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Kullanıcı Adı"
                  value={editUser.username}
                  onChange={(e) => setEditUser((prev) => ({ ...prev, username: e.target.value }))}
                  className="input-field"
                />
                <input
                  type="email"
                  placeholder="E-posta Adresi"
                  value={editUser.emailAddress}
                  onChange={(e) => setEditUser((prev) => ({ ...prev, emailAddress: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select
                  className="input-field"
                  value={editUser.roleName}
                  onChange={(e) => setEditUser((prev) => ({ ...prev, roleName: e.target.value as User['roleName'] }))}
                >
                  <option value="ADMIN">Yönetici</option>
                  <option value="MANAGER">Müdür</option>
                  <option value="WAITER">Garson</option>
                  <option value="CASHIER">Kasiyer</option>
                  <option value="CUSTOMER">Müşteri</option>
                </select>
                <select
                  className="input-field"
                  value={editUser.status}
                  onChange={(e) => setEditUser((prev) => ({ ...prev, status: e.target.value as User['status'] }))}
                >
                  <option value="ACTIVE">Aktif</option>
                  <option value="INACTIVE">Pasif</option>
                  <option value="SUSPENDED">Askıda</option>
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={closeEditModal} className="btn-secondary">
                  İptal
                </button>
                <button
                  onClick={handleUpdateUser}
                  disabled={isSubmitting}
                  className="btn-primary disabled:opacity-50"
                >
                  {isSubmitting ? 'Güncelleniyor...' : 'Kaydet'}
                </button>
              </div>
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
};

export default UsersPage;
