import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { FaTimes } from 'react-icons/fa';
import useClickOutside from '../hooks/useClickOutside';
import FocusTrap from 'focus-trap-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  ariaLabel: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, ariaLabel, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useClickOutside(modalRef, onClose);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <FocusTrap>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity"
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
      >
        <div
          ref={modalRef}
          className="bg-white rounded-lg w-full max-w-3xl mx-4 md:mx-0 relative shadow-lg transform transition-all"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 focus:outline-none"
            aria-label="Close Modal"
          >
            <FaTimes size={20} />
          </button>
          <div className="p-6 overflow-y-auto md:overflow-y-visible max-h-[95vh] md:h-fit">{children}</div>
        </div>
      </div>
    </FocusTrap>,
    document.body
  );
};

export default Modal;
