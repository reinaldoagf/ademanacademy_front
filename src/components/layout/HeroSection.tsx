"use client";

import { 
  Plus, 
} from "lucide-react";
import html from 'react-inner-html';

interface HeroAction {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode; // Permite pasar cualquier icono de Lucide de forma dinámica
  variant?: "primary" | "secondary"; // Para diferenciar los estilos visuales
  isDisabled?: boolean;
}

interface HeroProps {
    htmlSubTitle: string;
    htmlTitle: string;
    actions?: HeroAction[]; // 2. Añadimos el array de acciones opcional
    navigateBack?: string | null;
}

const HeroSection: React.FC<HeroProps> = ({
    htmlTitle,
    htmlSubTitle,
    actions = [], // Valor por defecto vacío si no se envían acciones
    navigateBack = null
}) => {
   return (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-[36px] pb-[24px] px-[44px] bg-white/80">
            <div>
              <h2 className="text-2xl font-anton text-gray-800" {...html(htmlTitle)}></h2>
              <p className="text-xs text-gray-500 font-questrial"  {...html(htmlSubTitle)}></p>
            </div>
            {/* 3. Renderizado Dinámico del contenedor de acciones */}
        {actions.length > 0 && (
          <div className="flex flex-wrap gap-2 self-start sm:self-auto">
            {actions.map((action, index) => {
              // Determinamos el estilo base según la variante seleccionada
              const isSecondary = action.variant === "secondary";
              const buttonStyle = isSecondary
                ? "bg-white border border-purple-100 text-purple-700 hover:bg-purple-50"
                : "gradient-purple text-white shadow-md shadow-purple-200 hover:opacity-90";

              return (
                <button
                  key={`${action.label}-${index}`}
                  onClick={action.onClick}
                  disabled={action.isDisabled}
                  className={`
                    font-questrial px-4 py-2 flex items-center justify-center gap-2 font-medium transition text-xs cursor-pointer
                    ${buttonStyle}
                    ${action.isDisabled ? "opacity-40 cursor-not-allowed hover:opacity-40" : ""}
                  `}
                >
                  {/* Si el botón trae un icono asignado, lo renderiza aquí */}
                  {action.icon && <span className="shrink-0">{action.icon}</span>}
                  <span>{action.label}</span>
                </button>
              );
            })}
          </div>
        )}
            
          </div>
        </>
    );
};

export default HeroSection;