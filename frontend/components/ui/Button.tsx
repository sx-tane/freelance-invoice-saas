import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Sparkles, CheckCircle, Zap } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'celebration' | 'magic';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  success?: boolean;
  icon?: React.ReactNode;
  animateOnHover?: boolean;
  rippleEffect?: boolean;
  children: React.ReactNode;
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  success = false,
  disabled,
  icon,
  animateOnHover = true,
  rippleEffect = false,
  children,
  ...props
}: ButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const baseClasses = 'relative inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden';
  
  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 hover:shadow-lg',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 hover:shadow-md',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 hover:shadow-lg',
    ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-500',
    celebration: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 focus:ring-purple-500 hover:shadow-xl',
    magic: 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:scale-105 focus:ring-purple-500 hover:shadow-2xl',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (rippleEffect && !disabled && !loading) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const newRipple = { id: Date.now(), x, y };
      
      setRipples(prev => [...prev, newRipple]);
      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
      }, 600);
    }
    
    if (props.onClick) {
      props.onClick(e);
    }
  };

  const buttonVariants = {
    rest: { scale: 1 },
    hover: animateOnHover ? { scale: variant === 'magic' ? 1.05 : 1.02 } : { scale: 1 },
    tap: { scale: 0.98 }
  };

  const iconVariants = {
    rest: { rotate: 0 },
    hover: { rotate: variant === 'celebration' ? [0, 10, -10, 0] : 0 },
  };

  return (
    <motion.button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || loading}
      variants={buttonVariants}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onClick={handleClick}
      {...props}
    >
      {/* Ripple Effect */}
      {rippleEffect && (
        <AnimatePresence>
          {ripples.map((ripple) => (
            <motion.span
              key={ripple.id}
              className="absolute bg-white/30 rounded-full pointer-events-none"
              style={{
                left: ripple.x - 10,
                top: ripple.y - 10,
                width: 20,
                height: 20,
              }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 4, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            />
          ))}
        </AnimatePresence>
      )}

      {/* Background sparkles for magic variant */}
      {variant === 'magic' && (
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              'linear-gradient(45deg, rgba(99, 102, 241, 0.3) 0%, rgba(168, 85, 247, 0.3) 50%, rgba(236, 72, 153, 0.3) 100%)',
              'linear-gradient(45deg, rgba(236, 72, 153, 0.3) 0%, rgba(99, 102, 241, 0.3) 50%, rgba(168, 85, 247, 0.3) 100%)',
              'linear-gradient(45deg, rgba(168, 85, 247, 0.3) 0%, rgba(236, 72, 153, 0.3) 50%, rgba(99, 102, 241, 0.3) 100%)',
            ]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      )}

      <div className="relative z-10 flex items-center">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center"
            >
              <motion.svg
                className="animate-spin -ml-1 mr-2 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </motion.svg>
              <span>Loading...</span>
            </motion.div>
          ) : success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, delay: 0.1 }}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
              </motion.div>
              <span>Success!</span>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center"
            >
              {icon && (
                <motion.div
                  variants={iconVariants}
                  className="mr-2 flex items-center"
                >
                  {icon}
                </motion.div>
              )}
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Celebration particles */}
      {variant === 'celebration' && isPressed && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${30 + i * 5}%`,
                top: '50%',
              }}
              initial={{
                opacity: 0,
                scale: 0,
                x: 0,
                y: 0
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                x: [(Math.random() - 0.5) * 20, (Math.random() - 0.5) * 40],
                y: [(Math.random() - 0.5) * 20, (Math.random() - 0.5) * 40]
              }}
              transition={{
                duration: 0.8,
                delay: i * 0.1
              }}
            />
          ))}
        </div>
      )}
    </motion.button>
  );
}

// Specialized button variants for common use cases
export function CelebrationButton({ children, ...props }: Omit<ButtonProps, 'variant'>) {
  return (
    <Button 
      variant="celebration" 
      rippleEffect 
      icon={<Sparkles className="h-4 w-4" />}
      {...props}
    >
      {children}
    </Button>
  );
}

export function MagicButton({ children, ...props }: Omit<ButtonProps, 'variant'>) {
  return (
    <Button 
      variant="magic" 
      animateOnHover 
      icon={<Zap className="h-4 w-4" />}
      {...props}
    >
      {children}
    </Button>
  );
}

export function ActionButton({ children, ...props }: ButtonProps) {
  return (
    <Button 
      rippleEffect 
      animateOnHover 
      {...props}
    >
      {children}
    </Button>
  );
}