"use client";

import { useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import type { BoardCard } from "../data/projects";

type Props = {
  card: BoardCard;
  onPick: () => void;
  onOpen?: (id: string) => void;
};

export function Card({ card, onPick, onOpen }: Props) {
  // Static button behavior: no dragging, just clickable
  const onClick = useCallback(() => {
    onPick();
    if (card.type === "skills" || card.type === "about") {
      onOpen?.(card.id);
    }
  }, [onPick]);

  const style: React.CSSProperties = {
    transform: `translate(${card.x}px, ${card.y}px) rotate(${card.rotation ?? 0}deg)`,
    zIndex: card.zIndex ?? 1,
  };

  const Inner = () => {
    if (card.type === "image" && card.imageSrc) {
      return (
        <div className="card card-photo">
          <Image src={card.imageSrc} alt={card.title} width={160} height={120} />
        </div>
      );
    }
    const content = (
      <div className="card">
        <div className="pin" aria-hidden />
        <h3 className="card-title">{card.title}</h3>
        {card.summary ? <p className="card-summary">{card.summary}</p> : null}
        {card.tags?.length ? (
          <ul className="card-tags">
            {card.tags.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        ) : null}
      </div>
    );
    if (card.href) {
      const isExternal = card.href.startsWith("http");
      return (
        <Link href={card.href} target={isExternal ? "_blank" : undefined} rel={isExternal ? "noopener noreferrer" : undefined}>
          {content}
        </Link>
      );
    }
    return content;
  };

  return (
    <div
      className="card-wrap"
      style={style}
      role="group"
      aria-roledescription="Pinned card"
      aria-label={card.title}
      tabIndex={0}
      onClick={onClick}
    >
      <Inner />
    </div>
  );
}


