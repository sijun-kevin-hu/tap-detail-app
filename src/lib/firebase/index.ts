// Firebase client exports
export { default as app, db, auth, storage } from './client-app';

// Firestore settings exports
export {
  getServices,
  addService,
  updateService,
  deleteService,
  reorderServices,
  getProfile,
  updateProfile,
  convertServiceToFirestore,
  convertFirestoreToService,
  type FirestoreService,
  type FirestoreProfile
} from './firestore-settings';

// Firestore detailer exports
export {
  getDetailer,
  getDetailerByBusinessId,
  createDetailer,
  updateDetailer,
  updateDetailerProfile,
  getAllDetailers,
  getActiveDetailers,
  updateDetailerProfileImage,
  addDetailerGalleryImage,
  removeDetailerGalleryImage,
  updateDetailerBio,
  createBaseServices,
  type FirestoreDetailer
} from './firestore-detailers';

// Firestore client exports
export {
  getClients,
  getClientById,
  addClient,
  updateClient,
  deleteClient,
  findClientByPhone,
  autoCreateClientFromAppointment
} from './firestore-clients';

// Firestore appointment exports (client-safe only)
export {
  getAppointments,
  getAppointmentsByStatus,
  getAppointmentsForDate
} from './firestore-appointments'; 