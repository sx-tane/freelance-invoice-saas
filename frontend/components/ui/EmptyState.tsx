import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Users, 
  DollarSign, 
  Plus, 
  Search,
  Coffee,
  Sparkles,
  Heart,
  Target,
  Rocket,
  Star
} from 'lucide-react';
import { ActionButton, MagicButton } from './Button';

interface EmptyStateProps {
  type?: 'invoices' | 'clients' | 'revenue' | 'search' | 'general';
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  className?: string;
  showAnimation?: boolean;
}

const emptyStateConfigs = {
  invoices: {
    icon: FileText,
    title: "No invoices yet? Time to make it rain! 💰",
    descriptions: [
      "Your invoice list is emptier than a coffee shop at 3 AM. Let's fix that!",
      "Ready to turn your hard work into cold, hard cash? Create your first invoice!",
      "Every successful freelancer started with their first invoice. This could be yours!",
      "Your future self will thank you for starting this invoicing journey today!"
    ],
    actionLabel: "Create Your First Invoice",
    celebrationIcon: DollarSign,
    particles: true
  },
  clients: {
    icon: Users,
    title: "Your client roster is waiting for VIPs ⭐",
    descriptions: [
      "Every business empire starts with one amazing client. Who will be your first?",
      "Time to build your dream team of clients who love what you do!",
      "Your client list is like a garden - plant the first seed and watch it grow!",
      "The best client relationships start with a simple 'Add Client' click!"
    ],
    actionLabel: "Add Your First Client",
    celebrationIcon: Heart,
    particles: false
  },
  revenue: {
    icon: Target,
    title: "Your revenue graph needs some love 📈",
    descriptions: [
      "This chart is ready to show off your success story. Let's give it some data!",
      "Your revenue journey starts with the first invoice. Ready to begin?",
      "Empty charts are just opportunities in disguise. Time to fill this up!",
      "Your future millionaire self is waiting for you to take the first step!"
    ],
    actionLabel: "Start Earning",
    celebrationIcon: Star,
    particles: true
  },
  search: {
    icon: Search,
    title: "Nothing found, but don't give up! 🔍",
    descriptions: [
      "Your search came up empty, but so did the inventor of Post-it Notes at first!",
      "No matches found, but every great discovery starts with looking in new places.",
      "Sometimes the best things are hiding. Try a different search term!",
      "Not finding what you're looking for? Maybe it's time to create it instead!"
    ],
    actionLabel: "Clear Search",
    celebrationIcon: Sparkles,
    particles: false
  },
  general: {
    icon: Coffee,
    title: "Nothing to see here... yet! ☕",
    descriptions: [
      "This space is patiently waiting for something awesome. What will it be?",
      "Every masterpiece starts with a blank canvas. This is yours!",
      "The calm before the storm of productivity. Ready to make some waves?",
      "Your creativity is about to turn this empty space into something amazing!"
    ],
    actionLabel: "Get Started",
    celebrationIcon: Rocket,
    particles: true
  }
};

export function EmptyState({ 
  type = 'general', 
  title, 
  description, 
  action, 
  className = '',
  showAnimation = true 
}: EmptyStateProps) {
  const [descriptionIndex, setDescriptionIndex] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  
  const config = emptyStateConfigs[type];
  const IconComponent = config.icon;
  const CelebrationIcon = config.celebrationIcon;
  
  const currentTitle = title || config.title;
  const descriptions = description ? [description] : config.descriptions;
  const currentDescription = descriptions[descriptionIndex];

  useEffect(() => {
    if (descriptions.length > 1 && showAnimation) {
      const interval = setInterval(() => {
        setDescriptionIndex(prev => (prev + 1) % descriptions.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [descriptions.length, showAnimation]);

  const handleActionClick = () => {
    if (action?.onClick) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 1000);
      setTimeout(() => action.onClick(), 200);
    }
  };

  const floatingParticles = [...Array(config.particles ? 8 : 0)].map((_, i) => (
    <motion.div
      key={i}
      className="absolute w-1 h-1 bg-primary-300 rounded-full opacity-40"
      style={{
        left: `${20 + i * 10}%`,
        top: `${30 + (i % 3) * 20}%`,
      }}
      animate={{
        y: [-10, 10, -10],
        x: [-5, 5, -5],
        opacity: [0.2, 0.6, 0.2],
      }}
      transition={{
        duration: 3 + i * 0.5,
        repeat: Infinity,
        ease: "easeInOut",
        delay: i * 0.2
      }}
    />
  ));

  return (
    <motion.div 
      className={`flex flex-col items-center justify-center py-16 px-8 text-center relative overflow-hidden ${className}`}
      initial={showAnimation ? { opacity: 0, y: 20 } : {}}
      animate={showAnimation ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
    >
      {/* Floating particles */}
      {config.particles && (
        <div className="absolute inset-0 pointer-events-none">
          {floatingParticles}
        </div>
      )}

      {/* Main icon with hover animation */}
      <motion.div 
        className="relative mb-6"
        whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
        transition={{ duration: 0.4 }}
      >
        <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center relative">
          <IconComponent className="h-10 w-10 text-primary-600" />
          
          {/* Celebration overlay */}
          <AnimatePresence>
            {showCelebration && CelebrationIcon && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1.2, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <CelebrationIcon className="h-8 w-8 text-yellow-500" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sparkle effects */}
        {showCelebration && (
          <div className="absolute inset-0">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2"
                style={{
                  left: `${30 + i * 8}%`,
                  top: `${20 + (i % 2) * 60}%`,
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                  rotate: [0, 180, 360]
                }}
                transition={{
                  duration: 1,
                  delay: i * 0.1
                }}
              >
                ✨
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Title */}
      <motion.h3 
        className="text-xl font-semibold text-gray-900 mb-3 max-w-md"
        initial={showAnimation ? { opacity: 0 } : {}}
        animate={showAnimation ? { opacity: 1 } : {}}
        transition={{ delay: 0.1 }}
      >
        {currentTitle}
      </motion.h3>

      {/* Animated description */}
      <div className="h-16 flex items-center max-w-lg">
        <AnimatePresence mode="wait">
          <motion.p
            key={descriptionIndex}
            className="text-gray-600 leading-relaxed"
            initial={showAnimation ? { opacity: 0, y: 10 } : {}}
            animate={showAnimation ? { opacity: 1, y: 0 } : {}}
            exit={showAnimation ? { opacity: 0, y: -10 } : {}}
            transition={{ duration: 0.4 }}
          >
            {currentDescription}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Action button */}
      {action && (
        <motion.div
          className="mt-6"
          initial={showAnimation ? { opacity: 0, scale: 0.9 } : {}}
          animate={showAnimation ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.3 }}
        >
          <MagicButton
            onClick={handleActionClick}
            icon={action.icon || <Plus className="h-4 w-4" />}
            size="lg"
          >
            {action.label || config.actionLabel}
          </MagicButton>
        </motion.div>
      )}

      {/* Encouraging footer text */}
      <motion.p 
        className="text-xs text-gray-400 mt-6 max-w-sm"
        initial={showAnimation ? { opacity: 0 } : {}}
        animate={showAnimation ? { opacity: 1 } : {}}
        transition={{ delay: 0.5 }}
      >
        💡 Every expert was once a beginner. You've got this!
      </motion.p>
    </motion.div>
  );
}

// Specialized empty state components
export function InvoiceEmptyState({ action }: { action?: EmptyStateProps['action'] }) {
  return <EmptyState type="invoices" action={action} />;
}

export function ClientEmptyState({ action }: { action?: EmptyStateProps['action'] }) {
  return <EmptyState type="clients" action={action} />;
}

export function SearchEmptyState({ 
  searchTerm, 
  onClearSearch 
}: { 
  searchTerm: string; 
  onClearSearch: () => void; 
}) {
  return (
    <EmptyState 
      type="search" 
      description={`No results found for "${searchTerm}". Try a different search term or browse all items!`}
      action={{
        label: "Clear Search",
        onClick: onClearSearch,
        icon: <Search className="h-4 w-4" />
      }}
    />
  );
}

export function RevenueEmptyState({ action }: { action?: EmptyStateProps['action'] }) {
  return <EmptyState type="revenue" action={action} />;
}