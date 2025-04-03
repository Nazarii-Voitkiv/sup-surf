export interface FormData {
  name: string;
  date: string;
  type: string;
  phone: string;
  confirmationId?: string;
  telegramUsername?: string;
}

export type FormErrors = Record<keyof Omit<FormData, 'confirmationId' | 'telegramUsername'>, boolean>;

export interface TourData {
  id: string;
  title: string;
  image: string;
  location: string;
  duration: string;
  price: number;
  description: string;
  badge?: {
    text: string;
    color: string;
  };
}
