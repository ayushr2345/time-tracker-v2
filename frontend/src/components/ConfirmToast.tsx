import React, { useState } from "react";
import { AlertTriangle, Info, Trash2, X, Check } from "lucide-react";

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
  closeToast?: () => void; // Provided by React-Toastify
}

/**
 * Confirmation toast component.
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
  closeToast,
}: ConfirmToastProps) => {
  const [value, setValue] = useState("");
  const isConfirmEnabled = requireInput ? value === matchText : true;

  // Visual Configuration based on Type
  const config = {
    DANGER: {
      icon: Trash2,
      color: "text-red-400",
      bgIcon: "bg-red-500/20",
      btn: "bg-red-600 hover:bg-red-500",
      border: "border-red-500/30"
    },
    WARNING: {
      icon: AlertTriangle,
      color: "text-yellow-400",
      bgIcon: "bg-yellow-500/20",
      btn: "bg-yellow-600 hover:bg-yellow-500",
      border: "border-yellow-500/30"
    },
    INFO: {
      icon: Info,
      color: "text-blue-400",
      bgIcon: "bg-blue-500/20",
      btn: "bg-blue-600 hover:bg-blue-500",
      border: "border-blue-500/30"
    }
  }[type];

  const Icon = config.icon;

  const handleConfirm = () => {
    onConfirm();
    if (closeToast) closeToast();
  };

  const handleCancel = () => {
    onCancel();
    if (closeToast) closeToast();
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className={`p-2 rounded-lg ${config.bgIcon} ${config.color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-white font-bold text-base">{title}</h4>
          <p className="text-gray-400 text-sm mt-1 leading-relaxed">{message}</p>
        </div>
      </div>

      {/* Input Section (if required) */}
      {requireInput && (
        <div className="mb-4 pl-1">
          <label className="text-xs text-gray-500 mb-1.5 block">
            Type <span className="font-mono text-white bg-white/10 px-1 rounded">{matchText}</span> to confirm:
          </label>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={matchText}
            className={`w-full px-3 py-2 rounded-lg bg-black/40 text-white text-sm border focus:outline-none transition-all ${
              value === matchText ? "border-green-500/50 focus:border-green-500" : "border-white/10 focus:border-white/30"
            }`}
            autoFocus
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-end mt-2 pt-3 border-t border-white/5">
        <button
          onClick={handleCancel}
          className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
        >
          {cancelText}
        </button>
        <button
          onClick={handleConfirm}
          disabled={!isConfirmEnabled}
          className={`
            flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold text-white shadow-lg transition-all
            disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
            ${config.btn}
          `}
        >
          {type === 'DANGER' && <Trash2 className="w-3 h-3" />}
          {confirmText}
        </button>
      </div>
    </div>
  );
};