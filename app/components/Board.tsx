"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { initialCards as seedCards, type BoardCard } from "../data/projects";
import { Card } from "./Card";
import skillsData from "../data/skills.json";
import aboutData from "../data/about.json";

type Props = {
  cards?: BoardCard[];
};

export function Board({ cards = seedCards }: Props) {
  const [/*translate*/] = useState({ x: 0, y: 0 });

  const [items, setItems] = useState<BoardCard[]>(() => cards);
  const [showSkills, setShowSkills] = useState(false);
  const [showAbout, setShowAbout] = useState(false);


  const bringToFront = useCallback((id: string) => {
    const maxZ = items.reduce((m, c) => Math.max(m, c.zIndex ?? 0), 0) + 1;
    setItems((prev) => prev.map((c) => (c.id === id ? { ...c, zIndex: maxZ } : c)));
  }, [items]);

  // No board transforms (no pan/zoom)

  return (
    <div className="board-root">
      <div
        className="board-viewport"
        role="region"
        aria-label="Cork board of projects."
      >
        <div className="board-canvas">
          <div className="board-bg" data-role="board-bg" />
          {items.map((card) => (
            <Card
              key={card.id}
              card={card}
              onPick={() => bringToFront(card.id)}
              onOpen={(id) => {
                if (id === "skills") {
                  // setShowAbout(false);
                  setShowSkills(true);
                }
                if (id === "about") {
                  // setShowSkills(false);
                  setShowAbout(true);
                }
              }}
            />
          ))}
        </div>
      </div>

      {showSkills ? (
        <div
          className="card-wrap card-appear"
          style={{ transform: `translate(calc(100vw - 584px), 60px) rotate(-2deg)`, zIndex: 100 }}
          role="group"
          aria-roledescription="Pinned card"
          aria-label="Skills"
        >
          <div className="card card-large">
            <div className="pin pin-appear" aria-hidden />
            <div className="card-header">
              <h2 className="card-title" id="skills-title">Skills</h2>
              <button
                className="card-close"
                onClick={() => setShowSkills(false)}
                aria-label="Close skills"
              >
                ×
              </button>
            </div>
            <div className="card-scroll">
              <div className="skills-columns">
                {skillsData.sections.map((section) => (
                  <div key={section.title}>
                    <h3>{section.title}</h3>
                    <ul>
                      {section.items.map((it) => (
                        <li key={it}>{it}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {showAbout ? (
        <div
          className="card-wrap card-appear"
          style={{ transform: `translate(calc(100vw - 584px), 260px) rotate(1.5deg)`, zIndex: 100 }}
          role="group"
          aria-roledescription="Pinned card"
          aria-label="About Me"
        >
          <div className="card card-large">
            <div className="pin pin-appear" aria-hidden />
            <div className="card-header">
              <h2 className="card-title">{aboutData.title}</h2>
              <button
                className="card-close"
                onClick={() => setShowAbout(false)}
                aria-label="Close about"
              >
                ×
              </button>
            </div>
            <div className="card-scroll">
              <p className="card-summary" style={{ marginBottom: 12 }}>{aboutData.intro}</p>
              <ul>
                {aboutData.details.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}

      <div className="sr-only" aria-hidden={false}>
        <h2>Projects list</h2>
        <ul>
          {items
            .filter((c) => c.type !== "image")
            .map((c) => (
              <li key={c.id}>
                {c.href ? (
                  <Link href={c.href}>{c.title}</Link>
                ) : (
                  <span>{c.title}</span>
                )}
                {c.summary ? ` — ${c.summary}` : null}
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}


