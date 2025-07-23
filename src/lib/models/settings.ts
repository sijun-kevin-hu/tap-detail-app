// Settings page models and types

import { AvailabilitySettings } from './detailer';

export interface ProfileSettings {
  businessName: string;
  bio: string;
  profileImage: string | null;
  galleryImages: string[];
  location?: string;
}

// Extended detailer interface for settings
export interface DetailerSettings extends ProfileSettings {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  availability?: AvailabilitySettings;
}

export interface ServiceImage {
  id: string;
  url: string;
  alt?: string;
}

export interface ServiceTag {
  id: string;
  name: string;
  color?: string;
}

export interface ServiceMenu {
  id: number;
  documentId: string; // Firestore document ID
  name: string;
  description: string;
  duration: number;
  durationUnit: 'min' | 'hr';
  price: string; // was: number
  category: ServiceCategory;
  image: string;
  active: boolean;
  buffer: number;
  maxBookings: number;
  requireConfirmation: boolean;
  tags: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export type ServiceCategory = 'Interior' | 'Exterior' | 'Interior/Exterior';

export interface NewService {
  name: string;
  description: string;
  duration: number;
  durationUnit: 'min' | 'hr';
  price: string; // was: number
  category: ServiceCategory;
  image: string;
  active: boolean;
  buffer: number;
  maxBookings: number;
  requireConfirmation: boolean;
  tags: string[];
}

export interface ServiceFormData {
  name: string;
  description: string;
  duration: number;
  durationUnit: 'min' | 'hr';
  price: string; // was: number
  category: ServiceCategory;
  image: string;
  active: boolean;
  buffer: number;
  maxBookings: number;
  requireConfirmation: boolean;
  tags: string[];
}

export interface SettingsState {
  profile: ProfileSettings;
  services: ServiceMenu[];
  profileOpen: boolean;
  servicesOpen: boolean;
  addServiceOpen: boolean;
  draggedServiceIndex: number | null;
}

export interface ServiceChangeHandler {
  (index: number, field: keyof ServiceMenu, value: string | number | boolean): void;
}

export interface ServiceDeleteHandler {
  (index: number): void;
}

export interface ServiceAddHandler {
  (service: NewService): void;
}

// Default values
export const defaultProfileSettings: ProfileSettings = {
  businessName: '',
  bio: '',
  profileImage: null,
  galleryImages: [],
};

export const defaultNewService: NewService = {
  name: '',
  description: '',
  duration: 60,
  durationUnit: 'min',
  price: '0',
  category: 'Exterior',
  image: '',
  active: true,
  buffer: 0,
  maxBookings: 1,
  requireConfirmation: false,
  tags: ['Exterior'],
};

export const serviceCategories: ServiceCategory[] = ['Interior', 'Exterior', 'Interior/Exterior'];

export const durationUnits = ['min', 'hr'] as const; 