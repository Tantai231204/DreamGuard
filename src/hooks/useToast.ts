import { toast } from "sonner";

export const useToast = () => {
  const success = (message: string, description?: string) => {
    toast.success(message, { description });
  };

  const error = (message: string, description?: string) => {
    toast.error(message, { description });
  };

  const info = (message: string, description?: string) => {
    toast.info(message, { description });
  };

  const warning = (message: string, description?: string) => {
    toast.warning(message, { description });
  };

  const loading = (message: string) => {
    return toast.loading(message);
  };

  const promise = <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    },
  ) => {
    return toast.promise(promise, messages);
  };

  const dismiss = (id?: string | number) => {
    toast.dismiss(id);
  };

  return {
    success,
    error,
    info,
    warning,
    loading,
    promise,
    dismiss,
  };
};
