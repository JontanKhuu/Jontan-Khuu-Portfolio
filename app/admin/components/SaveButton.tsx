"use client";

type SaveButtonProps = {
  onClick: () => void;
  label?: string;
};

export function SaveButton({ onClick, label = "Save Changes" }: SaveButtonProps) {
  return (
    <button
      onClick={onClick}
      className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
    >
      {label}
    </button>
  );
}

