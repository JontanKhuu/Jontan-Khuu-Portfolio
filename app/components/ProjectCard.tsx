"use client";

import type { FileItem } from "../data/types";

type ProjectCardProps = {
  project: FileItem;
  highlightedTag?: string;
  onClick: () => void;
};

export function ProjectCard({ project, highlightedTag, onClick }: ProjectCardProps) {
  return (
    <button
      onClick={onClick}
      style={{
        textAlign: 'left',
        padding: 0,
        border: '2px solid #0078d4',
        borderRadius: '16px',
        backgroundColor: '#252526',
        cursor: 'pointer',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 4px 12px rgba(0, 120, 212, 0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#0078d4';
        e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
        e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 120, 212, 0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#0078d4';
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 120, 212, 0.3)';
      }}
    >
      <div style={{
        padding: '32px',
        background: '#252526',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div>
          <div style={{
            fontWeight: '700',
            fontSize: '22px',
            color: '#e0e0e0',
            letterSpacing: '-0.5px',
            marginBottom: '12px',
            lineHeight: '1.3'
          }}>
            {project.title}
          </div>
          {project.summary && (
            <div style={{
              fontSize: '15px',
              color: '#a0a0a0',
              lineHeight: '1.6',
              marginBottom: project.tags && project.tags.length > 0 ? '16px' : '0'
            }}>
              {project.summary}
            </div>
          )}
          {project.tags && project.tags.length > 0 && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              marginTop: '12px'
            }}>
              {project.tags.map((tag: string) => (
                <span
                  key={tag}
                  style={{
                    padding: '4px 12px',
                    background: tag === highlightedTag ? '#0078d4' : '#1e1e1e',
                    color: tag === highlightedTag ? '#ffffff' : '#cccccc',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    border: tag === highlightedTag ? 'none' : '1px solid #3d3d3d'
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div style={{
          marginTop: '20px',
          display: 'flex',
          alignItems: 'center',
          color: '#0078d4',
          fontWeight: '600',
          fontSize: '14px'
        }}>
          View Project →
        </div>
      </div>
    </button>
  );
}

