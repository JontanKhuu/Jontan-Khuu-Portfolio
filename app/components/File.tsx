"use client";

import { useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import type { FileItem } from "../data/types";
import { getFileIconSrc } from "../data/types";

type Props = {
  file: FileItem;
  onSelect: () => void;
  onOpen?: (id: string) => void;
  isSelected?: boolean;
};

export function File({ file, onSelect, onOpen, isSelected }: Props) {
  const onClick = useCallback((e?: React.MouseEvent) => {
    // Don't prevent default for links - let them open naturally
    if (file.href) {
      return;
    }
    e?.preventDefault();
    onSelect();
    if (file.type !== "link") {
      onOpen?.(file.id);
    }
  }, [onSelect, onOpen, file.id, file.type, file.href]);

  const style: React.CSSProperties = {
    '--file-x': `${file.x}px`,
    '--file-y': `${file.y}px`,
    zIndex: file.zIndex ?? 1, // Always use the original z-index, never change on selection
  } as React.CSSProperties;


  const content = (
    <div 
      className={`file-folder ${isSelected ? "file-selected" : ""}`}
      data-type={file.type}
    >
      <div className="file-body">
        <Image
          src={getFileIconSrc(file)}
          alt=""
          width={80}
          height={80}
          className="folder-image"
          unoptimized
        />
      </div>
      <div className="file-tab">
        <span className="file-label">{file.title}</span>
      </div>
    </div>
  );

  return (
    <div
      className="file-wrap"
      style={style}
      role={file.href ? undefined : "button"}
      aria-label={`File: ${file.title}`}
      tabIndex={file.href ? undefined : 0}
      onClick={file.href ? undefined : onClick}
      onKeyDown={file.href ? undefined : (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {file.href ? (
        <Link 
          href={file.href} 
          target={file.href.startsWith("http") ? "_blank" : undefined} 
          rel={file.href.startsWith("http") ? "noopener noreferrer" : undefined}
          onClick={(e) => {
            // Stop propagation so file-wrap onClick doesn't fire
            e.stopPropagation();
          }}
        >
          {content}
        </Link>
      ) : (
        content
      )}
    </div>
  );
}

