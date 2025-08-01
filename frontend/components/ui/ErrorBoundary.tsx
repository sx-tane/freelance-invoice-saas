import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, RefreshCw, Coffee, Zap, Ghost, Bug, Frown, Meh } from 'lucide-react';
import { Button, ActionButton } from './Button';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error?: Error;
  resetError: () => void;
}

const errorMessages = [
  {
    title: "Oops! Something went sideways",
    message: "Don't worry, even the best of us trip over our own code sometimes. Let's give it another shot!",
    icon: Frown,
    color: "text-orange-600",
    bgColor: "bg-orange-100"
  },
  {
    title: "Houston, we have a problem",
    message: "The code gremlins are at it again! Time to show them who's boss.",
    icon: Bug,
    color: "text-red-600",
    bgColor: "bg-red-100"
  },
  {
    title: "Well, that's embarrassing...",
    message: "Something broke and it's definitely not your fault. Promise!",
    icon: Meh,
    color: "text-purple-600",
    bgColor: "bg-purple-100"
  },
  {
    title: "Error 404: Fun not found",
    message: "Just kidding! The fun is still here, but something else went missing. Let's find it together.",
    icon: Ghost,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100"
  },
  {
    title: "Coffee break needed?",
    message: "Even our code needs a break sometimes. How about we both try again after a virtual coffee?",
    icon: Coffee,
    color: "text-amber-600",
    bgColor: "bg-amber-100"
  }
];

function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const [currentErrorIndex, setCurrentErrorIndex] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  
  const currentError = errorMessages[currentErrorIndex];
  const IconComponent = currentError.icon;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentErrorIndex(prev => (prev + 1) % errorMessages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 600);
  };

  return (
    <motion.div 
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center overflow-hidden relative"
        animate={isShaking ? { x: [-5, 5, -5, 5, 0] } : {}}
        transition={{ duration: 0.6 }}
      >
        {/* Floating decorations */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-2 h-2 ${currentError.bgColor} rounded-full opacity-20`}
              style={{
                left: `${10 + i * 15}%`,
                top: `${10 + (i % 2) * 70}%`,
              }}
              animate={{
                y: [-10, 10, -10],
                x: [-5, 5, -5],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentErrorIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="relative z-10"
          >
            <motion.div 
              className="flex justify-center mb-6"
              whileHover={{ scale: 1.1, rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.3 }}
            >
              <div className={`p-4 ${currentError.bgColor} rounded-full cursor-pointer`} onClick={handleShake}>
                <IconComponent className={`h-8 w-8 ${currentError.color}`} />
              </div>
            </motion.div>
            
            <motion.h2 
              className="text-xl font-bold text-gray-900 mb-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {currentError.title}
            </motion.h2>
            
            <motion.p 
              className="text-gray-600 mb-6 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {currentError.message}
            </motion.p>
          </motion.div>
        </AnimatePresence>
        
        {error?.message && (
          <motion.div 
            className="bg-gray-50 rounded-lg p-3 mb-6 text-sm text-gray-700"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ delay: 0.3 }}
          >
            <strong>Technical details:</strong> {error.message}
          </motion.div>
        )}
        
        <motion.div 
          className="space-y-3 relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <ActionButton 
            onClick={resetError} 
            className="w-full"
            icon={<Zap className="h-4 w-4" />}
            rippleEffect
          >
            Try Again
          </ActionButton>
          
          <Button 
            variant="secondary" 
            onClick={() => window.location.reload()}
            className="w-full"
            icon={<RefreshCw className="h-4 w-4" />}
          >
            Reload Page
          </Button>
        </motion.div>
        
        {process.env.NODE_ENV === 'development' && error && (
          <motion.details 
            className="mt-6 text-left"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
              🐛 Error Details (Development)
            </summary>
            <pre className="mt-3 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg overflow-auto max-h-32">
              {error.stack}
            </pre>
          </motion.details>
        )}

        <motion.p 
          className="text-xs text-gray-400 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          💡 Pro tip: Click the icon above for a surprise!
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

const inlineErrorMessages = [
  "Oops! This section decided to take a coffee break ☕",
  "Something's not quite right here... but we're on it! 🔧",
  "Houston, we have a tiny problem 🚀",
  "Well, this is awkward... 😅",
  "The data went on a little adventure. Let's bring it back! 🗺️"
];

export function PageErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * inlineErrorMessages.length);
    setMessageIndex(randomIndex);
  }, []);

  return (
    <motion.div 
      className="flex items-center justify-center min-h-64 p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="text-center max-w-md">
        <motion.div 
          className="flex justify-center mb-4"
          animate={{ rotate: [0, -5, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="p-3 bg-orange-100 rounded-full">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
          </div>
        </motion.div>
        
        <motion.h3 
          className="text-lg font-semibold text-gray-900 mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          Content Playing Hide and Seek
        </motion.h3>
        
        <motion.p 
          className="text-gray-600 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {inlineErrorMessages[messageIndex]}
        </motion.p>
        
        {error?.message && (
          <motion.p 
            className="text-sm text-gray-500 mb-4 italic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Technical whisper: {error.message}
          </motion.p>
        )}
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <ActionButton 
            onClick={resetError} 
            size="sm"
            icon={<RefreshCw className="h-4 w-4" />}
            rippleEffect
          >
            Let's Try Again
          </ActionButton>
        </motion.div>
      </div>
    </motion.div>
  );
}

// New fun 404 component
export function NotFoundFallback() {
  return (
    <motion.div 
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-center max-w-lg">
        <motion.div 
          className="text-8xl mb-6"
          animate={{ 
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          🕵️‍♀️
        </motion.div>
        
        <motion.h1 
          className="text-6xl font-bold text-gray-900 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          404
        </motion.h1>
        
        <motion.h2 
          className="text-2xl font-semibold text-gray-700 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Page Detective on the Case!
        </motion.h2>
        
        <motion.p 
          className="text-lg text-gray-600 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          This page seems to have wandered off. Don't worry though - 
          our detective is already on the case! In the meantime, 
          let's get you back to safety.
        </motion.p>
        
        <motion.div 
          className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <ActionButton 
            onClick={() => window.history.back()}
            variant="primary"
            size="lg"
            rippleEffect
          >
            Go Back
          </ActionButton>
          
          <ActionButton 
            onClick={() => window.location.href = '/'}
            variant="secondary"
            size="lg"
          >
            Home Sweet Home
          </ActionButton>
        </motion.div>
      </div>
    </motion.div>
  );
}