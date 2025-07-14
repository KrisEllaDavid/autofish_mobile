export const checkCameraSupport = () => {
  const support = {
    getUserMedia: !!navigator.mediaDevices?.getUserMedia,
    webcam: true, // We're using react-webcam which handles this
    permissions: !!navigator.permissions?.query,
  };

  console.log('Camera support check:', support);
  return support;
};

export const getAvailableCameras = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    console.log('Available cameras:', videoDevices);
    return videoDevices;
  } catch (error) {
    console.error('Error getting available cameras:', error);
    return [];
  }
};

export const requestCameraPermission = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: 'environment',
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      } 
    });
    
    // Stop the stream immediately
    stream.getTracks().forEach(track => track.stop());
    
    console.log('Camera permission granted');
    return true;
  } catch (error) {
    console.error('Camera permission error:', error);
    return false;
  }
};

export const getCameraConstraints = (preferEnvironment = true) => {
  const baseConstraints = {
    width: { ideal: 1920, min: 1280 },
    height: { ideal: 1080, min: 720 },
    aspectRatio: { ideal: 16/9 }
  };

  if (preferEnvironment) {
    return {
      facingMode: 'environment',
      ...baseConstraints
    };
  }

  return baseConstraints;
}; 