'use client';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  fullPage?: boolean;
}

export default function LoadingSpinner({ 
  size = 'medium', 
  fullPage = false 
}: LoadingSpinnerProps) {
  const sizeClass = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  }[size];
  
  const spinner = (
    <div className="flex items-center justify-center">
      <div className={`${sizeClass} border-4 border-gray-300 border-t-teal-500 rounded-full animate-spin`}></div>
    </div>
  );
  
  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-70 z-50">
        {spinner}
      </div>
    );
  }
  
  return spinner;
}
