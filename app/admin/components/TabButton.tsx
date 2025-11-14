"use client";

type TabButtonProps = {
  label: string;
  isActive: boolean;
  onClick: () => void;
};

export function TabButton({ label, isActive, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 font-medium ${
        isActive
          ? 'border-b-2 border-blue-600 text-blue-600'
          : 'text-gray-700 hover:text-gray-900'
      }`}
    >
      {label}
    </button>
  );
}

