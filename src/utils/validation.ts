import { FormData } from "@/types";

export const PATTERNS = {
  NAME: "^[А-Яа-яЁёA-Za-z\\s-]{2,50}$",
  PHONE: "^\\+?[0-9]+$",
};

export function getMinDate(): string {
  return new Date().toISOString().split('T')[0];
}

export function getMaxDate(): string {
  const date = new Date();
  date.setMonth(date.getMonth() + 3);
  return date.toISOString().split('T')[0];
}

export function validateForm(data: FormData) {
  const errors = {
    name: false,
    phone: false,
    date: false,
    time: false,
    type: false,
  };
  
  errors.name = !data.name || !new RegExp(PATTERNS.NAME).test(data.name);
  
  const cleanedPhone = data.phone.replace(/[^0-9+]/g, '');
  errors.phone = cleanedPhone.length < 10 || cleanedPhone.length > 12 || 
                (cleanedPhone.includes('+') && cleanedPhone.indexOf('+') !== 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  errors.date = !data.date || new Date(data.date) < today;
  
  errors.time = !data.time;
  errors.type = !data.type;
  
  return {
    isValid: !Object.values(errors).some(Boolean),
    errors
  };
}

export function normalizePhone(phone: string): string {
  const digitsOnly = phone.replace(/[^0-9+]/g, '');
  
  if (digitsOnly.startsWith('+')) return digitsOnly;
  
  if (digitsOnly.startsWith('8') && digitsOnly.length === 11)
    return `+7${digitsOnly.substring(1)}`;
  
  if (digitsOnly.length === 10) return `+7${digitsOnly}`;
  
  return `+${digitsOnly}`;
}

export function formatPhone(phone: string): string {
  return phone.replace(/[^0-9+]/g, '');
}
