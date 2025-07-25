import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  getClients,
  addClient,
  updateClient,
  deleteClient,
} from '@/lib/firebase/firestore-clients';
import { getAppointments } from '@/lib/firebase/firestore-appointments';
import { Client, ClientFormData } from '@/lib/models/client';
import { Appointment } from '@/lib/models/appointment';

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

  // Load clients, appointments, and earnings
  useEffect(() => {
    if (firebaseUser?.uid) {
      (async () => { await loadClientsAndStats(); })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Helper: match appointment to client
  const isAppointmentForClient = (client: Client, appt: Appointment) => {
    // Use phone as the unique identifier if present, otherwise fallback to email
    if (client.phone && appt.clientPhone) {
      return client.phone === appt.clientPhone;
    } else if (client.email && appt.clientEmail) {
      return client.email === appt.clientEmail;
    }
    return false;
  };

  // Main loader
  const loadClientsAndStats = async () => {
    if (!firebaseUser?.uid) return;
    try {
      setLoading(true);
      // Fetch all in parallel
      const [clientsData, appointments] = await Promise.all([
        getClients(firebaseUser.uid),
        getAppointments(firebaseUser.uid),
      ]);
      // Enrich clients
      const enrichedClients = clientsData.map(client => {
        // Appointments for this client
        const clientAppointments = appointments.filter(appt => isAppointmentForClient(client, appt));
        const totalAppointments = clientAppointments.length;
        // Map to AppointmentSummary[] for currentAppointments
        const currentAppointments = clientAppointments
          .filter(appt => ['pending', 'confirmed', 'in-progress'].includes(appt.status))
          .map(appt => ({
            id: appt.id,
            service: appt.service,
            date: appt.date,
            time: appt.time,
            price: appt.price,
            status: appt.status as 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'archived',
            address: appt.address,
          }));
        // Last service date
        const lastServiceDate = clientAppointments.length > 0
          ? clientAppointments.reduce((latest, appt) => appt.date > latest ? appt.date : latest, '')
          : undefined;
        return {
          ...client,
          totalAppointments,
          currentAppointments,
          lastServiceDate,
        };
      });
      setClients(enrichedClients);
    } catch (error) {
      console.error('Error loading clients or stats:', error);
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
      loadClientsAndStats(); // Reload clients
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
      loadClientsAndStats(); // Reload clients
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
      loadClientsAndStats(); // Reload clients
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
    loadClientsAndStats
  };
} 