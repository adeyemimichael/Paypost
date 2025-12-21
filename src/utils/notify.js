import { toast } from 'react-toastify';

export const notify = {
  success: (message) => toast.success(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  }),
  
  error: (message) => toast.error(message, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  }),
  
  info: (message) => toast.info(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  }),
  
  loading: (message) => toast.loading(message, {
    position: "top-right",
  }),
  
  update: (toastId, options) => toast.update(toastId, options),
  
  dismiss: (toastId) => toast.dismiss(toastId),
};