// src/hooks/useToastAndConfirm.ts
import { useState, useCallback } from 'react';
import { useToast } from '../../components/common/Toast';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
}

export const useToastAndConfirm = () => {
  const { success, error, warning, info, loading, dismiss } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions(opts);
      setIsOpen(true);
      setResolvePromise(() => resolve);
    });
  }, []);

  const handleConfirm = useCallback(async () => {
    if (resolvePromise) {
      setIsLoading(true);
      resolvePromise(true);
      setIsLoading(false);
    }
    setIsOpen(false);
    setOptions(null);
    setResolvePromise(null);
  }, [resolvePromise]);

  const handleCancel = useCallback(() => {
    if (resolvePromise) {
      resolvePromise(false);
    }
    setIsOpen(false);
    setOptions(null);
    setResolvePromise(null);
  }, [resolvePromise]);

  const withConfirmation = useCallback(async (
    opts: ConfirmOptions,
    action: () => Promise<void>,
    successMessage?: string,
    errorMessage?: string
  ): Promise<boolean> => {
    const confirmed = await confirm(opts);
    if (confirmed) {
      try {
        await action();
        if (successMessage) {
          success(successMessage);
        }
        return true;
      } catch (err) {
        error(errorMessage || 'Operation failed');
        return false;
      }
    }
    return false;
  }, [confirm, success, error]);

  // For async operations with loading state
  const withLoading = useCallback(async (
    action: () => Promise<void>,
    loadingMessage: string = 'Processing...',
    successMessage?: string,
    errorMessage?: string
  ) => {
    const toastId = loading(loadingMessage);
    try {
      await action();
      dismiss(toastId);
      if (successMessage) {
        success(successMessage);
      }
      return true;
    } catch (err) {
      dismiss(toastId);
      error(errorMessage || 'Operation failed');
      return false;
    }
  }, [loading, dismiss, success, error]);

  return {
    // Toast methods
    success,
    error,
    warning,
    info,
    loading,
    dismiss,
    // Confirmation methods
    confirm,
    withConfirmation,
    withLoading,
    isOpen,
    options,
    isLoading,
    handleConfirm,
    handleCancel,
  };
};