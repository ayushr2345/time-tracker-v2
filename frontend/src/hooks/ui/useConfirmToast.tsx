import { toast } from "react-toastify";
import type { ConfirmToastProps } from "../../components/ConfirmToast";
import { ConfirmToast } from "../../components/ConfirmToast";

/**
 * Utility type to exclude 'closeToast' from the options passed by the user,
 * since React-Toastify handles that automatically.
 */
type ConfirmOptions = Omit<ConfirmToastProps, "closeToast">;

/**
 * Custom hook for triggering confirmation dialogs via toasts.
 * @remarks
 * This abstraction allows triggering complex UI confirmations with a simple function call.
 * It manages the connection between the business logic and the `react-toastify` UI.
 *
 * @returns An object containing the `confirm` function.
 */
export const useConfirm = () => {
  /**
   * Triggers a confirmation toast.
   * @param options - Configuration for the confirmation dialog (title, message, callbacks).
   */
  const confirm = (options: ConfirmOptions) => {
    // We pass the options directly to the component.
    // 'closeToast' is injected by react-toastify into <ConfirmToast> automatically
    // when it renders the component.
    toast(<ConfirmToast {...options} />, {
      autoClose: false,
      closeOnClick: false,
      closeButton: false,
      draggable: false,
      position: "top-center",
      className:
        "!bg-gray-900 !p-0 !rounded-lg border border-gray-700 shadow-2xl min-w-[350px]",
    });
  };

  return { confirm };
};
