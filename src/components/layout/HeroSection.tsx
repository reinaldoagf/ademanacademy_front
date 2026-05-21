"use client";

import { 
  Plus, 
} from "lucide-react";
import html from 'react-inner-html';

interface HeroProps {
    htmlSubTitle: string;
    htmlTitle: string;
    actionLabel?: string;
    isActionDisabled?: boolean;
    onAction?: () => void;
    navigateBack?: string | null;
}

const HeroSection: React.FC<HeroProps> = ({
    htmlTitle,
    htmlSubTitle,
    actionLabel,
    isActionDisabled = false,
    onAction,
    navigateBack = null
}) => {
   return (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-[36px] pb-[24px] px-[44px] bg-white/80">
            <div>
              <h2 className="text-2xl font-anton text-gray-800" {...html(htmlTitle)}></h2>
              <p className="text-xs text-gray-500 font-questrial"  {...html(htmlSubTitle)}></p>
            </div>
                    {/* Acción Condicional */}
                    {actionLabel && onAction && (
                        <div className="flex">
                          <button 
                            onClick={onAction} className="gradient-purple font-questrial text-white px-4 py-2 cursor-pointer flex items-center justify-center gap-2 font-medium shadow-md shadow-purple-200 hover:opacity-90 transition text-xs self-start sm:self-auto cursor-pointer">
                            <Plus className="w-4 h-4" /> 
                            {actionLabel}
                          </button>
                        </div>
                    )}
            
          </div>
        </>
    );
};

export default HeroSection;