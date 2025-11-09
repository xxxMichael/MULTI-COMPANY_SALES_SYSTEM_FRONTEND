import { useNotifications } from '../../hooks/useNotifications';
import { NOTIFICATION_TYPES } from '../../state/notifications';

export default function NotificationContainer() {
  const { notifications, removeNotification } = useNotifications();

  const handleRemove = (notificationId) => {
    removeNotification(notificationId);
  };

  // Asegurar que notifications es un array
  if (!Array.isArray(notifications) || notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-[60] space-y-2 max-w-sm w-full">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={handleRemove}
        />
      ))}
    </div>
  );
}

function NotificationItem({ notification, onRemove }) {
  const getStyles = () => {
    switch (notification.type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return {
          bg: 'bg-green-900/90 border-green-700/50',
          icon: 'text-green-400',
          text: 'text-green-100'
        };
      case NOTIFICATION_TYPES.ERROR:
        return {
          bg: 'bg-red-900/90 border-red-700/50',
          icon: 'text-red-400',
          text: 'text-red-100'
        };
      case NOTIFICATION_TYPES.WARNING:
        return {
          bg: 'bg-yellow-900/90 border-yellow-700/50',
          icon: 'text-yellow-400',
          text: 'text-yellow-100'
        };
      case NOTIFICATION_TYPES.INFO:
      default:
        return {
          bg: 'bg-blue-900/90 border-blue-700/50',
          icon: 'text-blue-400',
          text: 'text-blue-100'
        };
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return (
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        );
      case NOTIFICATION_TYPES.ERROR:
        return (
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        );
      case NOTIFICATION_TYPES.WARNING:
        return (
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        );
      case NOTIFICATION_TYPES.INFO:
      default:
        return (
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
    }
  };

  const styles = getStyles();

  return (
    <div
      className={`${styles.bg} backdrop-blur-xl border rounded-lg shadow-lg p-4 animate-slideIn`}
    >
      <div className="flex items-start gap-3">
        <div className={`${styles.icon} flex-shrink-0 mt-0.5`}>
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          {notification.title && (
            <h4 className={`${styles.text} font-semibold text-sm mb-1`}>
              {notification.title}
            </h4>
          )}
          <p className={`${styles.text} text-sm break-words`}>
            {notification.message}
          </p>
          {notification.timestamp && (
            <p className={`${styles.text} opacity-70 text-xs mt-1`}>
              {new Date(notification.timestamp).toLocaleTimeString()}
            </p>
          )}
        </div>

        <button
          onClick={() => onRemove(notification.id)}
          className={`${styles.text} opacity-70 hover:opacity-100 transition-opacity flex-shrink-0`}
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}