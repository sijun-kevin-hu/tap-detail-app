"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useClients } from '@/hooks/useClients';
import { Client } from '@/lib/models/client';
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  ArrowLeftIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import ClientCard from '@/components/clients/ClientCard';
import AddClientModal from '@/components/clients/AddClientModal';
import ClientDetailsModal from '@/components/clients/ClientDetailsModal';
import Toast from '@/components/Toast';
import { formatDate, formatTime, getStatusColor } from '@/utils/formatters';

export default function ClientsPage() {
  const router = useRouter();
  const {
    filteredClients,
    loading,
    searchTerm,
    formData,
    formErrors,
    submitting,
    toastMessage,
    toastVisible,
    setSearchTerm,
    setFormData,
    setFormErrors,
    handleAddClient,
    handleUpdateClient,
    handleDeleteClient,
    resetForm,
    hideToast
  } = useClients();
  
  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showClientModal, setShowClientModal] = useState(false);

  const openClientModal = (client: Client) => {
    setSelectedClient(client);
    setShowClientModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  const closeClientModal = () => {
    setShowClientModal(false);
    setSelectedClient(null);
  };

  const handleUpdateClientWithClose = async (clientId: string, updatedData: Partial<Client>) => {
    await handleUpdateClient(clientId, updatedData);
    closeClientModal();
  };

  const handleDeleteClientWithClose = async (clientId: string) => {
    await handleDeleteClient(clientId);
    closeClientModal();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/admin')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Clients</h1>
            <button
              onClick={() => setShowAddModal(true)}
              className="p-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition"
            >
              <PlusIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Clients List */}
        {filteredClients.length === 0 ? (
          <div className="text-center py-12">
            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first client'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary"
              >
                Add Your First Client
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredClients.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                onClick={openClientModal}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <AddClientModal
          isOpen={showAddModal}
          onClose={closeAddModal}
          onSubmit={handleAddClient}
          formData={formData}
          setFormData={setFormData}
          formErrors={formErrors}
          setFormErrors={setFormErrors}
          submitting={submitting}
        />
      )}

      {/* Client Details Modal */}
      {selectedClient && showClientModal && (
        <ClientDetailsModal
          client={selectedClient}
          isOpen={showClientModal}
          onClose={closeClientModal}
          onUpdate={handleUpdateClientWithClose}
          onDelete={handleDeleteClientWithClose}
          submitting={submitting}
          formatDate={formatDate}
          formatTime={formatTime}
          getStatusColor={getStatusColor}
        />
      )}

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        show={toastVisible}
        onClose={hideToast}
      />
    </div>
  );
} 