// Firebase client exports
export { app, db, auth } from './client-app';

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

// Firestore appointment exports
export {
  getAppointments,
  getAppointmentsByStatus,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getAppointment,
  updateAppointmentStatus,
  type Appointment,
  type NewAppointment,
  type FirestoreAppointment
} from './firestore-appointments'; 