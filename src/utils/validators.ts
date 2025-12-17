// ============================================
// Form Validation Utilities
// ============================================

export const validators = {
  // Email validation
  email: (value: string): string | null => {
    if (!value) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Invalid email format';
    return null;
  },

  // Phone validation (simple)
  phone: (value: string): string | null => {
    if (!value) return 'Phone number is required';
    const phoneRegex = /^[0-9]{8,15}$/;
    if (!phoneRegex.test(value.replace(/[\s-]/g, ''))) {
      return 'Invalid phone number (8-15 digits)';
    }
    return null;
  },

  // Email or Phone
  emailOrPhone: (value: string): string | null => {
    if (!value) return 'Email or phone is required';
    
    // Try email first
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(value)) return null;
    
    // Try phone
    const phoneRegex = /^[0-9]{8,15}$/;
    if (phoneRegex.test(value.replace(/[\s-]/g, ''))) return null;
    
    return 'Enter a valid email or phone number';
  },

  // PIN validation (4-6 digits)
  pin: (value: string): string | null => {
    if (!value) return 'PIN is required';
    if (!/^[0-9]{4,6}$/.test(value)) {
      return 'PIN must be 4-6 digits';
    }
    return null;
  },

  // OTP validation
  otp: (value: string): string | null => {
    if (!value) return 'OTP is required';
    if (!/^[0-9]{6}$/.test(value)) {
      return 'OTP must be 6 digits';
    }
    return null;
  },

  // National ID
  nationalId: (value: string): string | null => {
    if (!value) return 'National ID is required';
    if (value.length < 5) return 'National ID is too short';
    return null;
  },

  // Required field
  required: (value: string | number | boolean): string | null => {
    if (value === '' || value === null || value === undefined) {
      return 'This field is required';
    }
    return null;
  },

  // Minimum length
  minLength: (min: number) => (value: string): string | null => {
    if (!value) return 'This field is required';
    if (value.length < min) return `Minimum ${min} characters required`;
    return null;
  },

  // Number range
  numberRange: (min: number, max: number) => (value: number): string | null => {
    if (value < min || value > max) {
      return `Value must be between ${min} and ${max}`;
    }
    return null;
  },

  // Positive number
  positiveNumber: (value: number): string | null => {
    if (value <= 0) return 'Value must be greater than 0';
    return null;
  },

  // Date validation (not future)
  dateNotFuture: (value: string): string | null => {
    if (!value) return 'Date is required';
    const date = new Date(value);
    if (date > new Date()) return 'Date cannot be in the future';
    return null;
  },

  // Age validation (18+)
  minimumAge: (minAge: number) => (dateOfBirth: string): string | null => {
    if (!dateOfBirth) return 'Date of birth is required';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      if (age - 1 < minAge) return `You must be at least ${minAge} years old`;
    } else {
      if (age < minAge) return `You must be at least ${minAge} years old`;
    }
    
    return null;
  }
};

// Composite validation
export function validateForm<T extends Record<string, any>>(
  data: T,
  rules: Partial<Record<keyof T, ((value: any) => string | null)[]>>
): Record<keyof T, string | null> {
  const errors: any = {};

  for (const field in rules) {
    const fieldRules = rules[field];
    if (fieldRules) {
      for (const rule of fieldRules) {
        const error = rule(data[field]);
        if (error) {
          errors[field] = error;
          break; // Stop at first error
        }
      }
    }
  }

  return errors;
}

// Check if form has errors
export function hasErrors(errors: Record<string, string | null>): boolean {
  return Object.values(errors).some(error => error !== null);
}
