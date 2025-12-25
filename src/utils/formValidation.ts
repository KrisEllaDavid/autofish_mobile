// Form validation utilities to prevent SQL injection and ensure data integrity

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate email format
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'L\'email est requis' };
  }

  // Email regex pattern
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Format d\'email invalide' };
  }

  // Check for suspicious patterns
  if (email.includes('<') || email.includes('>') || email.includes(';') || email.includes('--')) {
    return { isValid: false, error: 'Caractères non autorisés dans l\'email' };
  }

  return { isValid: true };
};

/**
 * Validate phone number (9 digits)
 */
export const validatePhone = (phone: string): ValidationResult => {
  if (!phone || phone.trim() === '') {
    return { isValid: false, error: 'Le numéro de téléphone est requis' };
  }

  // Remove spaces and dashes for validation
  const cleanPhone = phone.replace(/[\s-]/g, '');

  // Must be exactly 9 digits
  const phoneRegex = /^[0-9]{9}$/;

  if (!phoneRegex.test(cleanPhone)) {
    return { isValid: false, error: 'Le numéro doit contenir exactement 9 chiffres' };
  }

  return { isValid: true };
};

/**
 * Validate name (first name or last name)
 * Allows letters, spaces, hyphens, and apostrophes only
 */
export const validateName = (name: string, fieldName: string = 'Nom'): ValidationResult => {
  if (!name || name.trim() === '') {
    return { isValid: false, error: `${fieldName} est requis` };
  }

  // Must be at least 2 characters
  if (name.trim().length < 2) {
    return { isValid: false, error: `${fieldName} doit contenir au moins 2 caractères` };
  }

  // Only letters, spaces, hyphens, and apostrophes allowed
  // Supports accented characters (àâäéèêëïîôùûüÿç etc.)
  const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;

  if (!nameRegex.test(name)) {
    return { isValid: false, error: `${fieldName} ne peut contenir que des lettres, espaces, tirets et apostrophes` };
  }

  // Check for suspicious patterns (SQL injection attempts)
  const suspiciousPatterns = ['<', '>', ';', '--', '/*', '*/', 'script', 'select', 'insert', 'update', 'delete', 'drop'];
  const lowerName = name.toLowerCase();

  for (const pattern of suspiciousPatterns) {
    if (lowerName.includes(pattern)) {
      return { isValid: false, error: 'Caractères ou mots non autorisés détectés' };
    }
  }

  return { isValid: true };
};

/**
 * Validate password
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password || password.trim() === '') {
    return { isValid: false, error: 'Le mot de passe est requis' };
  }

  if (password.length < 8) {
    return { isValid: false, error: 'Le mot de passe doit contenir au moins 8 caractères' };
  }

  // Must contain at least one letter and one number
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasLetter || !hasNumber) {
    return { isValid: false, error: 'Le mot de passe doit contenir des lettres et des chiffres' };
  }

  return { isValid: true };
};

/**
 * Validate password confirmation
 */
export const validatePasswordConfirmation = (password: string, password2: string): ValidationResult => {
  if (!password2 || password2.trim() === '') {
    return { isValid: false, error: 'Veuillez confirmer votre mot de passe' };
  }

  if (password !== password2) {
    return { isValid: false, error: 'Les mots de passe ne correspondent pas' };
  }

  return { isValid: true };
};

/**
 * Validate city/address
 */
export const validateCity = (city: string): ValidationResult => {
  if (!city || city.trim() === '') {
    return { isValid: false, error: 'La ville est requise' };
  }

  if (city.trim().length < 2) {
    return { isValid: false, error: 'La ville doit contenir au moins 2 caractères' };
  }

  // Only letters, numbers, spaces, hyphens, and common punctuation
  const cityRegex = /^[a-zA-ZÀ-ÿ0-9\s',-\.]+$/;

  if (!cityRegex.test(city)) {
    return { isValid: false, error: 'Format de ville invalide' };
  }

  // Check for suspicious patterns
  const suspiciousPatterns = ['<', '>', ';', '--', '/*', '*/', 'script', 'select', 'insert', 'update', 'delete', 'drop'];
  const lowerCity = city.toLowerCase();

  for (const pattern of suspiciousPatterns) {
    if (lowerCity.includes(pattern)) {
      return { isValid: false, error: 'Caractères ou mots non autorisés détectés' };
    }
  }

  return { isValid: true };
};

/**
 * Validate country
 */
export const validateCountry = (country: string): ValidationResult => {
  if (!country || country.trim() === '') {
    return { isValid: false, error: 'Le pays est requis' };
  }

  return { isValid: true };
};

/**
 * Sanitize string input (remove dangerous characters)
 */
export const sanitizeString = (input: string): string => {
  if (!input) return '';

  // Remove HTML tags and dangerous characters
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>;'"]/g, '') // Remove potentially dangerous characters
    .trim();
};

/**
 * Validate entire registration form
 */
export interface RegistrationFormData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password2: string;
  phone: string;
  city: string;
  country: string;
  terms_accepted: boolean;
}

export const validateRegistrationForm = (formData: RegistrationFormData): ValidationResult => {
  // Validate first name
  const firstNameResult = validateName(formData.first_name, 'Prénom');
  if (!firstNameResult.isValid) return firstNameResult;

  // Validate last name
  const lastNameResult = validateName(formData.last_name, 'Nom');
  if (!lastNameResult.isValid) return lastNameResult;

  // Validate email
  const emailResult = validateEmail(formData.email);
  if (!emailResult.isValid) return emailResult;

  // Validate phone
  const phoneResult = validatePhone(formData.phone);
  if (!phoneResult.isValid) return phoneResult;

  // Validate password
  const passwordResult = validatePassword(formData.password);
  if (!passwordResult.isValid) return passwordResult;

  // Validate password confirmation
  const password2Result = validatePasswordConfirmation(formData.password, formData.password2);
  if (!password2Result.isValid) return password2Result;

  // Validate city
  const cityResult = validateCity(formData.city);
  if (!cityResult.isValid) return cityResult;

  // Validate country
  const countryResult = validateCountry(formData.country);
  if (!countryResult.isValid) return countryResult;

  // Validate terms acceptance
  if (!formData.terms_accepted) {
    return { isValid: false, error: 'Vous devez accepter les conditions d\'utilisation' };
  }

  return { isValid: true };
};
