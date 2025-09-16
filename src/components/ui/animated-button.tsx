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
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    gradient: 'bg-gradient-to-r from-primary to-accent text-white hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl',
    glass: 'bg-white/10 backdrop-blur-lg border border-white/20 text-foreground hover:bg-white/20',
    glow: 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30'
  };

  const animationClasses = cn(
    'transition-all duration-300 ease-out',
    'hover:scale-105 hover:-translate-y-1',
    'active:scale-95 active:translate-y-0',
    'transform-gpu',
    pulse && 'animate-pulse'
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
      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
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