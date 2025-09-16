import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronRight, Sparkles } from 'lucide-react';

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'gradient' | 'glass' | 'glow';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  icon?: React.ReactNode;
  showChevron?: boolean;
  pulse?: boolean;
}

export function AnimatedButton({ 
  variant = 'default', 
  size = 'md', 
  children, 
  icon,
  showChevron = false,
  pulse = false,
  className,
  ...props 
}: AnimatedButtonProps) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-12 py-6 text-xl'
  };

  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:shadow-lg',
    gradient: 'bg-gradient-to-r from-primary via-accent to-secondary text-white hover:from-primary/95 hover:via-accent/95 hover:to-secondary/95 shadow-lg hover:shadow-xl bg-[length:200%_200%] hover:bg-[position:100%_100%] transition-all duration-500',
    glass: 'bg-white/10 backdrop-blur-lg border border-white/20 text-foreground hover:bg-white/20 hover:border-white/30 transition-all duration-300',
    glow: 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 animate-pulse-glow'
  };

  const animationClasses = cn(
    'transition-all duration-500 ease-out',
    'hover:scale-105 hover:-translate-y-2',
    'active:scale-95 active:translate-y-0',
    'transform-gpu',
    'hover:shadow-2xl',
    pulse && 'animate-pulse-glow'
  );

  return (
    <Button
      className={cn(
        sizeClasses[size],
        variantClasses[variant],
        animationClasses,
        'relative overflow-hidden group',
        className
      )}
      {...props}
    >
      {/* Enhanced Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1200 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      
      {/* Ripple effect on click */}
      <div className="absolute inset-0 rounded-md overflow-hidden">
        <div className="absolute inset-0 bg-white/20 scale-0 rounded-full group-active:scale-100 transition-transform duration-300 origin-center"></div>
      </div>
      
      <div className="relative flex items-center gap-2 z-10">
        {icon && (
          <span className="transition-transform duration-300 group-hover:scale-110">
            {icon}
          </span>
        )}
        <span className="font-semibold">{children}</span>
        {showChevron && (
          <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        )}
      </div>
    </Button>
  );
}

// Floating Action Button component
export function FloatingActionButton({ 
  children, 
  className, 
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) {
  return (
    <button
      className={cn(
        'fixed bottom-6 right-6 z-50',
        'w-14 h-14 rounded-full',
        'bg-primary text-primary-foreground',
        'shadow-lg hover:shadow-xl',
        'transition-all duration-300',
        'hover:scale-110 active:scale-95',
        'flex items-center justify-center',
        'backdrop-blur-lg',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// Magnetic button with cursor tracking
export function MagneticButton({ 
  children, 
  className, 
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) {
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!buttonRef.current) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    setMousePosition({ x: x * 0.3, y: y * 0.3 });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePosition({ x: 0, y: 0 });
  };

  return (
    <button
      ref={buttonRef}
      className={cn(
        'transition-all duration-300 ease-out',
        'transform-gpu',
        className
      )}
      style={{
        transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </button>
  );
}