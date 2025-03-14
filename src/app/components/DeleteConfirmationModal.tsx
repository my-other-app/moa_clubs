"use client";

import Image from "next/image";
import { MouseEventHandler } from "react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  // Prevent clicks inside the modal from closing it
  const handleModalClick: MouseEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg w-[400px] max-w-full p-6 relative"
        onClick={handleModalClick}
      >
        {/* Illustration */}
        <div className="flex justify-center mb-4">
          <Image
            src="/delete-event-illustration.png"
            alt="Delete event illustration"
            width={150}
            height={150}
            priority
          />
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-center mb-2">DELETE EVENT?</h2>

        {/* Description */}
        <p className="text-gray-600 text-center mb-6">
          Are you sure you want to delete this event?
          <br />
          This action can’t be undone!
        </p>

        {/* Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete Event
          </button>
        </div>
      </div>
    </div>
  );
}
