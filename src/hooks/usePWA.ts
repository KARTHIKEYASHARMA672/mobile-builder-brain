import { useState, useEffect } from 'react';
import { setupInstallPrompt, showInstallPrompt, isInstallable, isStandalone } from '@/utils/webApis';
import { offlineStorage } from '@/utils/offlineStorage';
import { useToast } from '@/hooks/use-toast';

interface PWAStatus {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  canSync: boolean;
}

export function usePWA() {
  const { toast } = useToast();
  const [status, setStatus] = useState<PWAStatus>({
    isInstallable: false,
    isInstalled: false,
    isOnline: navigator.onLine,
    canSync: 'serviceWorker' in navigator
  });

  useEffect(() => {
    // Initialize offline storage
    offlineStorage.init().catch(error => {
      console.error('Failed to initialize offline storage:', error);
    });

    // Set up install prompt
    setupInstallPrompt();

    // Update status
    const updateStatus = () => {
      setStatus({
        isInstallable: isInstallable(),
        isInstalled: isStandalone(),
        isOnline: navigator.onLine,
        canSync: 'serviceWorker' in navigator
      });
    };

    // Listen for online/offline events
    const handleOnline = () => {
      updateStatus();
      toast({
        title: "Back Online",
        description: "Syncing your data...",
      });
      syncOfflineData();
    };

    const handleOffline = () => {
      updateStatus();
      toast({
        title: "Offline Mode",
        description: "Your data will be saved locally and synced when you're back online.",
      });
    };

    // Listen for install prompt
    const handleInstallPrompt = () => {
      updateStatus();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleInstallPrompt);

    // Initial status update
    updateStatus();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
    };
  }, [toast]);

  const installApp = async (): Promise<boolean> => {
    try {
      const accepted = await showInstallPrompt();
      if (accepted) {
        toast({
          title: "App Installed",
          description: "AI Study Buddy has been installed on your device!",
        });
        setStatus(prev => ({ ...prev, isInstalled: true, isInstallable: false }));
      }
      return accepted;
    } catch (error) {
      console.error('Installation failed:', error);
      toast({
        title: "Installation Failed",
        description: "Could not install the app. Please try again later.",
        variant: "destructive",
      });
      return false;
    }
  };

  const syncOfflineData = async (): Promise<void> => {
    try {
      if (!navigator.onLine) {
        return;
      }

      const pendingActions = await offlineStorage.getPendingSync();
      console.log('Syncing pending actions:', pendingActions.length);

      // Register background sync if available
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        const registration = await navigator.serviceWorker.ready;
        const syncManager = (registration as any).sync;
        if (syncManager) {
          await syncManager.register('upload-question');
          await syncManager.register('quiz-attempt');
        }
      }

      // TODO: Implement actual sync logic with your backend
      // This would typically involve sending pending data to your API

    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  const clearOfflineData = async (): Promise<void> => {
    try {
      await offlineStorage.clearAllData();
      toast({
        title: "Data Cleared",
        description: "All offline data has been removed.",
      });
    } catch (error) {
      console.error('Failed to clear offline data:', error);
      toast({
        title: "Error",
        description: "Failed to clear offline data.",
        variant: "destructive",
      });
    }
  };

  const getStorageUsage = async (): Promise<{ used: number; available: number } | null> => {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        return {
          used: estimate.usage || 0,
          available: estimate.quota || 0
        };
      }
    } catch (error) {
      console.error('Failed to get storage usage:', error);
    }
    return null;
  };

  return {
    status,
    installApp,
    syncOfflineData,
    clearOfflineData,
    getStorageUsage,
    offlineStorage
  };
}