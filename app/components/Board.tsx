"use client";

import { useCallback, useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { createSkillsItems, getFileIconSrc, type FileItem } from "../data/types";
import { File } from "./File";
import { ProjectCard } from "./ProjectCard";
import { ContentPanel } from "./ContentPanel";
import { ContactForm } from "./ContactForm";
import { ScrollView } from "./ScrollView";
import skillsData from "../data/skills.json";
import projectsData from "../data/projects.json";

const initialFiles: FileItem[] = projectsData.initialFiles as FileItem[];

type Props = {
  files?: FileItem[];
};

export function Board({ files = initialFiles }: Props) {
  // View mode state with localStorage persistence
  // Initialize with 'explorer' to match server render, then sync with localStorage in useEffect
  const [viewMode, setViewMode] = useState<'explorer' | 'scroll'>('explorer');
  
  // Sync viewMode with localStorage after mount (client-side only)
  // This is necessary to avoid hydration mismatch between server and client
  // The setState in useEffect is intentional and necessary for localStorage sync
  useEffect(() => {
    const saved = localStorage.getItem('viewMode');
    if ((saved === 'explorer' || saved === 'scroll') && saved !== viewMode) {
      setViewMode(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [items, setItems] = useState<FileItem[]>(() => files);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [openContent, setOpenContent] = useState<string | null>(null);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [parentFolder, setParentFolder] = useState<string | null>(null);
  const [resumeData, setResumeData] = useState<{ fileUrl: string | null; title: string } | null>(null);
  const [projectItems, setProjectItems] = useState<FileItem[]>(projectsData.projectItems as FileItem[]);
  const [aboutData, setAboutData] = useState<{ title: string; intro: string; details: string[]; imageUrl?: string }>({
    title: 'About Me',
    intro: '',
    details: [],
  });

  // Toggle view mode
  const toggleViewMode = useCallback(() => {
    const newMode = viewMode === 'explorer' ? 'scroll' : 'explorer';
    setViewMode(newMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('viewMode', newMode);
    }
  }, [viewMode]);
  
  // Load about data dynamically
  useEffect(() => {
    fetch('/api/about')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setAboutData(data);
        }
      })
      .catch(err => console.error('Error loading about data:', err));
  }, []);
  
  // Load projects data dynamically
  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        if (data.projectItems) {
          setProjectItems(data.projectItems as FileItem[]);
        }
      })
      .catch(err => console.error('Error loading projects data:', err));
  }, []);
  
  // Load resume data
  useEffect(() => {
    fetch('/api/resume')
      .then(res => res.json())
      .then(data => {
        setResumeData(data);
        // Update resume item with title if available
        if (data.title) {
          setItems(prevItems => 
            prevItems.map(item => 
              item.id === 'resume' 
                ? { ...item, title: data.title || item.title }
                : item
            )
          );
        }
      })
      .catch(err => console.error('Error loading resume data:', err));
  }, []);
  
  // Create skill items from skills data
  const skillsItems = useMemo(() => createSkillsItems(skillsData), []);
  
  // Count how many projects use each skill as a tag
  const skillUsageCount = useMemo(() => {
    const count: { [key: string]: number } = {};
    projectItems.forEach((project) => {
      if (project.tags) {
        project.tags.forEach((tag) => {
          count[tag] = (count[tag] || 0) + 1;
        });
      }
    });
    return count;
  }, [projectItems]);
  
  // Get items to display based on current folder
  const displayItems = currentFolder === "skills" 
    ? skillsItems 
    : currentFolder === "projects" 
    ? projectItems 
    : items;

  const handleFileSelect = useCallback((id: string) => {
    setSelectedFile(id);
  }, []);

  const handleFileOpen = useCallback((id: string) => {
    // First check root items for navigation (folders, about, links)
    const rootFile = items.find((f) => f.id === id);
    if (rootFile) {
      if (rootFile.type === "link") {
        // External links are handled by the Link component
        return;
      }
      
      if (rootFile.type === "folder") {
        // For Skills and Projects, open content panel instead of navigating
        if (id === "skills" || id === "projects") {
          setOpenContent(id);
          setParentFolder(null);
          return;
        }
        // For other folders, navigate into them
        setCurrentFolder(id);
        setSelectedFile(null);
        return;
      }
      
      if (rootFile.type === "about") {
        // About Me can be opened from anywhere - just show the content panel
        setOpenContent(id);
        return;
      }
      
      if (rootFile.type === "resume") {
        // Resume should open in content panel
        setOpenContent(id);
        return;
      }
      
      if (rootFile.type === "contact") {
        // Contact form should open in content panel
        setOpenContent(id);
        return;
      }
    }
    
    // If not found in root, check displayItems (for skills/projects inside folders)
    const file = displayItems.find((f) => f.id === id);
    if (!file) return;
    
    // For skills and projects, show content panel
    if (file.type === "skill" || file.type === "project") {
      // If we're in a folder, remember it as parent
      if (currentFolder) {
        setParentFolder(currentFolder);
      }
      setOpenContent(id);
    }
  }, [items, displayItems, currentFolder]);
  
  const handleBack = useCallback(() => {
    setCurrentFolder(null);
    setSelectedFile(null);
  }, []);

  const closeContent = useCallback(() => {
    // If we have a parent folder, go back to it instead of closing
    if (parentFolder) {
      setOpenContent(parentFolder);
      setParentFolder(null);
    } else {
      setOpenContent(null);
    }
    setSelectedFile(null);
  }, [parentFolder]);
  
  // Get current folder name for navigation path
  const getCurrentFolderName = () => {
    if (currentFolder === "skills") return "Skills";
    if (currentFolder === "projects") return "Projects";
    return null;
  };
  
  // Handle breadcrumb navigation
  const handleBreadcrumbClick = useCallback((level: "this-pc" | "portfolio" | string) => {
    if (level === "this-pc" || level === "portfolio") {
      // Go to root
      handleBack();
    } else if (level === "skills" || level === "projects") {
      // Navigate to specific folder
      setCurrentFolder(level);
      setSelectedFile(null);
    }
  }, [handleBack]);

  // Handle project click in scroll view
  const handleScrollProjectClick = useCallback((projectId: string) => {
    setOpenContent(projectId);
  }, []);

  // Handle skill click in scroll view
  const handleScrollSkillClick = useCallback((skillId: string) => {
    setOpenContent(skillId);
  }, []);

  // Handle resume click in scroll view
  const handleScrollResumeClick = useCallback(() => {
    setOpenContent('resume');
  }, []);

  // If scroll view mode, render ScrollView
  if (viewMode === 'scroll') {
    return (
      <>
        <ScrollView
          aboutData={aboutData}
          projectItems={projectItems}
          resumeData={resumeData}
          skillsItems={skillsItems}
          skillUsageCount={skillUsageCount}
          onProjectClick={handleScrollProjectClick}
          onSkillClick={handleScrollSkillClick}
          onResumeClick={handleScrollResumeClick}
          onToggleView={toggleViewMode}
        />
        {/* Content panels for scroll view */}
        {openContent && openContent.startsWith("project-") && (() => {
          const project = projectItems.find(p => p.id === openContent) as FileItem & { 
            images?: Array<{ url: string; description?: string }>; 
            details?: string;
          };
          if (!project) return null;
          return (
            <ContentPanel title={project.title} onClose={() => setOpenContent(null)}>
              <div style={{
                maxWidth: '800px',
                margin: '0 auto'
              }}>
                {project.summary && (
                  <div style={{
                    padding: '24px',
                    background: '#252526',
                    borderRadius: '16px',
                    marginBottom: '32px',
                    border: '1px solid #3d3d3d',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                  }}>
                    <p style={{
                      margin: 0,
                      fontSize: '16px',
                      lineHeight: '1.8',
                      color: '#cccccc'
                    }}>
                      {project.summary}
                    </p>
                  </div>
                )}
                {project.tags && project.tags.length > 0 && (
                  <div style={{
                    marginBottom: '32px'
                  }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#e0e0e0',
                      marginBottom: '16px'
                    }}>
                      Technologies Used
                    </h3>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}>
                      {project.tags.map((tag: string) => (
                        <span
                          key={tag}
                          style={{
                            padding: '8px 16px',
                            background: '#1e1e1e',
                            color: '#cccccc',
                            borderRadius: '12px',
                            fontSize: '14px',
                            fontWeight: '500',
                            border: '1px solid #3d3d3d'
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {project.images && project.images.length > 0 && (
                  <div style={{
                    marginBottom: '32px'
                  }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#e0e0e0',
                      marginBottom: '16px'
                    }}>
                      Project Images
                    </h3>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '24px'
                    }}>
                      {project.images.map((image: { url: string; description?: string }, imageIndex: number) => (
                        <div
                          key={imageIndex}
                          style={{
                            background: '#252526',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            border: '1px solid #3d3d3d',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                          }}
                        >
                          <div style={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            background: '#1e1e1e',
                            padding: '20px'
                          }}>
                            <Image
                              src={image.url}
                              alt={image.description || `Project image ${imageIndex + 1}`}
                              width={800}
                              height={600}
                              style={{
                                maxWidth: '100%',
                                height: 'auto',
                                borderRadius: '8px'
                              }}
                              unoptimized
                            />
                          </div>
                          {image.description && (
                            <div style={{
                              padding: '16px 20px',
                              borderTop: '1px solid #3d3d3d'
                            }}>
                              <p style={{
                                margin: 0,
                                fontSize: '14px',
                                lineHeight: '1.6',
                                color: '#cccccc'
                              }}>
                                {image.description}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {project.href && (
                  <div style={{
                    marginBottom: '32px',
                    display: 'flex',
                    justifyContent: 'center'
                  }}>
                    <a
                      href={project.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '14px 28px',
                        background: '#0078d4',
                        color: '#ffffff',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 12px rgba(0, 120, 212, 0.3)',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#106ebe';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 120, 212, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#0078d4';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 120, 212, 0.3)';
                      }}
                    >
                      <span>View Project</span>
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
                    </a>
                  </div>
                )}
                {project.details && (
                  <div style={{
                    padding: '40px',
                    background: '#252526',
                    borderRadius: '20px',
                    marginTop: '24px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                    border: '1px solid #3d3d3d'
                  }}>
                    <p style={{
                      margin: 0,
                      fontSize: '17px',
                      lineHeight: '1.8',
                      color: '#cccccc',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {project.details}
                    </p>
                  </div>
                )}
              </div>
            </ContentPanel>
          );
        })()}
        {openContent && openContent.startsWith("skill-") && (() => {
          const skill = skillsItems.find(s => s.id === openContent);
          if (!skill) return null;
          
          const filteredProjects = projectItems.filter((project: FileItem) => {
            return project.tags && project.tags.includes(skill.title);
          });
          
          return (
            <ContentPanel title={skill.title} onClose={() => setOpenContent(null)}>
              {filteredProjects.length > 0 ? (
                <div>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#e0e0e0',
                    marginBottom: '24px',
                    marginTop: '32px'
                  }}>
                    Projects using {skill.title}
                  </h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '24px'
                  }}>
                    {filteredProjects.map((project: FileItem) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        highlightedTag={skill.title}
                        onClick={() => handleScrollProjectClick(project.id)}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{
                  padding: '32px',
                  background: '#252526',
                  borderRadius: '16px',
                  marginTop: '24px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  border: '1px solid #3d3d3d'
                }}>
                  <p style={{
                    margin: 0,
                    fontSize: '16px',
                    lineHeight: '1.8',
                    color: '#cccccc'
                  }}>
                    No projects found using {skill.title} yet.
                  </p>
                </div>
              )}
            </ContentPanel>
          );
        })()}
        {openContent === "resume" && resumeData && (
          <ContentPanel title={resumeData.title || "Resume"} onClose={() => setOpenContent(null)}>
            <div style={{
              maxWidth: '900px',
              margin: '0 auto',
              padding: '20px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start'
            }}>
              {resumeData.fileUrl ? (
                <div style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <div style={{
                    maxWidth: '100%',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid #3d3d3d',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                    background: '#1e1e1e'
                  }}>
                    <Image
                      src={resumeData.fileUrl}
                      alt={resumeData.title || "Resume"}
                      width={1200}
                      height={1600}
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block'
                      }}
                      unoptimized
                    />
                  </div>
                </div>
              ) : (
                <div style={{
                  padding: '40px',
                  background: '#252526',
                  borderRadius: '20px',
                  textAlign: 'center',
                  border: '1px solid #3d3d3d'
                }}>
                  <p style={{
                    fontSize: '18px',
                    color: '#cccccc',
                    margin: 0
                  }}>
                    No resume uploaded yet.
                  </p>
                </div>
              )}
            </div>
          </ContentPanel>
        )}
      </>
    );
  }

  return (
    <div className="explorer-root">
      <div className="explorer-window">
        {/* Title Bar */}
        <div className="explorer-titlebar">
          <div className="titlebar-title">Portfolio (C:)</div>
          <div className="titlebar-controls">
            <button className="titlebar-btn">−</button>
            <button className="titlebar-btn">□</button>
            <button className="titlebar-btn">×</button>
          </div>
        </div>

        {/* Navigation Bar */}
        <div className="explorer-navbar">
          <div className="nav-buttons">
            <button 
              className="nav-btn" 
              aria-label="Back"
              onClick={handleBack}
              disabled={!currentFolder}
            >
              ←
            </button>
            <button className="nav-btn" aria-label="Forward" disabled>→</button>
            <button 
              className="nav-btn" 
              aria-label="Up"
              onClick={handleBack}
              disabled={!currentFolder}
            >
              ↑
            </button>
            <button 
              className="nav-btn" 
              aria-label="Refresh"
              onClick={() => window.location.reload()}
            >
              ↻
            </button>
          </div>
          <div className="nav-path">
            <span 
              className="nav-path-item"
              onClick={() => handleBreadcrumbClick("this-pc")}
              style={{ cursor: 'pointer' }}
            >
              This PC
            </span>
            <span className="nav-path-separator"> &gt; </span>
            <span 
              className="nav-path-item"
              onClick={() => handleBreadcrumbClick("portfolio")}
              style={{ cursor: 'pointer' }}
            >
              Portfolio (C:)
            </span>
            {currentFolder && (
              <>
                <span className="nav-path-separator"> &gt; </span>
                <span 
                  className="nav-path-item"
                  onClick={() => handleBreadcrumbClick(currentFolder)}
                  style={{ cursor: 'pointer' }}
                >
                  {getCurrentFolderName()}
                </span>
              </>
            )}
          </div>
          <div className="nav-search">Search Portfolio (C:)</div>
        </div>

        {/* Main Content Area */}
        <div className="explorer-content">
          {/* Navigation Pane */}
          <div className="explorer-nav-pane">
            <div className="nav-section">
              <div className="nav-section-title">Quick Access</div>
              {items.map((file) => (
                <div
                  key={file.id}
                  className={`nav-item pinned ${selectedFile === file.id ? 'selected' : ''} ${currentFolder === file.id ? 'selected' : ''}`}
                  onClick={() => {
                    if (file.type === 'link' && file.href) {
                      window.open(file.href, '_blank', 'noopener,noreferrer');
                    } else {
                      handleFileSelect(file.id);
                      handleFileOpen(file.id);
                    }
                  }}
                >
                  <span className="nav-item-content">
                    <Image
                      src={getFileIconSrc(file)}
                      alt=""
                        width={16}
                        height={16}
                        className="nav-icon"
                        unoptimized
                      />
                      <span className="nav-item-text">{file.title}</span>
                    </span>
                    <span className="nav-unpin">×</span>
                  </div>
              ))}
            </div>
            <div className="nav-section">
              <div className="nav-section-title">This PC</div>
              <div 
                className={`nav-item ${!currentFolder ? 'selected' : ''}`}
                onClick={handleBack}
                style={{ cursor: currentFolder ? 'pointer' : 'default' }}
              >
                📁 Portfolio (C:)
              </div>
              <div
                className="nav-item"
                onClick={toggleViewMode}
                style={{ cursor: 'pointer' }}
                title={`Switch to ${viewMode === 'explorer' ? 'Scroll' : 'Explorer'} view`}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Image
                    src="/Text-Icon.png"
                    alt=""
                    width={16}
                    height={16}
                    style={{ width: '16px', height: '16px' }}
                    unoptimized
                  />
                  Switch layout
                </span>
              </div>
            </div>
          </div>

          {/* Content Pane */}
          <div className="explorer-main-pane">
            {/* File folders */}
            {displayItems.map((file) => (
              <File
                key={file.id}
                file={file}
                onSelect={() => handleFileSelect(file.id)}
                onOpen={handleFileOpen}
                isSelected={selectedFile === file.id}
              />
            ))}
          </div>
        </div>

        {/* Status Bar */}
        <div className="explorer-statusbar">
          {displayItems.length} item{displayItems.length !== 1 ? 's' : ''} |
        </div>
      </div>

      {/* Content panels that appear when files are opened */}
      
      {/* Skills Overview Panel */}
      {openContent === "skills" && (
        <ContentPanel title="Skills" onClose={closeContent}>
            {skillsData.sections.map((section, sectionIndex) => (
              <div 
                key={sectionIndex} 
                style={{
                  marginBottom: sectionIndex < skillsData.sections.length - 1 ? '48px' : '0',
                  paddingBottom: sectionIndex < skillsData.sections.length - 1 ? '48px' : '0',
                  borderBottom: sectionIndex < skillsData.sections.length - 1 ? '1px solid #f3f4f6' : 'none'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '24px'
                }}>
                  <div style={{
                    width: '4px',
                    height: '24px',
                    background: '#0078d4',
                    borderRadius: '2px',
                    marginRight: '12px'
                  }}></div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#e0e0e0',
                  letterSpacing: '-0.3px',
                  margin: 0
                }}>
                  {section.title}
                </h3>
                </div>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  {[...section.items].sort((a, b) => {
                    const countA = skillUsageCount[a] || 0;
                    const countB = skillUsageCount[b] || 0;
                    // Sort by count descending (highest first), then alphabetically if counts are equal
                    if (countB !== countA) {
                      return countB - countA;
                    }
                    return a.localeCompare(b);
                  }).map((skill) => {
                    const skillItem = skillsItems.find(s => 
                      s.id === `skill-${skill.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
                    );
                    const projectCount = skillUsageCount[skill] || 0;
                    return (
                      <button
                        key={skill}
                        onClick={() => {
                          if (skillItem) {
                            // Keep skills folder open by setting it as parent
                            setParentFolder("skills");
                            setOpenContent(skillItem.id);
                          }
                        }}
                        style={{
                          padding: '12px 20px',
                          border: '2px solid #0078d4',
                          borderRadius: '50px',
                          background: '#252526',
                          cursor: 'pointer',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: '0 2px 8px rgba(0, 120, 212, 0.2)',
                          position: 'relative',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#0078d4';
                          e.currentTarget.style.borderColor = '#0078d4';
                          e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
                          e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 120, 212, 0.4)';
                          const text = e.currentTarget.querySelector('.skill-text') as HTMLElement;
                          const count = e.currentTarget.querySelector('.skill-count') as HTMLElement;
                          if (text) text.style.color = '#ffffff';
                          if (count) count.style.background = 'rgba(255, 255, 255, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#252526';
                          e.currentTarget.style.borderColor = '#0078d4';
                          e.currentTarget.style.transform = 'translateY(0) scale(1)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 120, 212, 0.2)';
                          const text = e.currentTarget.querySelector('.skill-text') as HTMLElement;
                          const count = e.currentTarget.querySelector('.skill-count') as HTMLElement;
                          if (text) text.style.color = '#cccccc';
                          if (count) count.style.background = '#1e1e1e';
                        }}
                      >
                        <div className="skill-text" style={{
                          fontWeight: '500',
                          color: '#cccccc',
                          fontSize: '14px',
                          position: 'relative',
                          zIndex: 1,
                          transition: 'color 0.3s'
                        }}>
                          {skill}
                        </div>
                        {projectCount > 0 && (
                          <span className="skill-count" style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: '24px',
                            height: '24px',
                            padding: '0 8px',
                            background: '#1e1e1e',
                            color: '#0078d4',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            border: '1px solid #0078d4',
                            transition: 'background 0.3s'
                          }}>
                            {projectCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
        </ContentPanel>
      )}

      {/* Projects Overview Panel */}
      {openContent === "projects" && (
        <ContentPanel title="Projects" onClose={closeContent}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {projectItems.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => {
                  setParentFolder("projects");
                  setOpenContent(project.id);
                }}
              />
            ))}
          </div>
        </ContentPanel>
      )}

      {/* Individual Skill Detail Panel */}
      {openContent && openContent.startsWith("skill-") && (() => {
        const skill = skillsItems.find(s => s.id === openContent);
        if (!skill) return null;
        
        // Filter projects that have this skill as a tag
        const filteredProjects = projectItems.filter((project: FileItem) => {
          return project.tags && project.tags.includes(skill.title);
        });
        
        return (
          <ContentPanel title={skill.title} onClose={closeContent}>
            {filteredProjects.length > 0 ? (
              <div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#e0e0e0',
                  marginBottom: '24px',
                  marginTop: '32px'
                }}>
                  Projects using {skill.title}
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '24px'
                }}>
                  {filteredProjects.map((project: FileItem) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      highlightedTag={skill.title}
                      onClick={() => {
                        setParentFolder(openContent);
                        setOpenContent(project.id);
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div style={{
                padding: '32px',
                background: '#252526',
                borderRadius: '16px',
                marginTop: '24px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                border: '1px solid #3d3d3d'
              }}>
                <p style={{
                  margin: 0,
                  fontSize: '16px',
                  lineHeight: '1.8',
                  color: '#cccccc'
                }}>
                  No projects found using {skill.title} yet.
                </p>
              </div>
            )}
          </ContentPanel>
        );
      })()}

      {openContent === "about" && (
        <ContentPanel title={aboutData.title} onClose={closeContent}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            maxWidth: '700px',
            margin: '0 auto'
          }}>
              {aboutData.imageUrl && (
                <div style={{
                  marginBottom: '40px',
                  position: 'relative'
                }}>
                  <div style={{
                    width: '160px',
                    height: '160px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '6px solid #3d3d3d',
                    backgroundColor: '#252526',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
                    position: 'relative'
                  }}>
                    <Image
                      src={aboutData.imageUrl}
                      alt="Profile"
                      width={160}
                      height={160}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      unoptimized
                    />
                  </div>
                  <div style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    width: '40px',
                    height: '40px',
                    background: '#0078d4',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0, 120, 212, 0.4)'
                  }}>
                    <span style={{ color: '#ffffff', fontSize: '20px' }}>👋</span>
                  </div>
                </div>
              )}
              <p style={{
                fontSize: '20px',
                lineHeight: '1.8',
                color: '#cccccc',
                marginBottom: '40px',
                padding: '32px',
                background: '#252526',
                borderRadius: '20px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                textAlign: 'left',
                fontWeight: '400',
                border: '1px solid #3d3d3d',
                whiteSpace: 'pre-wrap'
              }}>
                {aboutData.intro}
              </p>
              {aboutData.details.length > 0 && (
                <div style={{
                  width: '100%',
                  padding: '32px',
                  background: '#252526',
                  borderRadius: '20px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                  border: '1px solid #3d3d3d'
                }}>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#e0e0e0',
                    marginBottom: '24px',
                    textAlign: 'center'
                  }}>
                    More About Me
                  </h3>
                  <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0
                  }}>
                    {aboutData.details.map((line, index) => (
                      <li key={line} style={{
                        marginBottom: index < aboutData.details.length - 1 ? '16px' : '0',
                        padding: '16px',
                        background: '#1e1e1e',
                        borderRadius: '12px',
                        color: '#cccccc',
                        fontSize: '16px',
                        lineHeight: '1.7',
                        border: '1px solid #3d3d3d'
                      }}>
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        </ContentPanel>
      )}

      {openContent && openContent.startsWith("project-") && (() => {
        const project = projectItems.find(p => p.id === openContent) as FileItem & { 
          images?: Array<{ url: string; description?: string }>; 
          details?: string;
        };
        if (!project) return null;
        return (
          <ContentPanel title={project.title} onClose={closeContent}>
              <div style={{
                maxWidth: '800px',
                margin: '0 auto'
              }}>
                {project.summary && (
                  <div style={{
                    padding: '24px',
                    background: '#252526',
                    borderRadius: '16px',
                    marginBottom: '32px',
                    border: '1px solid #3d3d3d',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                  }}>
                    <p style={{
                      margin: 0,
                      fontSize: '16px',
                      lineHeight: '1.8',
                      color: '#cccccc'
                    }}>
                      {project.summary}
                    </p>
                  </div>
                )}
                {project.tags && project.tags.length > 0 && (
                  <div style={{
                    marginBottom: '32px'
                  }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#e0e0e0',
                      marginBottom: '16px'
                    }}>
                      Technologies Used
                    </h3>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}>
                      {project.tags.map((tag: string) => (
                        <span
                          key={tag}
                          style={{
                            padding: '8px 16px',
                            background: '#1e1e1e',
                            color: '#cccccc',
                            borderRadius: '12px',
                            fontSize: '14px',
                            fontWeight: '500',
                            border: '1px solid #3d3d3d'
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {project.images && project.images.length > 0 && (
                  <div style={{
                    marginBottom: '32px'
                  }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#e0e0e0',
                      marginBottom: '16px'
                    }}>
                      Project Images
                    </h3>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '24px'
                    }}>
                      {project.images.map((image: { url: string; description?: string }, imageIndex: number) => (
                        <div
                          key={imageIndex}
                          style={{
                            background: '#252526',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            border: '1px solid #3d3d3d',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                          }}
                        >
                          <div style={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            background: '#1e1e1e',
                            padding: '20px'
                          }}>
                            <Image
                              src={image.url}
                              alt={image.description || `Project image ${imageIndex + 1}`}
                              width={800}
                              height={600}
                              style={{
                                maxWidth: '100%',
                                height: 'auto',
                                borderRadius: '8px'
                              }}
                              unoptimized
                            />
                          </div>
                          {image.description && (
                            <div style={{
                              padding: '16px 20px',
                              borderTop: '1px solid #3d3d3d'
                            }}>
                              <p style={{
                                margin: 0,
                                fontSize: '14px',
                                lineHeight: '1.6',
                                color: '#cccccc'
                              }}>
                                {image.description}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {project.href && (
                  <div style={{
                    marginBottom: '32px',
                    display: 'flex',
                    justifyContent: 'center'
                  }}>
                    <a
                      href={project.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '14px 28px',
                        background: '#0078d4',
                        color: '#ffffff',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 12px rgba(0, 120, 212, 0.3)',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#106ebe';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 120, 212, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#0078d4';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 120, 212, 0.3)';
                      }}
                    >
                      <span>View Project</span>
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
                    </a>
                  </div>
                )}
                {project.details && (
                  <div style={{
                    padding: '40px',
                    background: '#252526',
                    borderRadius: '20px',
                    marginTop: '24px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                    border: '1px solid #3d3d3d'
                  }}>
                    <p style={{
                      margin: 0,
                      fontSize: '17px',
                      lineHeight: '1.8',
                      color: '#cccccc',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {project.details}
                    </p>
                  </div>
                )}
            </div>
          </ContentPanel>
        );
      })()}

      {openContent === "resume" && resumeData && (
        <ContentPanel title={resumeData.title || "Resume"} onClose={closeContent}>
          <div style={{
            maxWidth: '900px',
            margin: '0 auto',
            padding: '20px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start'
          }}>
              {resumeData.fileUrl ? (
                <div style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <div style={{
                    maxWidth: '100%',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid #3d3d3d',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                    background: '#1e1e1e'
                  }}>
                    <Image
                      src={resumeData.fileUrl}
                      alt={resumeData.title || "Resume"}
                      width={1200}
                      height={1600}
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block'
                      }}
                      unoptimized
                    />
                  </div>
                </div>
              ) : (
                <div style={{
                  padding: '40px',
                  background: '#252526',
                  borderRadius: '20px',
                  textAlign: 'center',
                  border: '1px solid #3d3d3d'
                }}>
                  <p style={{
                    fontSize: '18px',
                    color: '#cccccc',
                    margin: 0
                  }}>
                    No resume uploaded yet.
                  </p>
                </div>
              )}
          </div>
        </ContentPanel>
      )}

      {openContent === "contact" && (
        <ContentPanel title="Contact Me" onClose={closeContent}>
          <ContactForm onClose={closeContent} />
        </ContentPanel>
      )}
    </div>
  );
}
