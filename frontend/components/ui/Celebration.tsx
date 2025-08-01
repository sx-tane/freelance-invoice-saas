import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  Sparkles, 
  Trophy, 
  Star, 
  Heart,
  Zap,
  Target,
  DollarSign,
  Award,
  Crown,
  Rocket,
  PartyPopper
} from 'lucide-react';
import { ActionButton } from './Button';

interface CelebrationProps {
  isVisible: boolean;
  onClose: () => void;
  type?: 'success' | 'milestone' | 'achievement' | 'first-time' | 'big-win';
  title?: string;
  message?: string;
  autoClose?: boolean;
  autoCloseDelay?: number;
  confetti?: boolean;
  sound?: boolean;
}

const celebrationConfigs = {
  success: {
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-100',
    gradientFrom: 'from-green-400',
    gradientTo: 'to-emerald-400',
    title: 'Success! 🎉',
    messages: [
      "Boom! You totally nailed it!",
      "Look at you being all successful and stuff!",
      "That was smoother than a jazz saxophone!",
      "You're on fire! (In the best way possible)",
      "Success level: Expert! 💪"
    ]
  },
  milestone: {
    icon: Trophy,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-100',
    gradientFrom: 'from-yellow-400',
    gradientTo: 'to-orange-400',
    title: 'Milestone Achieved! 🏆',
    messages: [
      "Another milestone in the books! You're unstoppable!",
      "Level up! Your progress is seriously impressive!",
      "Milestone conquered! What's next on your list?",
      "You're building something amazing, one milestone at a time!",
      "Victory dance time! You've earned it! 💃"
    ]
  },
  achievement: {
    icon: Award,
    color: 'text-purple-500',
    bgColor: 'bg-purple-100',
    gradientFrom: 'from-purple-400',
    gradientTo: 'to-pink-400',
    title: 'Achievement Unlocked! 🎖️',
    messages: [
      "Ding! New achievement unlocked! You're a legend!",
      "Achievement get! Your dedication is paying off!",
      "Badge earned! You're collecting wins like a pro!",
      "Another achievement for your hall of fame!",
      "You're absolutely crushing it! Keep going! 🚀"
    ]
  },
  'first-time': {
    icon: Star,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100',
    gradientFrom: 'from-blue-400',
    gradientTo: 'to-indigo-400',
    title: 'First Time Magic! ✨',
    messages: [
      "First time's the charm! Welcome to the club!",
      "You just popped your cherry on this one! Nice work!",
      "Virgin no more! You've officially started something great!",
      "First step taken! Every journey starts with one!",
      "Breaking new ground! This is just the beginning! 🌟"
    ]
  },
  'big-win': {
    icon: Crown,
    color: 'text-amber-500',
    bgColor: 'bg-amber-100',
    gradientFrom: 'from-amber-400',
    gradientTo: 'to-yellow-400',
    title: 'Big Win Alert! 👑',
    messages: [
      "HUGE win! You're absolutely killing it right now!",
      "Major victory! Time to treat yourself to something nice!",
      "Big win energy! You deserve all the celebration!",
      "Massive success! Your hard work is paying off big time!",
      "Champion status achieved! You're the real MVP! 🏅"
    ]
  }
};

const confettiColors = [
  'bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 
  'bg-purple-400', 'bg-pink-400', 'bg-indigo-400', 'bg-orange-400'
];

export function Celebration({
  isVisible,
  onClose,
  type = 'success',
  title,
  message,
  autoClose = true,
  autoCloseDelay = 4000,
  confetti = true,
  sound = false
}: CelebrationProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const config = celebrationConfigs[type];
  const IconComponent = config.icon;
  const currentTitle = title || config.title;
  const currentMessage = message || config.messages[messageIndex];

  useEffect(() => {
    if (isVisible && config.messages.length > 1) {
      const randomIndex = Math.floor(Math.random() * config.messages.length);
      setMessageIndex(randomIndex);
    }
  }, [isVisible, config.messages.length]);

  useEffect(() => {
    if (isVisible && confetti) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, confetti]);

  useEffect(() => {
    if (isVisible && autoClose) {
      const timer = setTimeout(onClose, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [isVisible, autoClose, autoCloseDelay, onClose]);

  // Simple sound effect (you might want to replace this with actual audio)
  useEffect(() => {
    if (isVisible && sound && typeof window !== 'undefined') {
      // You can add actual sound files here
      console.log('🎵 Celebration sound would play here!');
    }
  }, [isVisible, sound]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Confetti */}
        {showConfetti && confetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute w-2 h-2 ${confettiColors[i % confettiColors.length]} rounded-full`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '-10px',
                }}
                initial={{ 
                  y: -10,
                  x: 0,
                  opacity: 1,
                  rotate: 0
                }}
                animate={{
                  y: window.innerHeight + 10,
                  x: (Math.random() - 0.5) * 200,
                  opacity: [1, 1, 0],
                  rotate: Math.random() * 360
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  delay: Math.random() * 2,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>
        )}

        {/* Celebration Card */}
        <motion.div
          className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 text-center overflow-hidden"
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0, y: 50 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 20,
            delay: 0.1 
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Gradient background */}
          <div className={`absolute inset-0 bg-gradient-to-br ${config.gradientFrom} ${config.gradientTo} opacity-5`} />

          {/* Sparkle decorations */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-xl"
                style={{
                  left: `${10 + i * 10}%`,
                  top: `${10 + (i % 2) * 70}%`,
                }}
                animate={{
                  scale: [0, 1, 0],
                  rotate: [0, 180, 360],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 2,
                  delay: 0.5 + i * 0.2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              >
                ✨
              </motion.div>
            ))}
          </div>

          {/* Main Icon */}
          <motion.div
            className={`relative z-10 w-20 h-20 mx-auto mb-6 ${config.bgColor} rounded-full flex items-center justify-center`}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 15,
              delay: 0.3 
            }}
          >
            <IconComponent className={`h-10 w-10 ${config.color}`} />
            
            {/* Pulsing ring effect */}
            <motion.div
              className={`absolute inset-0 ${config.bgColor} rounded-full`}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0, 0.5]
              }}
              transition={{
                duration: 2,
                delay: 0.5,
                repeat: Infinity
              }}
            />
          </motion.div>

          {/* Title */}
          <motion.h2
            className="text-2xl font-bold text-gray-900 mb-3 relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {currentTitle}
          </motion.h2>

          {/* Message */}
          <motion.p
            className="text-gray-600 mb-8 leading-relaxed relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {currentMessage}
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            className="space-y-3 relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <ActionButton
              onClick={onClose}
              variant="primary"
              className="w-full"
              icon={<Heart className="h-4 w-4" />}
              rippleEffect
            >
              Awesome, Thanks!
            </ActionButton>
          </motion.div>

          {/* Auto-close indicator */}
          {autoClose && (
            <motion.div 
              className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full"
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: autoCloseDelay / 1000, ease: "linear" }}
            />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Specialized celebration components for common use cases
export function SuccessCelebration(props: Omit<CelebrationProps, 'type'>) {
  return <Celebration type="success" {...props} />;
}

export function MilestoneCelebration(props: Omit<CelebrationProps, 'type'>) {
  return <Celebration type="milestone" {...props} />;
}

export function FirstTimeCelebration(props: Omit<CelebrationProps, 'type'>) {
  return <Celebration type="first-time" {...props} />;
}

export function BigWinCelebration(props: Omit<CelebrationProps, 'type'>) {
  return <Celebration type="big-win" {...props} />;
}

// Hook for managing celebrations
export function useCelebration() {
  const [celebration, setCelebration] = useState<{
    isVisible: boolean;
    type: CelebrationProps['type'];
    title?: string;
    message?: string;
  }>({
    isVisible: false,
    type: 'success'
  });

  const showCelebration = (
    type: CelebrationProps['type'] = 'success',
    title?: string,
    message?: string
  ) => {
    setCelebration({
      isVisible: true,
      type,
      title,
      message
    });
  };

  const hideCelebration = () => {
    setCelebration(prev => ({ ...prev, isVisible: false }));
  };

  return {
    celebration,
    showCelebration,
    hideCelebration
  };
}