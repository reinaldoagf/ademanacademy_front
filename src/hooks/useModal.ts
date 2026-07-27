// src/hooks/useModal.ts
import { useState, useCallback, useEffect } from 'react';

interface UseModalReturn {
    isOpen: boolean;
    isMounted: boolean; // Útil para permitir la animación de salida
    openModal: () => void;
    closeModal: () => void;
    toggleModal: () => void;
}

export function useModal(initialState = false, animationDuration = 200): UseModalReturn {
    const [isOpen, setIsOpen] = useState(initialState);
    const [isMounted, setIsMounted] = useState(initialState);

    const openModal = useCallback(() => {
        setIsMounted(true);
        // Pequeño timeout para permitir que el DOM renderice antes de activar la clase de animación de entrada
        setTimeout(() => setIsOpen(true), 10);
    }, []);

    const closeModal = useCallback(() => {
        setIsOpen(false);
        // Esperamos a que termine la animación de salida para desmontar el componente del DOM
        setTimeout(() => setIsMounted(false), animationDuration);
    }, [animationDuration]);

    const toggleModal = useCallback(() => {
        if (isOpen) {
            closeModal();
        } else {
            openModal();
        }
    }, [isOpen, openModal, closeModal]);

    // Cerrar al presionar la tecla Escape y bloquear el scroll del fondo
    useEffect(() => {
        if (!isMounted) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeModal();
        };

        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isMounted, closeModal]);

    return { isOpen, isMounted, openModal, closeModal, toggleModal };
}