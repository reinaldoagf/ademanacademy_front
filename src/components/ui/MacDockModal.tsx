// src/components/ui/MacDockModal.tsx
'use client';

import { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';

interface MacDockModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    size: "5xl" | "4xl" | "3xl" | "2xl" | "xl" | "lg" | "md" | "sm";
    children: ReactNode;
}

export function MacDockModal({ isOpen, onClose, title, size = "sm", children }: MacDockModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop con Blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                    />

                    {/* Contenedor Modal con Efecto Mac Dock */}
                    <motion.div
                        initial={{
                            opacity: 0,
                            scale: 0.2,
                            y: 250,
                            transformOrigin: 'bottom center',
                        }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            y: 0,
                            transition: {
                                type: 'spring',
                                stiffness: 300,
                                damping: 22,
                            },
                        }}
                        exit={{
                            opacity: 0,
                            scale: 0.2,
                            y: 250,
                            transition: {
                                duration: 0.2,
                                ease: 'easeInOut',
                            },
                        }}
                        /* 
                          1. Cambiado overflow-hidden a flex flex-col max-h-[90vh]
                        */
                        className={`bg-white border border-purple-100 shadow-2xl w-full flex flex-col max-h-[90vh] rounded-2xl relative z-10 max-w-${size}`}
                    >
                        {/* Cabecera del Modal (flex-shrink-0 asegura que no se encoja) */}
                        <div className="rounded-t-2xl bg-purple-50/50 px-5 py-4 border-b border-purple-100 flex justify-between items-center flex-shrink-0">
                            <h3 className="font-anton text-gray-800 text-sm uppercase tracking-wider flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-purple-600" />
                                {title}
                            </h3>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 hover:bg-purple-100/50 p-1 rounded-full transition cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* 
          2. Cuerpo del Modal con scroll vertical (overflow-y-auto y flex-1)
        */}
                        <div className="p-5 overflow-y-auto flex-1">{children}</div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}