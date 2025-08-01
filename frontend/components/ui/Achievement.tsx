import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Crown, 
  Target, 
  Zap,
  Heart,
  Coffee,
  Rocket,
  Award,
  CheckCircle,
  Lock,
  Sparkles
} from 'lucide-react';
import { ActionButton } from './Button';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  category: 'invoices' | 'clients' | 'revenue' | 'milestones' | 'special';
  requirement: number;
  currentProgress: number;
  unlocked: boolean;
  unlockedAt?: Date;
  reward?: {
    type: 'badge' | 'feature' | 'discount';
    value: string;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface AchievementProps {
  achievements: Achievement[];
  onAchievementClick?: (achievement: Achievement) => void;
  showProgress?: boolean;  
  compact?: boolean;
}

const rarityColors = {
  common: {
    bg: 'bg-gray-100',
    border: 'border-gray-300',
    text: 'text-gray-700',
    glow: 'shadow-gray-200'
  },
  rare: {
    bg: 'bg-blue-100',
    border: 'border-blue-300',
    text: 'text-blue-700',
    glow: 'shadow-blue-200'
  },
  epic: {
    bg: 'bg-purple-100',
    border: 'border-purple-300',
    text: 'text-purple-700',
    glow: 'shadow-purple-200'
  },
  legendary: {
    bg: 'bg-yellow-100',
    border: 'border-yellow-300',
    text: 'text-yellow-700',
    glow: 'shadow-yellow-200'
  }
};

// Default achievements for the invoicing app
const defaultAchievements: Achievement[] = [
  {
    id: 'first_invoice',
    title: 'Getting Started',
    description: 'Create your first invoice',
    icon: Star,
    category: 'invoices',
    requirement: 1,
    currentProgress: 0,
    unlocked: false,
    rarity: 'common'
  },
  {
    id: 'invoice_streak',
    title: 'Invoice Machine',
    description: 'Create 10 invoices',
    icon: Zap,
    category: 'invoices',
    requirement: 10,
    currentProgress: 0,
    unlocked: false,
    rarity: 'rare'
  },
  {
    id: 'first_client',
    title: 'People Person',
    description: 'Add your first client',
    icon: Heart,
    category: 'clients',
    requirement: 1,
    currentProgress: 0,
    unlocked: false,
    rarity: 'common'
  },
  {
    id: 'client_collector',
    title: 'Network Builder',
    description: 'Manage 25 clients',
    icon: Crown,
    category: 'clients',
    requirement: 25,
    currentProgress: 0,
    unlocked: false,
    rarity: 'epic'
  },
  {
    id: 'first_payment',
    title: 'Cha-Ching!',
    description: 'Receive your first payment',
    icon: Trophy,
    category: 'revenue',
    requirement: 1,
    currentProgress: 0,
    unlocked: false,
    rarity: 'rare'
  },
  {
    id: 'revenue_milestone',
    title: 'High Roller',
    description: 'Earn $10,000 in total revenue',
    icon: Rocket,
    category: 'revenue',
    requirement: 10000,
    currentProgress: 0,
    unlocked: false,
    rarity: 'legendary'
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Send an invoice before 9 AM',
    icon: Coffee,
    category: 'special',
    requirement: 1,
    currentProgress: 0,
    unlocked: false,
    rarity: 'rare'
  },
  {
    id: 'perfectionist',
    title: 'Perfectionist',
    description: 'Send 50 invoices with zero errors',
    icon: Target,
    category: 'special',
    requirement: 50,
    currentProgress: 0,
    unlocked: false,
    rarity: 'legendary'
  }
];

function AchievementCard({ 
  achievement, 
  onClick, 
  showProgress = true,
  compact = false 
}: { 
  achievement: Achievement;
  onClick?: (achievement: Achievement) => void;
  showProgress?: boolean;
  compact?: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const IconComponent = achievement.icon;
  const rarity = rarityColors[achievement.rarity];
  const progress = Math.min((achievement.currentProgress / achievement.requirement) * 100, 100);

  return (
    <motion.div
      className={`
        relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300
        ${achievement.unlocked 
          ? `${rarity.bg} ${rarity.border} ${rarity.glow} shadow-lg` 
          : 'bg-gray-50 border-gray-200 opacity-60'
        }
        ${compact ? 'p-3' : 'p-4'}
        hover:scale-105 hover:shadow-xl
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => onClick?.(achievement)}
    >
      {/* Rarity glow effect for unlocked achievements */}
      {achievement.unlocked && achievement.rarity !== 'common' && (
        <motion.div
          className={`absolute inset-0 rounded-xl ${rarity.bg} opacity-20 blur-md`}
          animate={{
            opacity: [0.2, 0.4, 0.2],
            scale: [1, 1.05, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <motion.div 
            className={`
              p-3 rounded-full 
              ${achievement.unlocked 
                ? `${rarity.bg} ${rarity.text}` 
                : 'bg-gray-200 text-gray-400'
              }
            `}
            animate={{
              rotate: achievement.unlocked && isHovered ? [0, 10, -10, 0] : 0,
              scale: achievement.unlocked && isHovered ? 1.1 : 1
            }}
            transition={{ duration: 0.4 }}
          >
            {achievement.unlocked ? (
              <IconComponent className={`h-6 w-6 ${compact ? 'h-5 w-5' : 'h-6 w-6'}`} />
            ) : (
              <Lock className={`h-6 w-6 ${compact ? 'h-5 w-5' : 'h-6 w-6'}`} />
            )}
          </motion.div>

          {/* Rarity indicator */}
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${rarity.bg} ${rarity.text}`}>
            {achievement.rarity}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className={`font-semibold ${compact ? 'text-sm' : 'text-lg'} text-gray-900`}>
            {achievement.title}
          </h3>
          
          <p className={`text-gray-600 ${compact ? 'text-xs' : 'text-sm'}`}>
            {achievement.description}
          </p>

          {showProgress && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">
                  Progress: {achievement.currentProgress}/{achievement.requirement}
                </span>
                <span className="font-medium text-gray-700">
                  {Math.round(progress)}%
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${
                    achievement.unlocked 
                      ? 'bg-gradient-to-r from-green-400 to-green-500' 
                      : 'bg-gradient-to-r from-blue-400 to-blue-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          )}

          {achievement.unlocked && achievement.unlockedAt && (
            <p className="text-xs text-gray-500 italic">
              Unlocked {achievement.unlockedAt.toLocaleDateString()}
            </p>
          )}

          {achievement.reward && achievement.unlocked && (
            <motion.div
              className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-xs text-yellow-800 font-medium flex items-center">
                <Trophy className="h-3 w-3 mr-1" />
                Reward: {achievement.reward.value}
              </p>
            </motion.div>
          )}
        </div>

        {/* Sparkle effects for legendary achievements */}
        {achievement.unlocked && achievement.rarity === 'legendary' && isHovered && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-yellow-400"
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${20 + (i % 2) * 60}%`,
                }}
                animate={{
                  scale: [0, 1, 0],
                  rotate: [0, 180, 360],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.2,
                  repeat: Infinity,
                  repeatDelay: 2
                }}
              >
                ✨
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function AchievementTracker({ 
  achievements = defaultAchievements, 
  onAchievementClick,
  showProgress = true,
  compact = false 
}: AchievementProps) {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredAchievements = achievements.filter(achievement => {
    const statusMatch = filter === 'all' || 
      (filter === 'unlocked' && achievement.unlocked) ||
      (filter === 'locked' && !achievement.unlocked);
    
    const categoryMatch = categoryFilter === 'all' || achievement.category === categoryFilter;
    
    return statusMatch && categoryMatch;
  });

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const completionPercentage = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Achievements</h2>
          <p className="text-gray-600">
            {unlockedCount} of {totalCount} unlocked ({completionPercentage}%)
          </p>
        </div>
        
        <motion.div
          className="flex items-center space-x-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="text-right">
            <div className="text-2xl font-bold text-primary-600">{unlockedCount}</div>
            <div className="text-xs text-gray-500">Unlocked</div>
          </div>
          <Trophy className="h-8 w-8 text-yellow-500" />
        </motion.div>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Overall Progress</span>
          <span className="font-medium text-gray-900">{completionPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="all">All Achievements</option>
          <option value="unlocked">Unlocked</option>
          <option value="locked">Locked</option>
        </select>
        
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="all">All Categories</option>
          <option value="invoices">Invoices</option>
          <option value="clients">Clients</option>
          <option value="revenue">Revenue</option>
          <option value="special">Special</option>
        </select>
      </div>

      {/* Achievement Grid */}
      <motion.div
        className={`grid gap-4 ${
          compact 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}
        layout
      >
        <AnimatePresence>
          {filteredAchievements.map((achievement) => (
            <motion.div
              key={achievement.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <AchievementCard
                achievement={achievement}
                onClick={onAchievementClick}
                showProgress={showProgress}
                compact={compact}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredAchievements.length === 0 && (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No achievements found
          </h3>
          <p className="text-gray-600">
            Try adjusting your filters or start completing some tasks!
          </p>
        </motion.div>
      )}
    </div>
  );
}

// Hook for managing achievements
export function useAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>(defaultAchievements);

  const updateProgress = (achievementId: string, newProgress: number) => {
    setAchievements(prev => prev.map(achievement => {
      if (achievement.id === achievementId) {
        const wasUnlocked = achievement.unlocked;
        const shouldUnlock = newProgress >= achievement.requirement;
        
        return {
          ...achievement,
          currentProgress: newProgress,
          unlocked: shouldUnlock,
          unlockedAt: shouldUnlock && !wasUnlocked ? new Date() : achievement.unlockedAt
        };
      }
      return achievement;
    }));
  };

  const unlockAchievement = (achievementId: string) => {
    setAchievements(prev => prev.map(achievement => {
      if (achievement.id === achievementId && !achievement.unlocked) {
        return {
          ...achievement,
          unlocked: true,
          unlockedAt: new Date(),
          currentProgress: achievement.requirement
        };
      }
      return achievement;
    }));
  };

  const getUnlockedCount = () => achievements.filter(a => a.unlocked).length;
  const getTotalCount = () => achievements.length;
  const getCompletionPercentage = () => Math.round((getUnlockedCount() / getTotalCount()) * 100);

  return {
    achievements,
    updateProgress,
    unlockAchievement,
    getUnlockedCount,
    getTotalCount,
    getCompletionPercentage
  };
}