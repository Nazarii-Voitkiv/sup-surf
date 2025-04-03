export interface FormData {
  name: string;
  contact: string;
  date: string;
  type: string;
}

export type FormErrors = Record<keyof FormData, boolean>;

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
