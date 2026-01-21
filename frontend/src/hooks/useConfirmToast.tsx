import { toast } from "react-toastify";
import type { ConfirmToastType } from "../components/ConfirmToast";
import { ConfirmToast } from "../components/ConfirmToast";

interface ConfirmOptions {
  title: string;
  message: string;
  type?: ConfirmToastType;
  requireInput?: boolean;
  matchText?: string;     // Only needed if requireInput is true
  confirmText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export const useConfirm = () => {
  
  const confirm = (options: ConfirmOptions) => {
    let toastId: string | number;

    const handleConfirm = () => {
      options.onConfirm();
      toast.dismiss(toastId);
    };

    const handleCancel = () => {
      toast.dismiss(toastId);
    };

    toastId = toast(
      <ConfirmToast
        {...options}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />,
      {
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
        draggable: false,
        position: "top-center",
        className: "!bg-gray-900 !p-0 !rounded-lg border border-gray-700 shadow-2xl"
      }
    );
  };

  return { confirm };
};