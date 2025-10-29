import { UserData } from '../context/AuthContext';
import { UserRegistrationRequest } from '../services/api';

// Category mapping - maps category names to their API indices
const CATEGORY_MAPPING: { [key: string]: number } = {
  'Produits agricoles': 0,
  'Poissons': 1,
  'Fruits de mer': 2,
  'Épices': 3,
  'Légumes': 4,
  'Céréales': 5,
};

/**
 * Get the category mapping for external use
 */
export const getCategoryMapping = (): { [key: string]: number } => {
  return { ...CATEGORY_MAPPING };
};

/**
 * Converts a base64 image string to a File object
 */
export const base64ToFile = (base64String: string, filename: string = 'avatar.jpg'): File => {
  const arr = base64String.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, { type: mime });
};

/**
 * Splits a full name into first name and last name
 */
export const splitName = (fullName: string): { firstName: string; lastName: string } => {
  const names = fullName.trim().split(' ');
  if (names.length === 1) {
    return { firstName: names[0], lastName: '' };
  }
  
  const firstName = names[0];
  const lastName = names.slice(1).join(' ');
  
  return { firstName, lastName };
};

/**
 * Splits address field into city and address components
 * Expected format: "City, Address" or "City"
 */
export const splitAddress = (fullAddress: string): { city: string; address: string } => {
  const parts = fullAddress.trim().split(',');
  
  if (parts.length === 1) {
    // Only one part provided - use it as both city and address
    const city = parts[0].trim();
    return { city, address: city }; // Use the same value for both
  }
  
  // City is first part, address is the rest
  const city = parts[0].trim();
  const address = parts.slice(1).join(',').trim();
  
  return { city, address };
};

/**
 * Maps category names to their corresponding indices for the API
 */
export const mapCategoriesToIndices = (categoryNames: string[]): number[] => {
  const categoryMap: Record<string, number> = {
    'Produits agricoles': 0,
    'Poissons': 1,
    'Fruits de mer': 2,
    'Épices': 3,
    'Légumes': 4,
    'Céréales': 5,
  };

  return categoryNames.map(categoryName => {
    const index = categoryMap[categoryName];
    if (index !== undefined) {
      return index;
    }
    // If category not found, log warning and skip instead of forcing 0
    console.warn(`Category "${categoryName}" not found in static mapping; skipping.`);
    return -1;
  }).filter(idx => idx >= 0);
};

/**
 * Normalize selected category identifiers to numeric IDs.
 * If values are numeric strings, convert to numbers. If not,
 * fall back to static name mapping.
 */
const normalizeCategoryIds = (selected?: string[]): number[] => {
  if (!selected || selected.length === 0) return [];
  const numericIds: number[] = [];
  const unmappedNames: string[] = [];
  for (const val of selected) {
    const num = Number(val);
    if (!Number.isNaN(num)) {
      numericIds.push(num);
    } else if (val && val.trim().length > 0) {
      unmappedNames.push(val.trim());
    }
  }
  if (unmappedNames.length > 0) {
    numericIds.push(...mapCategoriesToIndices(unmappedNames));
  }
  return numericIds;
};

/**
 * Parses UserData to UserRegistrationRequest for client signup
 */
export const parseUserDataForClientRegistration = (
  userData: UserData, 
  password: string
): UserRegistrationRequest => {
  
  // Split the full name
  const { firstName, lastName } = splitName(userData.name || '');
  
  // Handle profile picture - keep as File or base64 string
  let profilePicture: File | string | undefined;
  if (userData.profile_picture instanceof File) {
    profilePicture = userData.profile_picture as File;
  } else if (userData.avatar && userData.avatar.startsWith('data:image/')) {
    profilePicture = userData.avatar; // Keep as base64 string, API service will convert
  }

  // Map user role to API format
  const userType = userData.userRole === 'producteur' ? 'producer' : 'consumer';
  
  // Format phone number with country code
  let formattedPhone: string | undefined;
  if (userData.phone && userData.code) {
    // Remove any spaces and non-digits from phone
    const cleanPhone = userData.phone.replace(/\D/g, '');
    
    // Check if phone already starts with country code (without +)
    const codeWithoutPlus = userData.code.replace('+', '');
    if (cleanPhone.startsWith(codeWithoutPlus)) {
      // Phone already includes country code
      formattedPhone = `+${cleanPhone}`;
    } else {
      // Combine country code with phone number
      formattedPhone = `${userData.code}${cleanPhone}`;
    }
  } else if (userData.phone) {
    formattedPhone = userData.phone;
  }
  
  // Prefer explicit city from signup; fallback to splitting address if provided
  const explicitCity = userData.city || '';
  let derivedCity = '';
  let derivedAddress = '';
  if (userData.address && userData.address !== userData.city) {
    const split = splitAddress(userData.address);
    derivedCity = split.city;
    derivedAddress = split.address;
  }
  const city = explicitCity || derivedCity;
  const address = userData.address || derivedAddress || explicitCity; // ensure at least city is sent if address empty
  
  // Prefer using category IDs if available; fallback to static name mapping
  const categoryIndices = userData.selectedCategories ? normalizeCategoryIds(userData.selectedCategories) : [];
  
  const registrationData: UserRegistrationRequest = {
    email: userData.email || '',
    password: password,
    password2: password, // Confirm password (same as password)
    first_name: firstName,
    last_name: lastName,
    phone: formattedPhone || '',
    city: city,
    user_type: userType,
    terms_accepted: true, // User already accepted terms in signup flow
    profile_picture: profilePicture, // Send as File
    country: userData.country || '',
    address: address || city,
    description: userData.description || '',
    categories: categoryIndices,
    recto_id: undefined, // Not required for consumers
    verso_id: undefined  // Not required for consumers
  };
  
  // Validate phone number length (API limit is 15 characters)
  if (registrationData.phone && registrationData.phone.length > 15) {
    console.warn('Phone number too long, truncating:', registrationData.phone);
    registrationData.phone = registrationData.phone.substring(0, 15);
  }
  
  // Debug: Log the registration data being sent
  console.log('Client registration data:', registrationData);
  
  return registrationData;
};

/**
 * Parses UserData to UserRegistrationRequest for producer signup
 */
export const parseUserDataForProducerRegistration = (
  userData: UserData, 
  password: string
): UserRegistrationRequest => {
  
  // Split the full name
  const { firstName, lastName } = splitName(userData.name || '');
  
  // Handle profile picture - keep as File or base64 string
  let profilePicture: File | string | undefined;
  if (userData.profile_picture instanceof File) {
    profilePicture = userData.profile_picture as File;
  } else if (userData.avatar && userData.avatar.startsWith('data:image/')) {
    profilePicture = userData.avatar; // Keep as base64 string, API service will convert
  }

  // Format phone number with country code
  let formattedPhone: string | undefined;
  if (userData.phone && userData.code) {
    // Remove any spaces and non-digits from phone
    const cleanPhone = userData.phone.replace(/\D/g, '');
    
    // Check if phone already starts with country code (without +)
    const codeWithoutPlus = userData.code.replace('+', '');
    if (cleanPhone.startsWith(codeWithoutPlus)) {
      // Phone already includes country code
      formattedPhone = `+${cleanPhone}`;
    } else {
      // Combine country code with phone number
      formattedPhone = `${userData.code}${cleanPhone}`;
    }
  } else if (userData.phone) {
    formattedPhone = userData.phone;
  }
  
  // For producers, use personal data first, then page data as fallback
  const pageData = userData.page || {};

  // Use personal address from signup form first (required for producer verification)
  let city = userData.city || '';
  let address = userData.address || '';

  // If no personal address but we have page address, use that as fallback
  if (!address && pageData.address) {
    address = pageData.address;
  }

  // If we still don't have city, try to split the address
  if (!city && address) {
    const split = splitAddress(address);
    city = split.city;
    // Keep full address for the address field
  }

  // Ensure we have at least city (use address as city if needed)
  if (!city && address) {
    city = address;
  }
  
  // Prefer using category IDs if available; fallback to static name mapping
  const categoryIndices = userData.selectedCategories ? normalizeCategoryIds(userData.selectedCategories) : [];
  
  // Handle ID verification images - keep as base64 strings, API service will convert
  let rectoIdFile: string | undefined;
  let versoIdFile: string | undefined;

  if (userData.idRecto && userData.idRecto.startsWith('data:image/')) {
    rectoIdFile = userData.idRecto; // Keep as base64 string
  }

  if (userData.idVerso && userData.idVerso.startsWith('data:image/')) {
    versoIdFile = userData.idVerso; // Keep as base64 string
  }
  
  // Use personal phone first (required for producer verification), then page data as fallback
  let finalPhone = formattedPhone;

  // If no personal phone but we have page phone, use that as fallback
  if (!finalPhone && pageData.phone && pageData.code) {
    const cleanPagePhone = pageData.phone.replace(/\D/g, '');
    const codeWithoutPlus = pageData.code.replace('+', '');
    if (cleanPagePhone.startsWith(codeWithoutPlus)) {
      finalPhone = `+${cleanPagePhone}`;
    } else {
      finalPhone = `${pageData.code}${cleanPagePhone}`;
    }
  }
  
  // Ensure phone number is properly formatted
  if (finalPhone) {
    // Remove any non-digit characters except +
    finalPhone = finalPhone.replace(/[^\d+]/g, '');
    
    // Ensure it starts with +
    if (!finalPhone.startsWith('+')) {
      finalPhone = `+${finalPhone}`;
    }
    
    // Limit to 15 characters (API limit)
    if (finalPhone.length > 15) {
      finalPhone = finalPhone.substring(0, 15);
    }
  }
  
  // Use personal country first (required for producer verification), then page data as fallback
  const finalCountry = userData.country || pageData.country || '';
  
  // Ensure description is not empty for producers
  const finalDescription = userData.description || 'Producteur sur AutoFish';
  
  // Use selected categories as-is; validation will enforce presence for producers
  const finalCategories = categoryIndices || [];
  
  const registrationData: UserRegistrationRequest = {
    email: userData.email || '',
    password: password,
    password2: password, // Confirm password (same as password)
    first_name: firstName,
    last_name: lastName,
    phone: finalPhone || '',
    city: city,
    user_type: 'producer', // Always producer for this function
    terms_accepted: true, // User already accepted terms in signup flow
    profile_picture: profilePicture, // Send as File
    country: finalCountry,
    address: address,
    description: finalDescription, // Required for producers
    categories: finalCategories,
    recto_id: rectoIdFile, // Send as base64 string, API will convert
    verso_id: versoIdFile  // Send as base64 string, API will convert
  };
  
  // Ensure all required fields are present and not empty
  const requiredFields = ['email', 'password', 'password2', 'first_name', 'last_name', 'phone', 'city', 'user_type', 'terms_accepted', 'country', 'address', 'description', 'recto_id', 'verso_id'];
  const missingFields = requiredFields.filter(field => {
    const value = registrationData[field as keyof UserRegistrationRequest];
    return !value || (typeof value === 'string' && value.trim() === '');
  });
  
  if (missingFields.length > 0) {
    console.error('Missing or empty required fields for producer registration:', missingFields);
    throw new Error(`Missing or empty required fields: ${missingFields.join(', ')}`);
  }
  
  // Debug: Log the registration data being sent
  console.log('Producer registration data:', registrationData);
  
  return registrationData;
};

/**
 * Validates if user data is complete for registration
 */
export const validateUserDataForRegistration = (userData: UserData, password?: string): {
  isValid: boolean;
  missingFields: string[];
} => {
  const missingFields: string[] = [];
  
  // Required fields for all users
  if (!userData.name) missingFields.push('name');
  if (!userData.email) missingFields.push('email');
  if (!password) missingFields.push('password');
  if (!userData.phone) missingFields.push('phone');
  if (!userData.code) missingFields.push('country code');
  if (!userData.city && !userData.address) missingFields.push('city or address');
  if (!userData.userRole) missingFields.push('user role');
  if (!userData.country) missingFields.push('country');
  
  // Categories optional for consumers; required for producers only (enforced below)
  
  // ID verification and additional fields are required for producers
  if (userData.userRole === 'producteur') {
    if (!userData.selectedCategories || userData.selectedCategories.length === 0) {
      missingFields.push('selected categories');
    }
    if (!userData.idRecto) missingFields.push('ID recto image');
    if (!userData.idVerso) missingFields.push('ID verso image');
    if (!userData.description) missingFields.push('description');
    // For producers, page information is also needed
    if (!userData.page?.pageName) missingFields.push('page name');
    if (!userData.page?.address) missingFields.push('page address');
    if (!userData.page?.phone) missingFields.push('page phone');
    if (!userData.page?.country) missingFields.push('page country');
  }
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
}; 