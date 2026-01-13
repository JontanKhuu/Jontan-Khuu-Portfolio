export interface AboutData {
  title: string;
  intro: string;
  details: string[];
  imageUrl?: string;
}

export interface SkillsData {
  sections: {
    title: string;
    items: string[];
  }[];
}

export interface ProjectImage {
  url: string;
  description?: string;
}

export interface ProjectItem {
  id: string;
  type: string;
  title: string;
  summary?: string;
  href?: string;
  tags?: string[];
  images?: ProjectImage[];
  details?: string;
  x?: number;
  y?: number;
  zIndex?: number;
}

export interface ProjectsData {
  initialFiles: ProjectItem[];
  projectItems: ProjectItem[];
}

export interface ResumeData {
  fileUrl: string | null;
  title: string;
}

export type DataFileType = AboutData | SkillsData | ProjectsData | ResumeData;

