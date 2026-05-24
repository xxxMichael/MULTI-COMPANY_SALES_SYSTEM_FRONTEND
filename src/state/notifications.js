import { atom } from 'jotai';

// Estado global para las notificaciones
export const notificationsAtom = atom([]);

// Tipos de notificación
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Acciones para manejar notificaciones
export const addNotification = (get, set, notification) => {
  const notifications = get(notificationsAtom);
  const newNotification = {
    id: Date.now() + Math.random(),
    timestamp: new Date(),
    autoHide: true,
    duration: 5000, // 5 segundos por defecto
    ...notification
  };
  
  set(notificationsAtom, [...notifications, newNotification]);
  
  // Auto-hide si está habilitado
  if (newNotification.autoHide) {
    setTimeout(() => {
      removeNotification(get, set, newNotification.id);
    }, newNotification.duration);
  }
  
  return newNotification.id;
};

export const removeNotification = (get, set, notificationId) => {
  const notifications = get(notificationsAtom);
  set(notificationsAtom, notifications.filter(n => n.id !== notificationId));
};

export const clearAllNotifications = (get, set) => {
  set(notificationsAtom, []);
};

// Helpers para tipos específicos de notificación
export const showSuccessNotification = (get, set, message, options = {}) => {
  return addNotification(get, set, {
    type: NOTIFICATION_TYPES.SUCCESS,
    title: 'Éxito',
    message,
    ...options
  });
};

export const showErrorNotification = (get, set, message, options = {}) => {
  return addNotification(get, set, {
    type: NOTIFICATION_TYPES.ERROR,
    title: 'Error',
    message,
    duration: 8000, // Errores se muestran más tiempo
    ...options
  });
};

export const showWarningNotification = (get, set, message, options = {}) => {
  return addNotification(get, set, {
    type: NOTIFICATION_TYPES.WARNING,
    title: 'Advertencia',
    message,
    ...options
  });
};

export const showInfoNotification = (get, set, message, options = {}) => {
  return addNotification(get, set, {
    type: NOTIFICATION_TYPES.INFO,
    title: 'Información',
    message,
    ...options
  });
};