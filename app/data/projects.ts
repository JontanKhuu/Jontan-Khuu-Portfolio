export type BoardCardType = "project" | "link" | "image" | "skills" | "about";

export type BoardCard = {
  id: string;
  type: BoardCardType;
  title: string;
  summary?: string;
  href?: string;
  imageSrc?: string;
  tags?: string[];
  x: number;
  y: number;
  rotation?: number;
  zIndex?: number;
  width?: number;
  height?: number;
};

export const initialCards: BoardCard[] = [
  {
    id: "about",
    type: "about",
    title: "About Me",
    summary: "A brief introduction to who I am and what I do.",
    tags: ["nextjs", "react"],
    x: 120,
    y: 150,
    rotation: -3,
    zIndex: 2,
  },
  {
    id: "skills",
    type: "skills",
    title: "Skills",
    summary: "What I work with",
    x: 530,
    y: 100,
    rotation: 1,
    zIndex: 2,
  },
  {
    id: "proj-1",
    type: "project",
    title: "My Projects",
    summary: "A collection of my projects and what I've worked on.",
    tags: ["performance"],
    x: 420,
    y: 260,
    rotation: 2.5,
    zIndex: 3,
  },
  {
    id: "link-1",
    type: "link",
    title: "GitHub",
    summary: "My GitHub profile",
    href: "https://github.com/JontanKhuu",
    x: 300,
    y: 40,
    rotation: -1,
    zIndex: 1,
  },
  {
    id: "link-2",
    type: "link",
    title: "LinkedIn",
    summary: "My LinkedIn profile",
    href: "https://www.linkedin.com/in/jontan-khuu-9a38a6242",
    x: 200,
    y: 440,
    rotation: -1, 
    zIndex: 1,
  },
];


