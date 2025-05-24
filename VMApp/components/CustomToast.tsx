import Toast, { ToastPosition } from 'react-native-toast-message';
import { TextStyle, ViewStyle } from 'react-native';

type ToastType = 'success' | 'error' | 'info';
type CustomToastType = ToastType | 'warning';

interface CustomStyle {
  titleStyle?: TextStyle;
  messageStyle?: TextStyle;
  containerStyle?: ViewStyle;
}

interface ToastConfig {
  type?: CustomToastType;
  title: string;
  message: string;
  position?: ToastPosition;
  duration?: number;
  emoji?: string | null;
  customStyle?: CustomStyle;
}

interface QuickToastConfig {
  title?: string;
  message: string;
  position?: ToastPosition;
  duration?: number;
  emoji?: string;
}

interface StyleConfig {
  backgroundColor: string;
  borderLeftColor: string;
  textColor: string;
  secondaryTextColor: string;
  shadowColor: string;
}

 class CustomToast {
  static readonly TYPES: Record<string, CustomToastType> = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
  } as const;

  static readonly POSITIONS: Record<string, ToastPosition> = {
    TOP: 'top',
    BOTTOM: 'bottom'
  } as const;

  static readonly baseConfig = {
    position: 'bottom' as ToastPosition,
    topOffset: 80,
    bottomOffset: 60,
    visibilityTime: 4000,
    autoHide: true,
  };

  static readonly styles: Record<CustomToastType, StyleConfig> = {
    success: {
      backgroundColor: '#d1fae5',
      borderLeftColor: '#10b981',
      textColor: '#065f46',
      secondaryTextColor: '#047857',
      shadowColor: '#10b981',
    },
    error: {
      backgroundColor: '#fee2e2',
      borderLeftColor: '#ef4444',
      textColor: '#991b1b',
      secondaryTextColor: '#dc2626',
      shadowColor: '#ef4444',
    },
    warning: {
      backgroundColor: '#fef3c7',
      borderLeftColor: '#f59e0b',
      textColor: '#92400e',
      secondaryTextColor: '#d97706',
      shadowColor: '#f59e0b',
    },
    info: {
      backgroundColor: '#dbeafe',
      borderLeftColor: '#3b82f6',
      textColor: '#1e40af',
      secondaryTextColor: '#2563eb',
      shadowColor: '#3b82f6',
    }
  };

  static show(config: ToastConfig): void {
    const {
      type = this.TYPES.INFO,
      title,
      message,
      position = this.POSITIONS.BOTTOM,
      duration = 4000,
      emoji = null,
      customStyle = {}
    } = config;

    const style = this.styles[type];
    const displayTitle = emoji ? `${emoji} ${title}` : title;
    
    const actualToastType: ToastType = type === 'warning' ? 'error' : type as ToastType;

    Toast.show({
      type: actualToastType,
      text1: displayTitle,
      text2: message,
      position: position,
      topOffset: position === 'top' ? this.baseConfig.topOffset : undefined,
      bottomOffset: position === 'bottom' ? this.baseConfig.bottomOffset : undefined,
      visibilityTime: duration,
      autoHide: true,
      text1Style: {
        fontSize: 16,
        fontWeight: '700',
        color: style.textColor,
        letterSpacing: 0.2,
        lineHeight: 20,
        ...(customStyle.titleStyle || {})
      },
      text2Style: {
        fontSize: 14,
        fontWeight: '500',
        color: style.secondaryTextColor,
        marginTop: 2,
        lineHeight: 18,
         flexWrap: 'wrap',
        ...(customStyle.messageStyle || {})
      },
      props: {
        style: {
          backgroundColor: style.backgroundColor,
          borderLeftColor: style.borderLeftColor,
          borderLeftWidth: 4,
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 14,
          shadowColor: style.shadowColor,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 6,
          minHeight: 70,
          width: '90%',
          ...(customStyle.containerStyle || {})
        }
      }
    });
  }

  static showSuccess(config: QuickToastConfig): void {
    const {
      title = 'Success!',
      message,
      position = this.POSITIONS.BOTTOM,
      duration = 4500,
      emoji = '🎉'
    } = config;

    this.show({
      type: this.TYPES.SUCCESS,
      title,
      message,
      position,
      duration,
      emoji
    });
  }

  static showError(config: QuickToastConfig): void {
    const {
      title = 'Error',
      message,
      position = this.POSITIONS.BOTTOM,
      duration = 4000,
      emoji = '⚠️'
    } = config;

    this.show({
      type: this.TYPES.ERROR,
      title,
      message,
      position,
      duration,
      emoji
    });
  }

  static showWarning(config: QuickToastConfig): void {
    const {
      title = 'Warning',
      message,
      position = this.POSITIONS.BOTTOM,
      duration = 3500,
      emoji = '⚠️'
    } = config;

    this.show({
      type: this.TYPES.WARNING,
      title,
      message,
      position,
      duration,
      emoji
    });
  }

  static showInfo(config: QuickToastConfig): void {
    const {
      title = 'Info',
      message,
      position = this.POSITIONS.BOTTOM,
      duration = 3500,
      emoji = 'ℹ️'
    } = config;

    this.show({
      type: this.TYPES.INFO,
      title,
      message,
      position,
      duration,
      emoji
    });
  }

  static showBookingSuccess(vehicleType: string = 'vehicle'): void {
    this.showSuccess({
      title: 'Booking Confirmed!',
      message: `Your ${vehicleType} reservation \n has been successfully submitted.`,
      duration: 4500
    });
  }

  static showValidationError(field: string = 'required field'): void {
    this.showError({
      title: 'Action Required',
      message: `Please complete the ${field} to continue.`,
      duration: 4000
    });
  }

  static showPurposeRequired(): void {
    this.showWarning({
      title: 'Purpose Required',
      message: 'Please specify the purpose \n of your trip to continue.',
      emoji: '📝'
    });
  }

  static showNetworkError(): void {
    this.showError({
      title: 'Connection Error',
      message: 'Please check your \n internet connection and try again.',
      emoji: '🌐'
    });
  }

  static showDataRefreshed(dataType: string = 'data'): void {
    this.showInfo({
      title: 'Updated',
      message: `${dataType} has been refreshed successfully.`,
      emoji: '🔄'
    });
  }

  static showLoginSuccess(userName: string = 'User'): void {
    this.showSuccess({
      title: 'Welcome back!',
      message: `Hello ${userName}, you've been logged in successfully.`,
      emoji: '👋'
    });
  }

  static showLogoutSuccess(): void {
    this.showInfo({
      title: 'Logged out',
      message: 'You have been successfully logged out.',
      emoji: '👋'
    });
  }

  static showFormError(errors: string[] = []): void {
    const errorMessage = errors.length > 1 
      ? `Please fix ${errors.length} errors \n in the form.`
      : errors[0] || 'Please check your form inputs.';
    
    this.showError({
      title: 'Form Error',
      message: errorMessage
    });
  }

  static showSaveSuccess(itemName: string = 'Changes'): void {
    this.showSuccess({
      title: 'Saved!',
      message: `${itemName} have been saved successfully.`,
      emoji: '💾'
    });
  }

  static hide(): void {
    Toast.hide();
  }
}

export default CustomToast;

export type { ToastConfig, QuickToastConfig, CustomStyle, ToastType };

// Usage Examples:

/*
// Basic usage
import CustomToast from 'components/CustomToast';

// Simple success
CustomToast.showSuccess({
  title: 'Great!',
  message: 'Your action was completed successfully.'
});

// Error with custom duration
CustomToast.showError({
  title: 'Oops!',
  message: 'Something went wrong.',
  duration: 5000
});

// Custom toast with full control
CustomToast.show({
  type: CustomToast.TYPES.INFO,
  title: 'Custom Toast',
  message: 'This is a custom message',
  position: CustomToast.POSITIONS.BOTTOM,
  emoji: '🚀',
  duration: 3000
});

// Predefined use cases
CustomToast.showBookingSuccess('car');
CustomToast.showValidationError('vehicle selection');
CustomToast.showPurposeRequired();
CustomToast.showNetworkError();
CustomToast.showLoginSuccess('John Doe');

// With custom styling
CustomToast.show({
  type: CustomToast.TYPES.SUCCESS,
  title: 'Custom Styled Toast',
  message: 'This toast has custom styling',
  customStyle: {
    titleStyle: {
      fontSize: 18,
      color: '#000'
    },
    messageStyle: {
      fontSize: 16,
      fontStyle: 'italic'
    },
    containerStyle: {
      backgroundColor: '#f0f0f0',
      borderRadius: 8
    }
  }
});
*/