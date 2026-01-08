"use client";

import Image from "next/image";
import { ProjectCard } from "./ProjectCard";
import { ContactForm } from "./ContactForm";
import type { FileItem } from "../data/types";

type ScrollViewProps = {
  aboutData: { title: string; intro: string; details: string[]; imageUrl?: string };
  projectItems: FileItem[];
  resumeData: { fileUrl: string | null; title: string } | null;
  skillsItems: FileItem[];
  skillsData: { sections: { title: string; items: string[] }[] };
  skillUsageCount: { [key: string]: number };
  onProjectClick: (projectId: string) => void;
  onSkillClick: (skillId: string) => void;
  onResumeClick: () => void;
  onToggleView: () => void;
};

export function ScrollView({
  aboutData,
  projectItems,
  resumeData,
  skillsItems,
  skillsData,
  skillUsageCount,
  onProjectClick,
  onSkillClick,
  onResumeClick,
  onToggleView,
}: ScrollViewProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#202020",
        color: "#e0e0e0",
        padding: "0",
        overflowY: "auto",
        position: "relative",
      }}
    >
      {/* Toggle Button - Fixed position */}
      <button
        onClick={onToggleView}
        title="Switch to Explorer view"
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 1000,
          padding: "12px 16px",
          borderRadius: "24px",
          background: "#0078d4",
          border: "none",
          color: "#ffffff",
          fontSize: "14px",
          fontWeight: "600",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(0, 120, 212, 0.4)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          transition: "all 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#106ebe";
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 120, 212, 0.6)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#0078d4";
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 120, 212, 0.4)";
        }}
      >
        <span style={{ fontSize: "18px" }}>📁</span>
        <span>Switch layout</span>
      </button>

      {/* Resume Button - Fixed position (below toggle) */}
      {resumeData && resumeData.fileUrl && (
        <button
          onClick={onResumeClick}
          title="Check out my resume"
          style={{
            position: "fixed",
            top: "80px",
            right: "20px",
            zIndex: 1000,
            padding: "12px 20px",
            borderRadius: "24px",
            background: "#0078d4",
            border: "none",
            color: "#ffffff",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0, 120, 212, 0.4)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#106ebe";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 120, 212, 0.6)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#0078d4";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 120, 212, 0.4)";
          }}
        >
          <span>Resume</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </button>
      )}

      {/* GitHub Button - Fixed position */}
      <a
        href="https://github.com/JontanKhuu"
        target="_blank"
        rel="noopener noreferrer"
        title="Visit my GitHub profile"
        style={{
          position: "fixed",
          top: "140px",
          right: "20px",
          zIndex: 1000,
          padding: "12px 20px",
          borderRadius: "24px",
          background: "#0078d4",
          border: "none",
          color: "#ffffff",
          fontSize: "14px",
          fontWeight: "600",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(0, 120, 212, 0.4)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          transition: "all 0.3s ease",
          textDecoration: "none",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#106ebe";
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 120, 212, 0.6)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#0078d4";
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 120, 212, 0.4)";
        }}
      >
        <Image
          src="/Github-Icon.png"
          alt="GitHub"
          width={16}
          height={16}
          style={{ width: "16px", height: "16px" }}
          unoptimized
        />
        <span>GitHub</span>
      </a>

      {/* LinkedIn Button - Fixed position */}
      <a
        href="https://www.linkedin.com/in/jontan-khuu-9a38a6242"
        target="_blank"
        rel="noopener noreferrer"
        title="Visit my LinkedIn profile"
        style={{
          position: "fixed",
          top: "200px",
          right: "20px",
          zIndex: 1000,
          padding: "12px 20px",
          borderRadius: "24px",
          background: "#0078d4",
          border: "none",
          color: "#ffffff",
          fontSize: "14px",
          fontWeight: "600",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(0, 120, 212, 0.4)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          transition: "all 0.3s ease",
          textDecoration: "none",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#106ebe";
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 120, 212, 0.6)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#0078d4";
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 120, 212, 0.4)";
        }}
      >
        <Image
          src="/LinkedIn-Icon.png"
          alt="LinkedIn"
          width={16}
          height={16}
          style={{ width: "16px", height: "16px" }}
          unoptimized
        />
        <span>LinkedIn</span>
      </a>
      {/* About Me Section */}
      <section
        id="about"
        style={{
          padding: "80px 40px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            maxWidth: "800px",
            margin: "0 auto",
          }}
        >
          <h1
            style={{
              fontSize: "48px",
              fontWeight: "700",
              color: "#e0e0e0",
              marginBottom: "40px",
              textAlign: "center",
            }}
          >
            {aboutData.title}
          </h1>
          {aboutData.imageUrl && (
            <div
              style={{
                marginBottom: "40px",
                position: "relative",
              }}
            >
              <div
                style={{
                  width: "200px",
                  height: "200px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "6px solid #3d3d3d",
                  backgroundColor: "#252526",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
                }}
              >
                <Image
                  src={aboutData.imageUrl}
                  alt="Profile"
                  width={200}
                  height={200}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  unoptimized
                />
              </div>
            </div>
          )}
          {aboutData.intro && (
            <p
              style={{
                fontSize: "20px",
                lineHeight: "1.8",
                color: "#cccccc",
                marginBottom: "40px",
                padding: "32px",
                background: "#252526",
                borderRadius: "20px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                textAlign: "left",
                fontWeight: "400",
                border: "1px solid #3d3d3d",
                whiteSpace: "pre-wrap",
              }}
            >
              {aboutData.intro}
            </p>
          )}
          {aboutData.details.length > 0 && (
            <div
              style={{
                width: "100%",
                padding: "32px",
                background: "#252526",
                borderRadius: "20px",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
                border: "1px solid #3d3d3d",
              }}
            >
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#e0e0e0",
                  marginBottom: "24px",
                  textAlign: "center",
                }}
              >
                More About Me
              </h2>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                }}
              >
                {aboutData.details.map((line, index) => (
                  <li
                    key={index}
                    style={{
                      marginBottom: index < aboutData.details.length - 1 ? "16px" : "0",
                      padding: "16px",
                      background: "#1e1e1e",
                      borderRadius: "12px",
                      color: "#cccccc",
                      fontSize: "16px",
                      lineHeight: "1.7",
                      border: "1px solid #3d3d3d",
                    }}
                  >
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* Skills Section */}
      <section
        id="skills"
        style={{
          padding: "80px 40px",
          background: "#1e1e1e",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <h2
          style={{
            fontSize: "48px",
            fontWeight: "700",
            color: "#e0e0e0",
            marginBottom: "48px",
            textAlign: "center",
          }}
        >
          Skills
        </h2>
        {skillsData.sections.map((section, sectionIndex) => (
          <div
            key={sectionIndex}
            style={{
              marginBottom: sectionIndex < skillsData.sections.length - 1 ? "48px" : "0",
              paddingBottom: sectionIndex < skillsData.sections.length - 1 ? "48px" : "0",
              borderBottom:
                sectionIndex < skillsData.sections.length - 1
                  ? "1px solid #3d3d3d"
                  : "none",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  width: "4px",
                  height: "24px",
                  background: "#0078d4",
                  borderRadius: "2px",
                  marginRight: "12px",
                }}
              ></div>
              <h3
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#e0e0e0",
                  letterSpacing: "-0.3px",
                  margin: 0,
                }}
              >
                {section.title}
              </h3>
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              {[...section.items]
                .sort((a, b) => {
                  const countA = skillUsageCount[a] || 0;
                  const countB = skillUsageCount[b] || 0;
                  if (countB !== countA) {
                    return countB - countA;
                  }
                  return a.localeCompare(b);
                })
                .map((skill) => {
                  const skillItem = skillsItems.find(
                    (s) =>
                      s.id ===
                      `skill-${skill.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
                  );
                  const projectCount = skillUsageCount[skill] || 0;
                  return (
                    <button
                      key={skill}
                      onClick={() => skillItem && onSkillClick(skillItem.id)}
                      style={{
                        padding: "12px 20px",
                        border: "2px solid #0078d4",
                        borderRadius: "50px",
                        background: "#252526",
                        cursor: "pointer",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        boxShadow: "0 2px 8px rgba(0, 120, 212, 0.2)",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#0078d4";
                        e.currentTarget.style.borderColor = "#0078d4";
                        e.currentTarget.style.transform = "translateY(-3px) scale(1.05)";
                        e.currentTarget.style.boxShadow =
                          "0 8px 20px rgba(0, 120, 212, 0.4)";
                        const text = e.currentTarget.querySelector(
                          ".skill-text"
                        ) as HTMLElement;
                        const count = e.currentTarget.querySelector(
                          ".skill-count"
                        ) as HTMLElement;
                        if (text) text.style.color = "#ffffff";
                        if (count) count.style.background = "rgba(255, 255, 255, 0.2)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#252526";
                        e.currentTarget.style.borderColor = "#0078d4";
                        e.currentTarget.style.transform = "translateY(0) scale(1)";
                        e.currentTarget.style.boxShadow =
                          "0 2px 8px rgba(0, 120, 212, 0.2)";
                        const text = e.currentTarget.querySelector(
                          ".skill-text"
                        ) as HTMLElement;
                        const count = e.currentTarget.querySelector(
                          ".skill-count"
                        ) as HTMLElement;
                        if (text) text.style.color = "#cccccc";
                        if (count) count.style.background = "#1e1e1e";
                      }}
                    >
                      <div
                        className="skill-text"
                        style={{
                          fontWeight: "500",
                          color: "#cccccc",
                          fontSize: "14px",
                          position: "relative",
                          zIndex: 1,
                          transition: "color 0.3s",
                        }}
                      >
                        {skill}
                      </div>
                      {projectCount > 0 && (
                        <span
                          className="skill-count"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            minWidth: "24px",
                            height: "24px",
                            padding: "0 8px",
                            background: "#1e1e1e",
                            color: "#0078d4",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "600",
                            border: "1px solid #0078d4",
                            transition: "background 0.3s",
                          }}
                        >
                          {projectCount}
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </section>

      {/* Projects Section */}
      <section
        id="projects"
        style={{
          padding: "80px 40px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <h2
          style={{
            fontSize: "48px",
            fontWeight: "700",
            color: "#e0e0e0",
            marginBottom: "48px",
            textAlign: "center",
          }}
        >
          Projects
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "24px",
          }}
        >
          {projectItems.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => onProjectClick(project.id)}
            />
          ))}
        </div>
      </section>


      {/* Contact Section */}
      <section
        id="contact"
        style={{
          padding: "80px 40px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <h2
          style={{
            fontSize: "48px",
            fontWeight: "700",
            color: "#e0e0e0",
            marginBottom: "48px",
            textAlign: "center",
          }}
        >
          Contact Me
        </h2>
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          <ContactForm onClose={() => {}} />
        </div>
      </section>
    </div>
  );
}

