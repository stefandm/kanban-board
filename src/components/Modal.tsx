import React, { useEffect, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';
import useClickOutside from '../hooks/useClickOutside';

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
  ariaLabel: string; // Added ariaLabel as a required string
}

const Modal: React.FC<ModalProps> = ({ onClose, children, ariaLabel }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useClickOutside(modalRef, () => {
    onClose();
  });

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel} 
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg w-full max-w-lg relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 focus:outline-none"
          aria-label="Close Modal"
        >
          <FaTimes size={20} />
        </button>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
