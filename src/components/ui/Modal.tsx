import React from 'react';
import { cn } from '@/utils/helpers';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap: Record<string, string> = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
};

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}) => {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, type: 'spring', stiffness: 300, damping: 28 }}
            className={cn(
              'relative w-full bg-white rounded-2xl shadow-elevation-2 overflow-hidden z-10',
              sizeMap[size]
            )}
          >
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-navy-100">
                <h3 className="font-display font-semibold text-xl text-navy-900">{title}</h3>
                <button
                  onClick={onClose}
                  className="p-2 text-navy-400 hover:text-navy-700 hover:bg-navy-50 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            )}
            <div className="p-6">{children}</div>
            {footer && (
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-navy-100 bg-navy-50/50">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
