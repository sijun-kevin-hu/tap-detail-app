export interface Earning {
  id: string;
  date: string; // YYYY-MM-DD
  clientName: string;
  service: string;
  price: number;
  appointmentId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface NewEarning {
  date: string;
  clientName: string;
  service: string;
  price: number;
  appointmentId?: string;
} 