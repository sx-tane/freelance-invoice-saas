import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Sparkles, Coffee, Zap, Star, Heart } from 'lucide-react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
  showWhimsicalMessages?: boolean;
  variant?: 'default' | 'celebration' | 'working' | 'magic';
}

const whimsicalMessages = [
  "Counting all your money...",
  "Organizing your financial empire...",
  "Making your invoices extra shiny...",
  "Teaching numbers to dance...",
  "Brewing some spreadsheet magic...",
  "Consulting with the invoice wizards...",
  "Polishing your professional reputation...",
  "Loading awesomeness, please wait...",
  "Calculating your path to prosperity...",
  "Summoning the productivity spirits...",
  "Optimizing for maximum joy...",
  "Adding sprinkles of efficiency..."
];

const loadingIcons = {
  default: null,
  celebration: [Sparkles, Star],
  working: [Coffee, Zap],
  magic: [Sparkles, Heart]
};

export function Loading({ 
  size = 'md', 
  className, 
  text, 
  showWhimsicalMessages = false,
  variant = 'default'
}: LoadingProps) {
  const [currentMessage, setCurrentMessage] = useState(text || whimsicalMessages[0]);
  const [messageIndex, setMessageIndex] = useState(0);
  const [showIcon, setShowIcon] = useState(false);

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const iconSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-6 w-6',
  };

  useEffect(() => {
    if (showWhimsicalMessages && !text) {
      const interval = setInterval(() => {
        setMessageIndex((prev) => (prev + 1) % whimsicalMessages.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [showWhimsicalMessages, text]);

  useEffect(() => {
    if (showWhimsicalMessages && !text) {
      setCurrentMessage(whimsicalMessages[messageIndex]);
    }
  }, [messageIndex, showWhimsicalMessages, text]);

  useEffect(() => {
    if (variant !== 'default') {
      const iconInterval = setInterval(() => {
        setShowIcon(prev => !prev);
      }, 1500);
      return () => clearInterval(iconInterval);
    }
  }, [variant]);

  const getRandomIcon = () => {
    const icons = loadingIcons[variant] || [];
    if (icons.length === 0) return null;
    const IconComponent = icons[Math.floor(Math.random() * icons.length)];
    return IconComponent;
  };

  const RandomIcon = getRandomIcon();

  return (
    <div className={cn('flex flex-col items-center justify-center p-4', className)}>
      <motion.div
        className="relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className={cn(
            'animate-spin rounded-full border-2 border-gray-300 border-t-primary-600',
            sizeClasses[size]
          )}
          animate={{
            rotate: [0, 360],
            scale: variant === 'celebration' ? [1, 1.1, 1] : 1
          }}
          transition={{
            rotate: { duration: 1, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
        />
        
        <AnimatePresence>
          {variant !== 'default' && showIcon && RandomIcon && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.7 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <RandomIcon className={cn('text-primary-600', iconSizeClasses[size])} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      <AnimatePresence mode="wait">
        {(text || showWhimsicalMessages) && (
          <motion.p
            key={currentMessage}
            className="mt-3 text-sm text-gray-600 text-center max-w-xs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            {currentMessage}
          </motion.p>
        )}
      </AnimatePresence>
      
      {variant === 'celebration' && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary-400 rounded-full"
              style={{
                left: `${20 + i * 10}%`,
                top: `${30 + (i % 2) * 20}%`,
              }}
              animate={{
                y: [-20, -40, -20],
                opacity: [0, 1, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}

export function PageLoading() {
  return (
    <motion.div 
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-primary-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Loading 
        size="lg" 
        showWhimsicalMessages={true} 
        variant="magic"
      />
    </motion.div>
  );
}

export function InlineLoading({ text = 'Loading...' }: { text?: string }) {
  return (
    <motion.div 
      className="flex items-center justify-center py-8"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Loading size="md" text={text} variant="working" />
    </motion.div>
  );
}

// New component for celebrations
export function CelebrationLoading({ text }: { text?: string }) {
  return (
    <motion.div 
      className="flex items-center justify-center py-12"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Loading 
        size="lg" 
        text={text || "Celebrating your success!"} 
        variant="celebration" 
      />
    </motion.div>
  );
}

// Component for empty states
export function EmptyStateLoading({ text }: { text?: string }) {
  return (
    <motion.div 
      className="flex items-center justify-center py-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="text-center">
        <Loading 
          size="md" 
          text={text || "Getting things ready for you..."} 
          showWhimsicalMessages={true}
          variant="magic"
        />
      </div>
    </motion.div>
  );
}