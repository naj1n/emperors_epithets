import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseStyles = "relative font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg overflow-hidden active:scale-95";
  
  const variants = {
    primary: "bg-red-900 text-amber-50 hover:bg-red-800 shadow-md border-2 border-red-950",
    secondary: "bg-amber-100 text-red-900 hover:bg-amber-200 border-2 border-amber-300 shadow-sm",
    outline: "bg-transparent text-stone-700 border-2 border-stone-400 hover:bg-stone-100 hover:text-stone-900",
    danger: "bg-red-100 text-red-700 hover:bg-red-200 border-2 border-red-200",
  };

  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-xl",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </button>
  );
};