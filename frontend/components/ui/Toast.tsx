import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Info, 
  X,
  Sparkles,
  Zap,
  Heart,
  Coffee,
  PartyPopper
} from 'lucide-react';
import toast, { Toaster, ToastOptions } from 'react-hot-toast';

interface DelightfulToastProps {
  type?: 'success' | 'error' | 'warning' | 'info' | 'celebration' | 'magic';
  title?: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
  showConfetti?: boolean;
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    emoji: '🎉',
    messages: [
      'Boom! You nailed it!',
      'Success tastes sweet!',
      'You\'re on fire! 🔥',
      'Victory dance time!',
      'Absolutely crushing it!'
    ]
  },
  error: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    emoji: '😅',
    messages: [
      'Oops! Let\'s try that again',
      'No worries, we all make mistakes',
      'Plot twist! Something went sideways',
      'Houston, we have a tiny problem',
      'Error? More like a learning opportunity!'
    ]
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    emoji: '⚠️',
    messages: [
      'Heads up!',
      'Just a friendly heads up',
      'Caution: Awesome in progress',
      'Yellow alert!',
      'Proceed with confidence!'
    ]
  },
  info: {
    icon: Info,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    emoji: 'ℹ️',
    messages: [
      'Fun fact coming your way!',
      'Just so you know...',
      'Info nugget delivered!',
      'Knowledge is power!',
      'Here\'s something interesting!'
    ]
  },
  celebration: {
    icon: PartyPopper,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    emoji: '🎊',
    messages: [
      'Party time! 🎉',
      'Celebration mode activated!',
      'Time to celebrate!',
      'You deserve this moment!',
      'Victory achieved!'
    ]
  },
  magic: {
    icon: Sparkles,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    emoji: '✨',
    messages: [
      'Magic happens!',
      'Abracadabra! ✨',
      'Something magical occurred',
      'You\'ve got the magic touch!',
      'Spellbinding success!'
    ]
  }
};

function DelightfulToast({
  type = 'success',
  title,
  message,
  action,
  duration = 4000,
  showConfetti = false
}: DelightfulToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [confettiParticles, setConfettiParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  
  const config = toastConfig[type];
  const IconComponent = config.icon;
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  useEffect(() => {
    if (showConfetti || type === 'celebration') {
      const particles = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100
      }));
      setConfettiParticles(particles);
      
      const cleanup = setTimeout(() => {
        setConfettiParticles([]);
      }, 2000);
      
      return () => clearTimeout(cleanup);
    }
  }, [showConfetti, type]);

  if (!isVisible) return null;

  return (
    <motion.div
      className={`
        relative max-w-md w-full ${config.bgColor} ${config.borderColor} border rounded-xl shadow-lg p-4 
        pointer-events-auto overflow-hidden backdrop-blur-sm
      `}
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Confetti particles */}
      {confettiParticles.length > 0 && (
        <div className="absolute inset-0 pointer-events-none">
          {confettiParticles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute text-sm"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
              }}
              initial={{ scale: 0, opacity: 0, rotate: 0 }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
                rotate: [0, 180, 360],
                y: [-10, -30, -50]
              }}
              transition={{
                duration: 2,
                delay: particle.id * 0.1,
                ease: "easeOut"
              }}
            >
              {config.emoji}
            </motion.div>
          ))}
        </div>
      )}

      <div className="flex items-start">
        <motion.div
          className="flex-shrink-0"
          animate={{
            rotate: type === 'celebration' ? [0, 10, -10, 0] : 0,
            scale: type === 'magic' ? [1, 1.1, 1] : 1
          }}
          transition={{
            duration: type === 'celebration' ? 0.5 : 2,
            repeat: type === 'magic' ? Infinity : 0
          }}
        >
          <IconComponent className={`h-5 w-5 ${config.color} mt-0.5`} />
        </motion.div>
        
        <div className="ml-3 flex-1">
          {title && (
            <motion.p
              className="text-sm font-semibold text-gray-900"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              {title}
            </motion.p>
          )}
          
          <motion.p
            className={`text-sm text-gray-700 ${title ? 'mt-1' : ''}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: title ? 0.2 : 0.1 }}
          >
            {message}
          </motion.p>
          
          {action && (
            <motion.div
              className="mt-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <button
                onClick={action.onClick}
                className={`
                  text-sm font-medium ${config.color} hover:underline focus:outline-none 
                  focus:underline transition-all duration-200 hover:scale-105
                `}
              >
                {action.label}
              </button>
            </motion.div>
          )}
        </div>
        
        <motion.button
          className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-white/50"
          onClick={() => setIsVisible(false)}
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <X className="h-4 w-4" />
        </motion.button>
      </div>

      {/* Progress bar */}
      <motion.div
        className={`absolute bottom-0 left-0 h-1 ${config.color.replace('text-', 'bg-')} rounded-b-xl`}
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: duration / 1000, ease: "linear" }}
      />
    </motion.div>
  );
}

// Enhanced toast functions with personality
export const delightfulToast = {
  success: (message: string, options?: Partial<DelightfulToastProps>) => {
    const config = toastConfig.success;
    const randomMessage = config.messages[Math.floor(Math.random() * config.messages.length)];
    
    return toast.custom((t) => (
      <DelightfulToast
        type="success"
        title={options?.title || randomMessage}
        message={message}
        {...options}
      />
    ), {
      duration: options?.duration || 4000,
      position: 'top-right',
    });
  },

  error: (message: string, options?: Partial<DelightfulToastProps>) => {
    const config = toastConfig.error;
    const randomMessage = config.messages[Math.floor(Math.random() * config.messages.length)];
    
    return toast.custom((t) => (
      <DelightfulToast
        type="error"
        title={options?.title || randomMessage}
        message={message}
        {...options}
      />
    ), {
      duration: options?.duration || 5000,
      position: 'top-right',
    });
  },

  warning: (message: string, options?: Partial<DelightfulToastProps>) => {
    const config = toastConfig.warning;
    const randomMessage = config.messages[Math.floor(Math.random() * config.messages.length)];
    
    return toast.custom((t) => (
      <DelightfulToast
        type="warning"
        title={options?.title || randomMessage}
        message={message}
        {...options}
      />
    ), {
      duration: options?.duration || 4000,
      position: 'top-right',
    });
  },

  info: (message: string, options?: Partial<DelightfulToastProps>) => {
    const config = toastConfig.info;
    const randomMessage = config.messages[Math.floor(Math.random() * config.messages.length)];
    
    return toast.custom((t) => (
      <DelightfulToast
        type="info"
        title={options?.title || randomMessage}
        message={message}
        {...options}
      />
    ), {
      duration: options?.duration || 4000,
      position: 'top-right',
    });
  },

  celebration: (message: string, options?: Partial<DelightfulToastProps>) => {
    return toast.custom((t) => (
      <DelightfulToast
        type="celebration"
        title="🎉 Celebration Time!"
        message={message}
        showConfetti={true}
        {...options}
      />
    ), {
      duration: options?.duration || 5000,
      position: 'top-center',
    });
  },

  magic: (message: string, options?: Partial<DelightfulToastProps>) => {
    return toast.custom((t) => (
      <DelightfulToast
        type="magic"
        title="✨ Magic Happened!"
        message={message}
        {...options}
      />
    ), {
      duration: options?.duration || 4000,
      position: 'top-right',
    });
  },

  // Special achievement toasts
  firstInvoice: () => {
    return delightfulToast.celebration(
      "You've created your first invoice! This is the beginning of something amazing! 🚀",
      {
        title: "First Invoice Created! 🎊",
        duration: 6000,
        action: {
          label: "Send it out!",
          onClick: () => console.log("Navigate to send invoice")
        }
      }
    );
  },

  paymentReceived: (amount: string) => {
    return delightfulToast.celebration(
      `Cha-ching! ${amount} just landed in your account! Time for a happy dance! 💃`,
      {
        title: "Payment Received! 💰",
        showConfetti: true,
        action: {
          label: "View details",
          onClick: () => console.log("View payment details")
        }
      }
    );
  },

  milestone: (message: string) => {
    return delightfulToast.magic(
      message,
      {
        title: "Milestone Unlocked! 🏆",
        duration: 5000,
        showConfetti: true
      }
    );
  }
};

// Custom Toaster component with enhanced styling
export function DelightfulToaster() {
  return (
    <Toaster
      position="top-right"
      gutter={8}
      containerStyle={{
        top: 20,
        right: 20,
      }}
      toastOptions={{
        duration: 4000,
        style: {
          background: 'transparent',
          boxShadow: 'none',
          padding: 0,
          margin: 0,
        },
        success: {
          iconTheme: {
            primary: '#10B981',
            secondary: '#FFFFFF',
          },
        },
        error: {
          iconTheme: {
            primary: '#EF4444',
            secondary: '#FFFFFF',
          },
        },
      }}
    />
  );
}

// Hook for easy access to toast functions
export function useDelightfulToast() {
  return {
    success: delightfulToast.success,
    error: delightfulToast.error,
    warning: delightfulToast.warning,
    info: delightfulToast.info,
    celebration: delightfulToast.celebration,
    magic: delightfulToast.magic,
    firstInvoice: delightfulToast.firstInvoice,
    paymentReceived: delightfulToast.paymentReceived,
    milestone: delightfulToast.milestone,
  };
}