// Web Share API
export const shareContent = async (data: {
  title: string;
  text?: string;
  url?: string;
}): Promise<boolean> => {
  if (navigator.share) {
    try {
      await navigator.share(data);
      return true;
    } catch (error) {
      console.error('Error sharing:', error);
      return false;
    }
  } else {
    // Fallback to clipboard API
    return copyToClipboard(data.text || data.url || '');
  }
};

// Clipboard API
export const copyToClipboard = async (text: string): Promise<boolean> => {
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  } else {
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (error) {
      console.error('Fallback copy failed:', error);
      return false;
    }
  }
};

// Camera API for image capture
export const captureImage = async (options: {
  facingMode?: 'user' | 'environment';
  width?: number;
  height?: number;
}): Promise<string | null> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: options.facingMode || 'environment',
        width: options.width || 1280,
        height: options.height || 720
      }
    });

    return new Promise((resolve) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      video.srcObject = stream;
      video.play();

      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Capture frame after a short delay
        setTimeout(() => {
          context?.drawImage(video, 0, 0);
          const dataURL = canvas.toDataURL('image/jpeg', 0.8);
          
          // Stop the stream
          stream.getTracks().forEach(track => track.stop());
          
          resolve(dataURL);
        }, 1000);
      };
    });
  } catch (error) {
    console.error('Camera access failed:', error);
    return null;
  }
};

// File System Access API
export const saveFile = async (data: string, filename: string, mimeType: string): Promise<boolean> => {
  if ('showSaveFilePicker' in window) {
    try {
      const fileHandle = await (window as any).showSaveFilePicker({
        suggestedName: filename,
        types: [{
          description: 'Files',
          accept: { [mimeType]: [`.${filename.split('.').pop()}`] }
        }]
      });

      const writable = await fileHandle.createWritable();
      await writable.write(new Blob([data], { type: mimeType }));
      await writable.close();
      return true;
    } catch (error) {
      console.error('File save failed:', error);
      return false;
    }
  } else {
    // Fallback to download
    downloadFile(data, filename, mimeType);
    return true;
  }
};

// Fallback download function
export const downloadFile = (data: string, filename: string, mimeType: string): void => {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Notification API
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if ('Notification' in window) {
    return await Notification.requestPermission();
  }
  return 'denied';
};

export const showNotification = (title: string, options?: NotificationOptions): void => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      ...options
    });
  }
};

// Study reminder notifications
export const scheduleStudyReminder = (message: string, delayMinutes: number): void => {
  setTimeout(() => {
    showNotification('Study Reminder', {
      body: message
    });
    // Trigger vibration separately
    vibrate([100, 50, 100]);
  }, delayMinutes * 60 * 1000);
};

// Vibration API
export const vibrate = (pattern: number | number[]): void => {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
};

// Battery API (if available)
export const getBatteryInfo = async (): Promise<any> => {
  if ('getBattery' in navigator) {
    try {
      const battery = await (navigator as any).getBattery();
      return {
        level: Math.round(battery.level * 100),
        charging: battery.charging,
        chargingTime: battery.chargingTime,
        dischargingTime: battery.dischargingTime
      };
    } catch (error) {
      console.error('Battery API not available:', error);
      return null;
    }
  }
  return null;
};

// Screen orientation
export const lockScreenOrientation = (orientation: string): Promise<void> => {
  if (screen.orientation && (screen.orientation as any).lock) {
    return (screen.orientation as any).lock(orientation);
  }
  return Promise.reject('Screen orientation lock not supported');
};

// Wake lock API (keep screen on during study sessions)
export const requestWakeLock = async (): Promise<any> => {
  if ('wakeLock' in navigator) {
    try {
      const wakeLock = await (navigator as any).wakeLock.request('screen');
      return wakeLock;
    } catch (error) {
      console.error('Wake lock request failed:', error);
      return null;
    }
  }
  return null;
};

// Device memory and connection info
export const getDeviceInfo = (): any => {
  const connection = (navigator as any).connection;
  const memory = (navigator as any).deviceMemory;
  
  return {
    memory: memory || 'unknown',
    connection: connection ? {
      type: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt
    } : null,
    platform: navigator.platform,
    userAgent: navigator.userAgent,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine
  };
};

// Install prompt for PWA
let deferredPrompt: any = null;

export const setupInstallPrompt = (): void => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });
};

export const showInstallPrompt = async (): Promise<boolean> => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    return outcome === 'accepted';
  }
  return false;
};

export const isInstallable = (): boolean => {
  return deferredPrompt !== null;
};

export const isStandalone = (): boolean => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone ||
    document.referrer.includes('android-app://')
  );
};
