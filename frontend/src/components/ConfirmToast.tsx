import { useState } from "react";

// Types of confirimations:
//  1. dangerous actions (delete activity, clear all data)        - DANGER
//  2. warning actions (navigating away with unsaved changes)     - WARNING
//  3. informational actions (successful save, successful action) - INFO

export type ConfirmToastType = "DANGER" | "WARNING" | "INFO";

export interface ConfirmToastProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmToastType;
  requireInput?: boolean;
  matchText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Confirmation toast component for user action verification.
 * @remarks
 * Displays a modal with customizable title, message, and optional text input confirmation.
 * Supports three types: DANGER, WARNING, and INFO with different styling.
 * @param props              - Configuration object for the confirmation dialog
 * @param props.title        - The title of the confirmation dialog
 * @param props.message      - The message body of the confirmation
 * @param props.confirmText  - Text for the confirm button (default: "Confirm")
 * @param props.cancelText   - Text for the cancel button (default: "Cancel")
 * @param props.type         - Type of confirmation: DANGER, WARNING, or INFO (default: "INFO")
 * @param props.requireInput - Whether to require text input for confirmation (default: false)
 * @param props.matchText    - Text that must be typed to enable confirmation
 * @param props.onConfirm    - Callback function when user confirms
 * @param props.onCancel     - Callback function when user cancels
 * @returns                  - A confirmation toast UI element
 */
export const ConfirmToast = ({
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "INFO",
  requireInput = false,
  matchText = "",
  onConfirm,
  onCancel,
}: ConfirmToastProps) => {
  const [value, setValue] = useState("");
  const isConfirmEnabled = requireInput ? value === matchText : true;

  const getColors = () => {
    switch (type) {
      case "DANGER":
        return "bg-red-600 hover:bg-red-500";
      case "WARNING":
        return "bg-yellow-600 hover:bg-yellow-500";
      case "INFO":
      default:
        return "bg-blue-600 hover:bg-blue-500";
    }
  };

  return (
    <div className="confirm-toast w-full max-w-sm p-4">
      <div className="mb-2 text-white font-bold text-lg">{title}</div>
      <div className="mb-4 text-gray-300 text-sm">{message}</div>

      {requireInput && (
        <div className="mb-4">
          <p className="text-xs text-gray-400 mb-1">
            Type "<span className="font-mono text-white">{matchText}</span>"
            below:
          </p>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={matchText}
            className="w-full px-3 py-2 rounded bg-white/10 text-white border border-white/20 focus:border-blue-500 focus:outline-none"
            autoFocus
          />
        </div>
      )}

      <div className="flex gap-2 justify-end">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 rounded text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          disabled={!isConfirmEnabled}
          className={`px-4 py-1.5 rounded text-sm font-bold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${getColors()}`}
        >
          {confirmText}
        </button>
      </div>
    </div>
  );
};
