import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Coffee, 
  Zap, 
  Sparkles, 
  Heart, 
  Star, 
  Crown,
  Rocket,
  PartyPopper,
  Ghost,
  Gamepad2,
  Music,
  Rainbow
} from 'lucide-react';

interface EasterEggProps {
  children: React.ReactNode;
}

// Konami Code sequence
const KONAMI_CODE = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'KeyB', 'KeyA'
];

// Fun sequences to discover
const SEQUENCES = {
  coffee: ['KeyC', 'KeyO', 'KeyF', 'KeyF', 'KeyE', 'KeyE'],
  party: ['KeyP', 'KeyA', 'KeyR', 'KeyT', 'KeyY'],
  magic: ['KeyM', 'KeyA', 'KeyG', 'KeyI', 'KeyC'],
  success: ['KeyS', 'KeyU', 'KeyC', 'KeyC', 'KeyE', 'KeyS', 'KeyS'],
  unicorn: ['KeyU', 'KeyN', 'KeyI', 'KeyC', 'KeyO', 'KeyR', 'KeyN'],
  money: ['KeyM', 'KeyO', 'KeyN', 'KeyE', 'KeyY'],
};

interface EasterEggMessage {
  icon: React.ElementType;
  title: string;
  message: string;
  color: string;
  bgColor: string;
  effect?: 'confetti' | 'sparkles' | 'hearts' | 'money';
}

const EASTER_EGG_MESSAGES: Record<string, EasterEggMessage> = {
  konami: {
    icon: Gamepad2,
    title: "Konami Code Activated! 🎮",
    message: "You found the legendary cheat code! You must be a true gamer at heart. Here's to all the nostalgic hours spent gaming!",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    effect: 'confetti'
  },
  coffee: {
    icon: Coffee,
    title: "Coffee Break Activated! ☕",
    message: "Ah, a fellow coffee enthusiast! Fun fact: 90% of freelancers run on coffee and dreams. You're in good company!",
    color: "text-amber-600",
    bgColor: "bg-amber-100",
    effect: 'sparkles'
  },
  party: {
    icon: PartyPopper,
    title: "Party Mode Enabled! 🎉",
    message: "Someone's ready to celebrate! Whether you just landed a big client or finished a tough project, you deserve this party!",
    color: "text-pink-600",
    bgColor: "bg-pink-100",
    effect: 'confetti'
  },
  magic: {
    icon: Sparkles,
    title: "Magic Spell Cast! ✨",
    message: "Abracadabra! You've unlocked the magic of organized invoicing. May your payments always be swift and your clients always happy!",
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
    effect: 'sparkles'
  },
  success: {
    icon: Crown,
    title: "Success Mantra Activated! 👑",
    message: "You typed 'SUCCESS' and that's exactly what you're going to achieve! Remember: every expert was once a beginner!",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    effect: 'hearts'
  },
  unicorn: {
    icon: Rainbow,
    title: "Unicorn Mode Unlocked! 🦄",
    message: "Congratulations! You've achieved legendary status. Unicorn businesses are rare and magical - just like you're going to be!",
    color: "text-purple-600",
    bgColor: "bg-gradient-to-r from-purple-100 to-pink-100",
    effect: 'sparkles'
  },
  money: {
    icon: Star,
    title: "Money Mindset Activated! 💰",
    message: "Cha-ching! You're thinking about money, and that's the first step to making more of it. Time to turn those invoices into income!",
    color: "text-green-600",
    bgColor: "bg-green-100",
    effect: 'money'
  }
};

const CLICK_SEQUENCES = {
  triple: 3,
  quintuple: 5,
  crazy: 10
};

const CLICK_MESSAGES = {
  triple: "Triple click detected! Someone's eager! 🖱️",
  quintuple: "Five clicks?! You're really going for it! 🚀",
  crazy: "10 clicks?! Okay, okay, you win! Here's your prize! 🏆"
};

export function EasterEggProvider({ children }: EasterEggProps) {
  const [keySequence, setKeySequence] = useState<string[]>([]);
  const [activeEasterEgg, setActiveEasterEgg] = useState<string | null>(null);
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [shakeCount, setShakeCount] = useState(0);

  // Reset key sequence after timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      if (keySequence.length > 0) {
        setKeySequence([]);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [keySequence]);

  // Handle keydown events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      setKeySequence(prev => {
        const newSequence = [...prev, event.code].slice(-10); // Keep only last 10 keys
        
        // Check for sequences
        Object.entries(SEQUENCES).forEach(([name, sequence]) => {
          if (newSequence.slice(-sequence.length).join(',') === sequence.join(',')) {
            setActiveEasterEgg(name);
            return;
          }
        });

        // Check for Konami code
        if (newSequence.slice(-KONAMI_CODE.length).join(',') === KONAMI_CODE.join(',')) {
          setActiveEasterEgg('konami');
          return;
        }

        return newSequence;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle click spam detection
  const handleClick = useCallback(() => {
    const now = Date.now();
    if (now - lastClickTime < 500) { // Within 500ms
      setClickCount(prev => {
        const newCount = prev + 1;
        
        // Check for click sequences
        Object.entries(CLICK_SEQUENCES).forEach(([name, count]) => {
          if (newCount === count) {
            setActiveEasterEgg(`click_${name}`);
          }
        });

        return newCount;
      });
    } else {
      setClickCount(1);
    }
    setLastClickTime(now);
  }, [lastClickTime]);

  // Handle device shake (for mobile)
  useEffect(() => {
    let lastTime = 0;
    let lastX = 0, lastY = 0, lastZ = 0;

    const handleMotion = (event: DeviceMotionEvent) => {
      const current = Date.now();
      if ((current - lastTime) < 100) return;

      const diffTime = current - lastTime;
      lastTime = current;

      const acceleration = event.accelerationIncludingGravity;
      if (!acceleration) return;

      const x = acceleration.x || 0;
      const y = acceleration.y || 0;
      const z = acceleration.z || 0;

      const speed = Math.abs(x + y + z - lastX - lastY - lastZ) / diffTime * 10000;

      if (speed > 300) {
        setShakeCount(prev => {
          const newCount = prev + 1;
          if (newCount >= 3) {
            setActiveEasterEgg('shake');
            return 0;
          }
          return newCount;
        });
      }

      lastX = x;
      lastY = y;
      lastZ = z;
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, []);

  const closeEasterEgg = () => {
    setActiveEasterEgg(null);
    setClickCount(0);
    setShakeCount(0);
  };

  const getEasterEggData = () => {
    if (!activeEasterEgg) return null;

    if (activeEasterEgg.startsWith('click_')) {
      const type = activeEasterEgg.replace('click_', '');
      return {
        icon: Zap,
        title: "Click Master! ⚡",
        message: CLICK_MESSAGES[type as keyof typeof CLICK_MESSAGES] || "You clicked a lot!",
        color: "text-blue-600",
        bgColor: "bg-blue-100",
        effect: 'sparkles' as const
      };
    }

    if (activeEasterEgg === 'shake') {
      return {
        icon: Ghost,
        title: "Shake It Off! 👻",
        message: "You shook your device like a polaroid picture! Here's to all the Taylor Swift fans out there!",
        color: "text-purple-600",
        bgColor: "bg-purple-100",
        effect: 'confetti' as const
      };
    }

    return EASTER_EGG_MESSAGES[activeEasterEgg];
  };

  const renderEffect = (effect?: string) => {
    if (!effect) return null;

    const effectElements = [];
    const count = effect === 'confetti' ? 30 : 15;

    for (let i = 0; i < count; i++) {
      let emoji = '✨';
      let colors = ['text-yellow-400', 'text-pink-400', 'text-blue-400'];
      
      switch (effect) {
        case 'confetti':
          emoji = ['🎉', '🎊', '🌟', '✨'][i % 4];
          break;
        case 'hearts':
          emoji = ['❤️', '💖', '💕', '💗'][i % 4];
          colors = ['text-red-400', 'text-pink-400', 'text-purple-400'];
          break;
        case 'money':
          emoji = ['💰', '💎', '🤑', '💵'][i % 4];
          colors = ['text-green-400', 'text-yellow-400'];
          break;
        default:
          emoji = '✨';
      }

      effectElements.push(
        <motion.div
          key={i}
          className={`absolute text-2xl ${colors[i % colors.length]} pointer-events-none`}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          initial={{ 
            scale: 0, 
            opacity: 0, 
            rotate: 0,
            y: 0
          }}
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
            rotate: [0, 180, 360],
            y: [-20, -60, -100]
          }}
          transition={{
            duration: 2,
            delay: i * 0.1,
            ease: "easeOut"
          }}
        >
          {emoji}
        </motion.div>
      );
    }

    return effectElements;
  };

  const easterEggData = getEasterEggData();

  return (
    <div onClick={handleClick}>
      {children}
      
      <AnimatePresence>
        {activeEasterEgg && easterEggData && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeEasterEgg}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Effects */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {renderEffect(easterEggData.effect)}
            </div>

            {/* Easter Egg Card */}
            <motion.div
              className={`relative max-w-md w-full mx-4 rounded-2xl shadow-2xl p-8 text-center overflow-hidden ${easterEggData.bgColor}`}
              initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotate: 10 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 20 
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                className="text-6xl mb-4"
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity 
                }}
              >
                <easterEggData.icon className={`h-16 w-16 mx-auto ${easterEggData.color}`} />
              </motion.div>

              <motion.h3
                className="text-2xl font-bold text-gray-900 mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {easterEggData.title}
              </motion.h3>

              <motion.p
                className="text-gray-700 leading-relaxed mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {easterEggData.message}
              </motion.p>

              <motion.button
                onClick={closeEasterEgg}
                className="px-6 py-2 bg-white/80 hover:bg-white text-gray-800 rounded-full font-medium transition-colors"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Awesome! 🎉
              </motion.button>

              <motion.p
                className="text-xs text-gray-500 mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                Keep exploring for more surprises! 🔍
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Hook for triggering easter eggs programmatically
export function useEasterEggs() {
  const [activeEasterEgg, setActiveEasterEgg] = useState<string | null>(null);

  const triggerEasterEgg = (type: keyof typeof EASTER_EGG_MESSAGES) => {
    setActiveEasterEgg(type);
  };

  const closeEasterEgg = () => {
    setActiveEasterEgg(null);
  };

  return {
    activeEasterEgg,
    triggerEasterEgg,
    closeEasterEgg
  };
}

// Fun development mode easter egg
export function DevModeEasterEgg() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`
        🎉 Welcome, Developer! 🎉
        
        You've found the secret developer console!
        
        Try these easter eggs:
        - Type 'coffee' for a caffeine boost
        - Type 'party' to celebrate
        - Type 'magic' for some sparkles
        - Type 'success' for motivation
        - Try the Konami code (↑↑↓↓←→←→BA)
        - Click rapidly on any element
        - Shake your phone (mobile)
        
        Happy coding! ☕✨
      `);
    }
  }, []);

  return null;
}