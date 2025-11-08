import { useAtom } from 'jotai';
import { 
  notificationsAtom,
  NOTIFICATION_TYPES
} from '../state/notifications';

/**
 * Hook personalizado para manejar notificaciones
 * Proporciona una interfaz simple para mostrar diferentes tipos de notificaciones
 */
export function useNotifications() {
  const [notifications, setNotifications] = useAtom(notificationsAtom);

  // Asegurar que notifications siempre sea un array
  const safeNotifications = Array.isArray(notifications) ? notifications : [];

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now() + Math.random(),
      timestamp: new Date(),
      autoHide: true,
      duration: 5000, // 5 segundos por defecto
      ...notification
    };
    
    setNotifications([...safeNotifications, newNotification]);
    
    // Auto-hide si está habilitado
    if (newNotification.autoHide) {
      setTimeout(() => {
        setNotifications(prev => Array.isArray(prev) ? prev.filter(n => n.id !== newNotification.id) : []);
      }, newNotification.duration);
    }
    
    return newNotification.id;
  };

  const removeNotification = (notificationId) => {
    setNotifications(prev => Array.isArray(prev) ? prev.filter(n => n.id !== notificationId) : []);
  };

  const notify = {
    success: (message, options = {}) => {
      return addNotification({
        type: NOTIFICATION_TYPES.SUCCESS,
        title: 'Éxito',
        message,
        ...options
      });
    },

    error: (message, options = {}) => {
      return addNotification({
        type: NOTIFICATION_TYPES.ERROR,
        title: 'Error',
        message,
        duration: 8000, // Errores se muestran más tiempo
        ...options
      });
    },

    warning: (message, options = {}) => {
      return addNotification({
        type: NOTIFICATION_TYPES.WARNING,
        title: 'Advertencia',
        message,
        ...options
      });
    },

    info: (message, options = {}) => {
      return addNotification({
        type: NOTIFICATION_TYPES.INFO,
        title: 'Información',
        message,
        ...options
      });
    },

    clear: () => {
      setNotifications([]);
    }
  };

  return {
    notifications: safeNotifications,
    notify,
    removeNotification
  };
}