/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Reusable skeuomorphic confirm modal for destructive or confirmation flows.
 */
export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 select-none z-[110] flex justify-center items-center bg-black/60 backdrop-blur-[1px] animate-fade-in">
      <div className="bg-[#faf8f2] border-2 border-[#3e382d] shadow-2xl w-[400px] flex flex-col rounded-none animate-bubble">
        {/* Header */}
        <div className="bg-[#9c3526] border-b-2 border-[#3e382d] px-4 py-2 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#faf8f2]" />
          <span className="text-xs font-mono font-bold tracking-wider text-[#faf8f2] uppercase">{title}</span>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-3">
          <p className="text-xs font-mono font-bold text-[#2e2a22] leading-relaxed">
            {message}
          </p>
        </div>

        {/* Buttons */}
        <div className="border-t border-[#3e382d]/30 bg-[#eae3ce]/50 px-4 py-3 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="bg-[#faf8f2] hover:bg-[#eae3ce] text-[#5c5341] font-mono font-bold text-[10px] py-1.5 px-4 border border-[#3e382d] cursor-pointer uppercase tracking-wider transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="bg-[#9c3526] hover:bg-[#822c20] text-[#faf8f2] font-mono font-bold text-[10px] py-1.5 px-4 border border-[#3e382d] cursor-pointer uppercase tracking-wider transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
