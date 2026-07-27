// src/components/ui/MacDockModal.tsx
'use client';

import { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';

interface MacDockModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}

export function MacDockModal({ isOpen, onClose, title, children }: MacDockModalProps) {
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

                    {/* Contenedor Modal con Efecto Mac Dock (Sube desde abajo con efecto elástico) */}
                    <motion.div
                        initial={{
                            opacity: 0,
                            scale: 0.2,
                            y: 250, // Sale desde abajo (dock)
                            transformOrigin: 'bottom center',
                        }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            y: 0,
                            transition: {
                                type: 'spring',
                                stiffness: 300,
                                damping: 22, // Sensación rebote Mac Dock
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
                        className="bg-white border border-purple-100 shadow-2xl w-full max-w-md overflow-hidden relative z-10"
                    >
                        {/* Cabecera del Modal */}
                        <div className="bg-purple-50/50 px-5 py-4 border-b border-purple-100 flex justify-between items-center">
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

                        {/* Cuerpos del Modal */}
                        <div className="p-5">{children}</div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}