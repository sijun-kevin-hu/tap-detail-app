import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { 
  getClients, 
  addClient, 
  updateClient, 
  deleteClient 
} from '@/lib/firebase';
import { Client, ClientFormData } from '@/lib/models/client';

export function useClients() {
  const { firebaseUser } = useAuth();
  
  // State
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<ClientFormData>({
    fullName: '',
    phone: '',
    email: '',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Load clients
  useEffect(() => {
    if (firebaseUser?.uid) {
      loadClients();
    }
  }, [firebaseUser?.uid]);

  // Filter clients based on search
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredClients(clients);
    } else {
      const filtered = clients.filter(client =>
        client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone.includes(searchTerm) ||
        (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredClients(filtered);
    }
  }, [clients, searchTerm]);

  const loadClients = async () => {
    if (!firebaseUser?.uid) return;
    
    try {
      setLoading(true);
      const clientsData = await getClients(firebaseUser.uid);
      setClients(clientsData);
    } catch (error) {
      console.error('Error loading clients:', error);
      setToastMessage('Failed to load clients');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser?.uid) return;

    try {
      setSubmitting(true);
      await addClient(firebaseUser.uid, {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || '',
        notes: formData.notes.trim() || '',
        source: 'manual'
      });

      setToastMessage('Client added successfully!');
      setShowToast(true);
      resetForm();
      loadClients(); // Reload clients
    } catch (error) {
      console.error('Error adding client:', error);
      setToastMessage('Failed to add client');
      setShowToast(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateClient = async (clientId: string, updatedData: Partial<Client>) => {
    if (!firebaseUser?.uid) return;

    try {
      setSubmitting(true);
      await updateClient(firebaseUser.uid, clientId, updatedData);
      setToastMessage('Client updated successfully!');
      setShowToast(true);
      loadClients(); // Reload clients
    } catch (error) {
      console.error('Error updating client:', error);
      setToastMessage('Failed to update client');
      setShowToast(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!firebaseUser?.uid) return;

    if (!confirm('Are you sure you want to delete this client?')) return;

    try {
      setSubmitting(true);
      await deleteClient(firebaseUser.uid, clientId);
      setToastMessage('Client deleted successfully!');
      setShowToast(true);
      loadClients(); // Reload clients
    } catch (error) {
      console.error('Error deleting client:', error);
      setToastMessage('Failed to delete client');
      setShowToast(true);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      phone: '',
      email: '',
      notes: ''
    });
    setFormErrors([]);
  };

  const displayToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const hideToast = () => {
    setShowToast(false);
  };

  return {
    // State
    clients,
    filteredClients,
    loading,
    searchTerm,
    formData,
    formErrors,
    submitting,
    showToast: displayToast,
    hideToast,
    toastMessage,
    toastVisible: showToast,
    
    // Actions
    setSearchTerm,
    setFormData,
    setFormErrors,
    handleAddClient,
    handleUpdateClient,
    handleDeleteClient,
    resetForm,
    loadClients
  };
} 