import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  Target,
  Users,
  FileText,
  DollarSign,
  BarChart3,
  Zap,
  Heart,
  Coffee,
  Rocket
} from 'lucide-react';
import { ActionButton, MagicButton } from './Button';

interface WelcomeStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  tip: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface WelcomeProps {
  isVisible: boolean;
  onClose: () => void;
  onComplete: () => void;
  userName?: string;
  steps?: WelcomeStep[];
  autoAdvance?: boolean;
  showProgress?: boolean;
}

const defaultSteps: WelcomeStep[] = [
  {
    id: 'welcome',
    title: "Welcome to InvoicePro! 🎉",
    description: "Ready to turn your freelance hustle into a money-making machine? We're here to make invoicing so easy, you'll wonder why you ever did it any other way!",
    icon: Rocket,
    tip: "💡 Pro tip: The secret to successful freelancing is getting paid on time. We've got your back!"
  },
  {
    id: 'clients',
    title: "Build Your Client Empire 👑",
    description: "Every business starts with great relationships. Add your clients here and keep all their important details organized. No more digging through emails for contact info!",
    icon: Users,
    tip: "🎯 Quick win: Add your favorite client first - they deserve the VIP treatment!"
  },
  {
    id: 'invoices',
    title: "Create Stunning Invoices ✨",
    description: "Say goodbye to boring, generic invoices! Our templates are so professional, your clients will be impressed before they even see the total. First impressions matter!",
    icon: FileText,
    tip: "🚀 Success secret: Professional invoices get paid 3x faster than DIY ones!"
  },
  {
    id: 'payments',
    title: "Get Paid Like a Boss 💰",
    description: "Track every penny, celebrate every payment, and never wonder 'Did they pay me yet?' again. Your cash flow dashboard will become your new favorite place.",
    icon: DollarSign,
    tip: "💪 Power move: Set up payment reminders and watch your collection rate soar!"
  },
  {
    id: 'insights',
    title: "Become a Business Genius 📈",
    description: "Numbers don't lie, and ours tell amazing stories! Discover trends, spot opportunities, and make decisions that will grow your freelance empire.",
    icon: BarChart3,
    tip: "🧠 Smart move: Check your insights weekly to stay ahead of the game!"
  },
  {
    id: 'ready',
    title: "You're All Set! 🌟",
    description: "Time to unleash your freelance superpowers! Remember, every expert was once a beginner, and every pro was once an amateur. Your journey to invoicing mastery starts now!",
    icon: Target,
    tip: "🎊 Celebration time: You're about to make your freelance life 10x easier!"
  }
];

const welcomeMessages = [
  "Welcome aboard the success train! 🚂",
  "Ready to level up your freelance game? 🎮", 
  "Let's turn your skills into serious cash! 💎",
  "Your invoicing journey starts here! 🗺️",
  "Time to make your freelance dreams reality! ✨"
];

export function Welcome({
  isVisible,
  onClose,
  onComplete,
  userName,
  steps = defaultSteps,
  autoAdvance = false,
  showProgress = true
}: WelcomeProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [welcomeMessageIndex, setWelcomeMessageIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const step = steps[currentStep];
  const IconComponent = step?.icon || Sparkles;
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  // Rotate welcome messages on first step
  useEffect(() => {
    if (currentStep === 0 && isVisible) {
      const interval = setInterval(() => {
        setWelcomeMessageIndex(prev => (prev + 1) % welcomeMessages.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [currentStep, isVisible]);

  // Auto advance steps (optional)
  useEffect(() => {
    if (autoAdvance && isVisible && !isLastStep) {
      const timer = setTimeout(() => {
        handleNext();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, autoAdvance, isVisible, isLastStep]);

  const handleNext = async () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    if (step?.action) {
      step.action.onClick();
    }
    
    if (isLastStep) {
      onComplete();
    } else {
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsAnimating(false);
      }, 200);
    }
  };

  const handlePrevious = () => {
    if (isAnimating || isFirstStep) return;
    
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(prev => prev - 1);
      setIsAnimating(false);
    }, 200);
  };

  const handleSkip = () => {
    onComplete();
  };

  if (!isVisible || !step) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-pink-900/20 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Floating elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/10 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-20, 20, -20],
                x: [-10, 10, -10],
                opacity: [0.1, 0.3, 0.1],
                scale: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 4 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.3
              }}
            />
          ))}
        </div>

        {/* Welcome Card */}
        <motion.div
          className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden"
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Progress bar */}
          {showProgress && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100">
              <motion.div
                className="h-full bg-gradient-to-r from-primary-500 to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          )}

          <div className="p-8 md:p-12">
            {/* Header with step indicator */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>Step {currentStep + 1} of {steps.length}</span>
              </div>
              
              {currentStep === 0 && userName && (
                <motion.div
                  className="text-sm text-primary-600 font-medium"
                  key={welcomeMessageIndex}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  Hey {userName}! {welcomeMessages[welcomeMessageIndex]}
                </motion.div>
              )}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="text-center"
              >
                {/* Icon */}
                <motion.div
                  className="relative mb-8"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary-100 to-purple-100 rounded-full flex items-center justify-center relative overflow-hidden">
                    <IconComponent className="h-12 w-12 text-primary-600 z-10" />
                    
                    {/* Animated background */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-primary-400/20 to-purple-400/20"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </div>

                  {/* Sparkles around icon */}
                  {currentStep === 0 && (
                    <div className="absolute inset-0">
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute text-yellow-400"
                          style={{
                            left: `${20 + i * 12}%`,
                            top: `${20 + (i % 2) * 60}%`,
                          }}
                          animate={{
                            scale: [0, 1, 0],
                            rotate: [0, 180, 360],
                            opacity: [0, 1, 0]
                          }}
                          transition={{
                            duration: 2,
                            delay: i * 0.3,
                            repeat: Infinity,
                            repeatDelay: 2
                          }}
                        >
                          ✨
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>

                {/* Title */}
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {step.title}
                </h2>

                {/* Description */}
                <p className="text-lg text-gray-600 mb-6 leading-relaxed max-w-lg mx-auto">
                  {step.description}
                </p>

                {/* Tip */}
                <motion.div
                  className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 mb-8 max-w-md mx-auto"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <p className="text-amber-800 text-sm font-medium">
                    {step.tip}
                  </p>
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <motion.div
              className="flex items-center justify-between mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex space-x-3">
                {!isFirstStep && (
                  <ActionButton
                    onClick={handlePrevious}
                    variant="ghost"
                    icon={<ChevronLeft className="h-4 w-4" />}
                    disabled={isAnimating}
                  >
                    Previous
                  </ActionButton>
                )}
                
                <ActionButton
                  onClick={handleSkip}
                  variant="ghost"
                  className="text-gray-500"
                  disabled={isAnimating}
                >
                  Skip Tour
                </ActionButton>
              </div>

              <div className="flex items-center space-x-3">
                <MagicButton
                  onClick={handleNext}
                  icon={isLastStep ? <Heart className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  disabled={isAnimating}
                  className="px-8"
                >
                  {isLastStep ? "Let's Get Started!" : "Next"}
                </MagicButton>
              </div>
            </div>

            {/* Step dots */}
            <motion.div
              className="flex justify-center space-x-2 mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => !isAnimating && setCurrentStep(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentStep 
                      ? 'bg-primary-500 w-8' 
                      : index < currentStep 
                        ? 'bg-green-400' 
                        : 'bg-gray-300'
                  }`}
                  disabled={isAnimating}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Hook for managing welcome state
export function useWelcome() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);

  const showWelcome = () => setIsVisible(true);
  const hideWelcome = () => setIsVisible(false);
  const completeWelcome = () => {
    setIsVisible(false);
    setHasSeenWelcome(true);
    // Store in localStorage so user doesn't see it again
    if (typeof window !== 'undefined') {
      localStorage.setItem('hasSeenWelcome', 'true');
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const seen = localStorage.getItem('hasSeenWelcome');
      setHasSeenWelcome(seen === 'true');
    }
  }, []);

  return {
    isVisible,
    hasSeenWelcome,
    showWelcome,
    hideWelcome,
    completeWelcome
  };
}