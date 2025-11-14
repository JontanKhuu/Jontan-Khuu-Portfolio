"use client";

type ContentPanelProps = {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  ariaLabel?: string;
};

export function ContentPanel({ title, onClose, children, ariaLabel }: ContentPanelProps) {
  return (
    <div
      className="content-panel content-appear"
      style={{ zIndex: 100 }}
      role="dialog"
      aria-label={ariaLabel || title}
    >
      <div className="content-header">
        <h2 className="content-title">{title}</h2>
        <button
          className="content-close"
          onClick={onClose}
          aria-label={`Close ${title}`}
        >
          ×
        </button>
      </div>
      <div className="content-scroll">
        {children}
      </div>
    </div>
  );
}

