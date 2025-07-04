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
    // Only city provided
    return { city: parts[0].trim(), address: '' };
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
    // If category not found, log warning and return 0 as default
    console.warn(`Category "${categoryName}" not found in mapping. Using default index 0.`);
    return 0;
  });
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
  
  // Convert avatar to File if present
  let profilePicture: File | undefined;
  if (userData.avatar && userData.avatar.startsWith('data:image/')) {
    try {
      profilePicture = base64ToFile(userData.avatar, 'avatar.jpg');
    } catch (error) {
      console.error('Error converting avatar to File:', error);
    }
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
  
  // Split address into city and address components
  const { city, address } = userData.address ? splitAddress(userData.address) : { city: '', address: '' };
  
  // Map category names to indices
  const categoryIndices = userData.selectedCategories ? mapCategoriesToIndices(userData.selectedCategories) : [];
  
  const registrationData: UserRegistrationRequest = {
    email: userData.email || '',
    password: password,
    password2: password, // Confirm password (same as password)
    first_name: firstName,
    last_name: lastName,
    phone: formattedPhone,
    city: city,
    user_type: userType,
    terms_accepted: true, // User already accepted terms in signup flow
    profile_picture: profilePicture,
    country: userData.country || '',
    address: address,
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
  
  // Convert avatar to File if present
  let profilePicture: File | undefined;
  if (userData.avatar && userData.avatar.startsWith('data:image/')) {
    try {
      profilePicture = base64ToFile(userData.avatar, 'avatar.jpg');
    } catch (error) {
      console.error('Error converting avatar to File:', error);
    }
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
  
  // For producers, use page data if available, otherwise use main user data
  const pageData = userData.page || {};
  
  // Split address into city and address components (use page address if available)
  const addressToSplit = pageData.address || userData.address || '';
  const { city, address } = addressToSplit ? splitAddress(addressToSplit) : { city: '', address: '' };
  
  // Map category names to indices
  const categoryIndices = userData.selectedCategories ? mapCategoriesToIndices(userData.selectedCategories) : [];
  
  // Convert ID verification images to Files if present
  let rectoIdFile: File | undefined;
  let versoIdFile: File | undefined;
  
  if (userData.idRecto && userData.idRecto.startsWith('data:image/')) {
    try {
      rectoIdFile = base64ToFile(userData.idRecto, 'id_recto.jpg');
    } catch (error) {
      console.error('Error converting ID Recto to File:', error);
    }
  }
  
  if (userData.idVerso && userData.idVerso.startsWith('data:image/')) {
    try {
      versoIdFile = base64ToFile(userData.idVerso, 'id_verso.jpg');
    } catch (error) {
      console.error('Error converting ID Verso to File:', error);
    }
  }
  
  // Get phone and country from page data if available, otherwise use main data
  const finalPhone = (pageData.phone && pageData.code) 
    ? `${pageData.code}${pageData.phone.replace(/\D/g, '')}` 
    : formattedPhone;
  
  const finalCountry = pageData.country || userData.country || '';
  
  const registrationData: UserRegistrationRequest = {
    email: userData.email || '',
    password: password,
    password2: password, // Confirm password (same as password)
    first_name: firstName,
    last_name: lastName,
    phone: finalPhone,
    city: city,
    user_type: 'producer', // Always producer for this function
    terms_accepted: true, // User already accepted terms in signup flow
    profile_picture: profilePicture,
    country: finalCountry,
    address: address,
    description: userData.description || '', // Required for producers
    categories: categoryIndices,
    recto_id: rectoIdFile, // Required for producers
    verso_id: versoIdFile  // Required for producers
  };
  
  // Validate phone number length (API limit is 15 characters)
  if (registrationData.phone && registrationData.phone.length > 15) {
    console.warn('Phone number too long, truncating:', registrationData.phone);
    registrationData.phone = registrationData.phone.substring(0, 15);
  }
  
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
  if (!userData.address) missingFields.push('address (city)');
  if (!userData.userRole) missingFields.push('user role');
  if (!userData.country) missingFields.push('country');
  
  // Categories are required for consumers
  if (userData.userRole === 'client' && (!userData.selectedCategories || userData.selectedCategories.length === 0)) {
    missingFields.push('selected categories');
  }
  
  // ID verification and additional fields are required for producers
  if (userData.userRole === 'producteur') {
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