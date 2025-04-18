
import React from 'react';
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ className }) => {
  return (
    <div className={cn("animate-spin rounded-full border-2 border-t-transparent", className || "h-5 w-5 border-white")} />
  );
};
