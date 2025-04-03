import { ChangeEvent } from 'react';

interface FormInputProps {
  type: 'text' | 'date' | 'select';
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  label: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  error?: boolean;
  errorMessage?: string;
}

export const FormInput = ({
  type,
  name,
  value,
  onChange,
  label,
  placeholder,
  options,
  error,
  errorMessage = 'Обязательное поле',
}: FormInputProps) => {
  const baseClasses = `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition ${
    error ? 'border-red-500' : 'border-gray-300'
  }`;

  return (
    <div className="mb-5">
      <label className="block text-gray-700 font-medium mb-2">{label}</label>
      
      {type === 'select' ? (
        <select name={name} value={value} onChange={onChange} className={baseClasses}>
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className={baseClasses}
          placeholder={placeholder}
        />
      )}
      
      {error && <span className="text-red-500 text-sm mt-1 block">{errorMessage}</span>}
    </div>
  );
};
