import { apiClient } from '../services/api';

export const handleEmailVerificationFromUrl = async (): Promise<{ success: boolean; message: string }> => {
  try {
    // Check if there's a verification token in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token') || urlParams.get('verification_token');

    if (!token) {
      return { success: false, message: 'No verification token found in URL' };
    }

    // Verify the email using the token
    const response = await apiClient.verifyEmail(token);

    // Clear the token from the URL for security
    const url = new URL(window.location.href);
    url.searchParams.delete('token');
    url.searchParams.delete('verification_token');
    window.history.replaceState({}, document.title, url.toString());

    return { success: true, message: response.message || 'Email verified successfully!' };
  } catch (error: any) {
    console.error('Email verification error:', error);

    // Clear the token from the URL even if verification failed
    const url = new URL(window.location.href);
    url.searchParams.delete('token');
    url.searchParams.delete('verification_token');
    window.history.replaceState({}, document.title, url.toString());

    let message = 'Email verification failed';
    if (error?.detail) {
      message = error.detail;
    } else if (typeof error === 'string') {
      message = error;
    }

    return { success: false, message };
  }
};

export const getVerificationTokenFromUrl = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('token') || urlParams.get('verification_token');
};