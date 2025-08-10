"use client";
import { ReactNode, useEffect, useRef } from "react";

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
  children: ReactNode;
};

export default function ModalForm({
  open,
  title,
  onClose,
  onSubmit,
  submitLabel = "Save",
  children,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current!;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className="rounded-lg p-0 w-[min(92vw,520px)] backdrop:bg-black/40"
      onClose={onClose}
    >
      <form method="dialog" className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-800"
          >
            ✕
          </button>
        </div>
        <div className="space-y-3">{children}</div>
        {onSubmit && (
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-sm border rounded-md"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSubmit}
              className="px-3 py-2 text-sm bg-black text-white rounded-md"
            >
              {" "}
              {submitLabel}{" "}
            </button>
          </div>
        )}
      </form>
    </dialog>
  );
}
