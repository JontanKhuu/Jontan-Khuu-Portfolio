export type FileItemType = "project" | "link" | "about" | "skill" | "folder" | "resume" | "contact";

// Helper function to get icon source for a file item
export function getFileIconSrc(file: { id: string; type: FileItemType }): string {
  if (file.id === "github") return "/Github-Icon.png";
  if (file.id === "linkedin") return "/LinkedIn-Icon.png";
  if (file.id === "about") return "/About-Me-Icon.png";
  if (file.id === "resume") return "/Text-Icon.png";
  if (file.id === "contact") return "/Text-Icon.png";
  if (file.type === "link") return "/Link-icon.png";
  return "/Folder.png";
}

export type FileItem = {
  id: string;
  type: FileItemType;
  title: string;
  summary?: string;
  href?: string;
  tags?: string[];
  x?: number;
  y?: number;
  zIndex?: number;
};

// Helper function to create skill items from skills data
export function createSkillsItems(skillsData: { sections: { title: string; items: string[] }[] }): FileItem[] {
  const items: FileItem[] = [];
  let index = 0;
  
  skillsData.sections.forEach((section) => {
    section.items.forEach((skill) => {
      const col = index % 3;
      const row = Math.floor(index / 3);
      items.push({
        id: `skill-${skill.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        type: "skill",
        title: skill,
        summary: section.title,
        x: col * 140,
        y: row * 140,
      });
      index++;
    });
  });
  
  return items;
}

