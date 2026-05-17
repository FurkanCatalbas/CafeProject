import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, MapPin, Users, CheckCircle } from 'lucide-react';
import { placesService } from '../../services/placesService';
import ModalOverlay from '../../components/common/ModalOverlay';

interface Place {
  id: number;
  name: string;
  managerId: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLOSED';
  managerName: string;
}

const PlacesPage: React.FC = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPlaceId, setEditingPlaceId] = useState<number | null>(null);
  const [newPlace, setNewPlace] = useState({
    name: '',
    managerId: '',
    status: 'AVAILABLE' as Place['status'],
  });
  const [editPlace, setEditPlace] = useState({
    name: '',
    managerId: '',
    status: 'AVAILABLE' as Place['status'],
  });

  const loadPlaces = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await placesService.getAll();
      setPlaces(
        (data || []).map((item: any) => ({
          id: item.id,
          name: item.name,
          managerId: item.managerId ?? 0,
          status: item.status ?? 'AVAILABLE',
          managerName: `Yönetici #${item.managerId ?? '-'}`,
        }))
      );
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Masalar backend tarafından alınamadı.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlaces();
  }, []);

  const resetNewPlace = () => {
    setNewPlace({
      name: '',
      managerId: '',
      status: 'AVAILABLE',
    });
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setIsSubmitting(false);
    resetNewPlace();
  };

  const handleCreatePlace = async () => {
    const managerId = Number(newPlace.managerId);
    if (!newPlace.name.trim() || !Number.isFinite(managerId) || managerId <= 0) {
      setError('Masa oluşturmak için ad ve geçerli yönetici numarası zorunludur.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await placesService.create({
        name: newPlace.name.trim(),
        managerId,
        status: newPlace.status,
      });
      await loadPlaces();
      closeCreateModal();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Masa oluşturulamadı.');
      setIsSubmitting(false);
    }
  };

  const handleDeletePlace = async (id: number) => {
    const confirmed = window.confirm('Bu masayı silmek istiyor musunuz?');
    if (!confirmed) {
      return;
    }

    setError(null);
    try {
      await placesService.delete(id);
      await loadPlaces();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Masa silinemedi.');
    }
  };

  const handleOpenEditPlace = (place: Place) => {
    setEditingPlaceId(place.id);
    setEditPlace({
      name: place.name,
      managerId: String(place.managerId),
      status: place.status,
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingPlaceId(null);
    setIsSubmitting(false);
  };

  const handleUpdatePlace = async () => {
    if (!editingPlaceId) {
      return;
    }

    const managerId = Number(editPlace.managerId);
    if (!editPlace.name.trim() || !Number.isFinite(managerId) || managerId <= 0) {
      setError('Masa güncellemek için ad ve geçerli yönetici numarası zorunludur.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await placesService.update({
        id: editingPlaceId,
        name: editPlace.name.trim(),
        managerId,
        status: editPlace.status,
      });
      await loadPlaces();
      closeEditModal();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Masa güncellenemedi.');
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-600';
      case 'OCCUPIED': return 'bg-blue-600';
      case 'RESERVED': return 'bg-yellow-600';
      case 'CLOSED': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return CheckCircle;
      case 'OCCUPIED': return Users;
      case 'RESERVED': return MapPin;
      case 'CLOSED': return MapPin;
      default: return MapPin;
    }
  };

  const getStatusLabel = (status: Place['status']) => {
    switch (status) {
      case 'AVAILABLE': return 'Müsait';
      case 'OCCUPIED': return 'Dolu';
      case 'RESERVED': return 'Rezerve';
      case 'CLOSED': return 'Kapalı';
      default: return status;
    }
  };

  const filteredPlaces = places.filter(place => {
    const matchesSearch = place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         place.managerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || place.status === statusFilter;
    return matchesSearch && matchesStatus;
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Masalar</h1>
          <p className="text-gray-600">Kafe alanlarınızı yönetin</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Masa Ekle
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
            placeholder="Masalarda ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10 w-full"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field"
        >
          <option value="all">Tüm Durumlar</option>
          <option value="AVAILABLE">Müsait</option>
          <option value="OCCUPIED">Dolu</option>
          <option value="RESERVED">Rezerve</option>
          <option value="CLOSED">Kapalı</option>
        </select>
      </div>

      {/* Masa Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlaces.map((place) => {
          const StatusIcon = getStatusIcon(place.status);
          return (
            <div key={place.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
                  <StatusIcon className="w-6 h-6 text-white" />
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(place.status)}`}>
                  {getStatusLabel(place.status)}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{place.name}</h3>
              <div className="flex items-center gap-2 text-gray-500 mb-4">
                <Users className="w-4 h-4" />
                <span className="text-sm">Yönetici: {place.managerName}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenEditPlace(place)}
                  className="btn-secondary flex-1 text-sm flex items-center justify-center gap-1"
                >
                  <Edit className="w-4 h-4" />
                  Düzenle
                </button>
                <button
                  onClick={() => handleDeletePlace(place.id)}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
        {filteredPlaces.length === 0 && (
          <div className="col-span-full rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
            Masa bulunamadı.
          </div>
        )}
      </div>

      {/* Masa Ekleme Modalı */}
      {showCreateModal && (
        <ModalOverlay>
          <div className="bg-white border border-gray-200 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Yeni Masa Ekle</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Masa Adı"
                value={newPlace.name}
                onChange={(e) => setNewPlace((prev) => ({ ...prev, name: e.target.value }))}
                className="input-field w-full"
              />
              <input
                type="number"
                min={1}
                placeholder="Yönetici numarası"
                value={newPlace.managerId}
                onChange={(e) => setNewPlace((prev) => ({ ...prev, managerId: e.target.value }))}
                className="input-field w-full"
              />
              <select
                className="input-field w-full"
                value={newPlace.status}
                onChange={(e) => setNewPlace((prev) => ({ ...prev, status: e.target.value as Place['status'] }))}
              >
                <option value="AVAILABLE">Müsait</option>
                <option value="OCCUPIED">Dolu</option>
                <option value="RESERVED">Rezerve</option>
                <option value="CLOSED">Kapalı</option>
              </select>
              <div className="flex justify-end gap-3">
                <button
                  onClick={closeCreateModal}
                  className="btn-secondary"
                >
                  İptal
                </button>
                <button
                  onClick={handleCreatePlace}
                  disabled={isSubmitting}
                  className="btn-primary disabled:opacity-50"
                >
                  {isSubmitting ? 'Ekleniyor...' : 'Masa Ekle'}
                </button>
              </div>
            </div>
          </div>
        </ModalOverlay>
      )}

      {showEditModal && (
        <ModalOverlay>
          <div className="bg-white border border-gray-200 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Masa Düzenle</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Masa Adı"
                value={editPlace.name}
                onChange={(e) => setEditPlace((prev) => ({ ...prev, name: e.target.value }))}
                className="input-field w-full"
              />
              <input
                type="number"
                min={1}
                placeholder="Yönetici numarası"
                value={editPlace.managerId}
                onChange={(e) => setEditPlace((prev) => ({ ...prev, managerId: e.target.value }))}
                className="input-field w-full"
              />
              <select
                className="input-field w-full"
                value={editPlace.status}
                onChange={(e) => setEditPlace((prev) => ({ ...prev, status: e.target.value as Place['status'] }))}
              >
                <option value="AVAILABLE">Müsait</option>
                <option value="OCCUPIED">Dolu</option>
                <option value="RESERVED">Rezerve</option>
                <option value="CLOSED">Kapalı</option>
              </select>
              <div className="flex justify-end gap-3">
                <button onClick={closeEditModal} className="btn-secondary">
                  İptal
                </button>
                <button
                  onClick={handleUpdatePlace}
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

export default PlacesPage;
