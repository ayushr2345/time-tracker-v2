import { useState, type JSX } from "react";
import { AlertTriangle, Info, Trash2, type LucideIcon } from "lucide-react";

export type ConfirmToastType = "DANGER" | "WARNING" | "INFO";

export interface ConfirmToastProps {
  /** Title of the confirmation dialog */
  title: string;
  /** Body message explaining the action */
  message: string;
  /** Text for the confirm button (default: "Confirm") */
  confirmText?: string;
  /** Text for the cancel button (default: "Cancel") */
  cancelText?: string;
  /** Visual variant of the toast */
  type?: ConfirmToastType;
  /** Whether the user must type a string to enable the confirm button */
  requireInput?: boolean;
  /** The string the user must match (if requireInput is true) */
  matchText?: string;
  /** Callback fired on confirmation */
  onConfirm: () => void;
  /** Callback fired on cancellation */
  onCancel: () => void;
  /** Function to close the toast (injected automatically by React-Toastify) */
  closeToast?: () => void;
}

interface ToastStyleConfig {
  icon: LucideIcon;
  color: string;
  bgIcon: string;
  btn: string;
  border: string;
}

/**
 * A custom toast component for user confirmations.
 * @remarks
 * Designed to be rendered inside `react-toastify`.
 * Supports "Safety Mode" (`requireInput`) for destructive actions where the user
 * must type a specific phrase (e.g., the name of the item) to confirm.
 *
 * @returns The rendered confirmation dialog.
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
}: ConfirmToastProps): JSX.Element => {
  const [inputValue, setInputValue] = useState("");

  // Determine if the confirm button should be enabled
  const isConfirmEnabled = requireInput ? inputValue === matchText : true;

  // Visual Configuration Mapping
  const styles: Record<ConfirmToastType, ToastStyleConfig> = {
    DANGER: {
      icon: Trash2,
      color: "text-red-400",
      bgIcon: "bg-red-500/20",
      btn: "bg-red-600 hover:bg-red-500 shadow-red-500/20",
      border: "border-red-500/30",
    },
    WARNING: {
      icon: AlertTriangle,
      color: "text-yellow-400",
      bgIcon: "bg-yellow-500/20",
      btn: "bg-yellow-600 hover:bg-yellow-500 shadow-yellow-500/20",
      border: "border-yellow-500/30",
    },
    INFO: {
      icon: Info,
      color: "text-blue-400",
      bgIcon: "bg-blue-500/20",
      btn: "bg-blue-600 hover:bg-blue-500 shadow-blue-500/20",
      border: "border-blue-500/30",
    },
  };

  const config = styles[type];
  const Icon = config.icon;

  const handleConfirm = () => {
    if (!isConfirmEnabled) return;
    onConfirm();
    closeToast?.(); // Close using the prop injected by Toastify
  };

  const handleCancel = () => {
    onCancel();
    closeToast?.();
  };

  return (
    <div className="w-full font-sans">
      {/* 1. Header Section */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className={`p-2 rounded-lg flex-shrink-0 ${config.bgIcon} ${config.color}`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-white font-bold text-base">{title}</h4>
          <p className="text-gray-300 text-sm mt-1 leading-relaxed">
            {message}
          </p>
        </div>
      </div>

      {/* 2. Safety Input Section (Optional) */}
      {requireInput && (
        <div className="mb-4 pl-1 mt-2">
          <label
            htmlFor="confirm-input"
            className="text-xs text-gray-400 mb-2 block"
          >
            Type{" "}
            <span className="font-mono text-white bg-white/10 px-1.5 py-0.5 rounded select-all">
              {matchText}
            </span>{" "}
            to confirm:
          </label>
          <input
            id="confirm-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={matchText}
            autoComplete="off"
            className={`
              w-full px-3 py-2.5 rounded-lg bg-black/40 text-white text-sm border transition-all placeholder:text-gray-600
              ${
                inputValue === matchText
                  ? "border-green-500/50 focus:border-green-500 ring-1 ring-green-500/20"
                  : "border-white/10 focus:border-white/30 focus:outline-none"
              }
            `}
            autoFocus
          />
        </div>
      )}

      {/* 3. Action Buttons */}
      <div className="flex gap-3 justify-end mt-2 pt-3 border-t border-white/5">
        <button
          onClick={handleCancel}
          className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
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
          {type === "DANGER" && <Trash2 className="w-3 h-3" />}
          {confirmText}
        </button>
      </div>
    </div>
  );
};
