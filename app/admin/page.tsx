"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TabButton } from './components/TabButton';
import { ImageUpload } from './components/ImageUpload';
import { SaveButton } from './components/SaveButton';
import { uploadImage } from './utils/imageUpload';

interface AboutData {
  title: string;
  intro: string;
  details: string[];
  imageUrl?: string;
}

interface SkillsData {
  sections: {
    title: string;
    items: string[];
  }[];
}

interface ProjectItem {
  id: string;
  type: string;
  title: string;
  summary?: string;
  href?: string;
  tags?: string[];
}

interface ProjectsData {
  initialFiles: ProjectItem[];
  projectItems: ProjectItem[];
}

export default function AdminPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'about' | 'skills' | 'projects' | 'resume'>('about');

  // Form states
  const [aboutData, setAboutData] = useState<AboutData>({
    title: '',
    intro: '',
    details: [],
  });
  const [skillsData, setSkillsData] = useState<SkillsData>({
    sections: [],
  });
  const [projectsData, setProjectsData] = useState<ProjectsData>({
    initialFiles: [],
    projectItems: [],
  });

  const [newDetail, setNewDetail] = useState('');
  const [newSkillItems, setNewSkillItems] = useState<{ [key: number]: string }>({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [resumeData, setResumeData] = useState<{ fileUrl: string | null; title: string }>({
    fileUrl: null,
    title: 'Resume'
  });
  const [uploadingResume, setUploadingResume] = useState(false);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/admin/verify');
      const data = await res.json();
      setAuthenticated(data.authenticated);
      if (data.authenticated) {
        loadData();
      }
    } catch (err) {
      console.error('Auth check error:', err);
      setAuthenticated(false);
    }
  };

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        setAuthenticated(true);
        loadData();
      } else {
        const data = await res.json();
        setError(data.error || 'Login failed');
      }
    } catch {
      setError('Failed to login');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setAuthenticated(false);
    router.push('/');
  };

  const loadData = async () => {
    try {
      const [aboutRes, skillsRes, projectsRes, resumeRes] = await Promise.all([
        fetch('/api/admin/about'),
        fetch('/api/admin/skills'),
        fetch('/api/admin/projects'),
        fetch('/api/admin/resume'),
      ]);

      const about = await aboutRes.json();
      const skills = await skillsRes.json();
      const projects = await projectsRes.json();
      const resume = await resumeRes.json();

      setAboutData(about);
      setSkillsData(skills);
      setProjectsData(projects);
      setResumeData(resume);
      
      // Set image preview if imageUrl exists
      if (about.imageUrl) {
        setImagePreview(about.imageUrl);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await uploadImage(file, '/api/admin/about/upload', setUploadingImage);
    
    if ('error' in result) {
      alert(result.error);
      return;
    }

    const imageUrl = result.path;
    setAboutData({ ...aboutData, imageUrl });
    setImagePreview(imageUrl);
  };

  const saveAbout = async () => {
    try {
      const res = await fetch('/api/admin/about', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aboutData),
      });

      if (res.ok) {
        alert('About data saved successfully!');
        // Reload data to ensure consistency
        loadData();
      } else {
        alert('Failed to save about data');
      }
    } catch {
      alert('Error saving about data');
    }
  };

  const saveSkills = async () => {
    try {
      const res = await fetch('/api/admin/skills', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(skillsData),
      });

      if (res.ok) {
        alert('Skills data saved successfully!');
      } else {
        alert('Failed to save skills data');
      }
    } catch {
      alert('Error saving skills data');
    }
  };

  const saveProjects = async () => {
    try {
      const res = await fetch('/api/admin/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectsData),
      });

      if (res.ok) {
        alert('Projects data saved successfully!');
        loadData();
      } else {
        alert('Failed to save projects data');
      }
    } catch {
      alert('Error saving projects data');
    }
  };

  const deleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const res = await fetch(`/api/admin/projects/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('Project deleted successfully!');
        loadData();
      } else {
        alert('Failed to delete project');
      }
    } catch {
      alert('Error deleting project');
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await uploadImage(file, '/api/admin/resume/upload', setUploadingResume);
    
    if ('error' in result) {
      alert(result.error);
      return;
    }

    const fileUrl = result.path;
    setResumeData({ ...resumeData, fileUrl });
  };

  const saveResume = async () => {
    try {
      const res = await fetch('/api/admin/resume', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resumeData),
      });

      if (res.ok) {
        alert('Resume data saved successfully!');
        loadData();
      } else {
        alert('Failed to save resume data');
      }
    } catch {
      alert('Error saving resume data');
    }
  };

  const addProject = async () => {
    const newProject: ProjectItem = {
      id: `project-${Date.now()}`,
      type: 'project',
      title: 'New Project',
      summary: '',
      tags: [],
    };

    try {
      const res = await fetch('/api/admin/projects/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject),
      });

      if (res.ok) {
        loadData();
      } else {
        alert('Failed to add project');
      }
    } catch {
      alert('Error adding project');
    }
  };

  if (authenticated === null) {
    return <div className="p-8 text-gray-900">Loading...</div>;
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-gray-900">Admin Login</h1>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-900">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white placeholder-gray-500"
                required
              />
            </div>
            {error && <p className="text-red-600 text-sm mb-4 font-medium">{error}</p>}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b">
            <div className="flex">
              <TabButton
                label="About Me"
                isActive={activeTab === 'about'}
                onClick={() => setActiveTab('about')}
              />
              <TabButton
                label="Skills"
                isActive={activeTab === 'skills'}
                onClick={() => setActiveTab('skills')}
              />
              <TabButton
                label="Projects"
                isActive={activeTab === 'projects'}
                onClick={() => setActiveTab('projects')}
              />
              <TabButton
                label="Resume"
                isActive={activeTab === 'resume'}
                onClick={() => setActiveTab('resume')}
              />
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'about' && (
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Edit About Me</h2>
                <div className="space-y-4">
                  <ImageUpload
                    label="Profile Image"
                    imageUrl={imagePreview || aboutData.imageUrl}
                    uploading={uploadingImage}
                    onUpload={handleImageUpload}
                    onRemove={() => {
                      setAboutData({ ...aboutData, imageUrl: undefined });
                      setImagePreview(null);
                    }}
                  />
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900">Title</label>
                    <input
                      type="text"
                      value={aboutData.title}
                      onChange={(e) => setAboutData({ ...aboutData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white placeholder-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900">Introduction</label>
                    <textarea
                      value={aboutData.intro}
                      onChange={(e) => setAboutData({ ...aboutData, intro: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white placeholder-gray-500"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900">Details</label>
                    {aboutData.details.map((detail, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={detail}
                          onChange={(e) => {
                            const newDetails = [...aboutData.details];
                            newDetails[index] = e.target.value;
                            setAboutData({ ...aboutData, details: newDetails });
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white placeholder-gray-500"
                        />
                        <button
                          onClick={() => {
                            const newDetails = aboutData.details.filter((_, i) => i !== index);
                            setAboutData({ ...aboutData, details: newDetails });
                          }}
                          className="bg-red-500 text-white px-3 py-2 rounded-md"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newDetail}
                        onChange={(e) => setNewDetail(e.target.value)}
                        placeholder="Add new detail"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white placeholder-gray-500"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && newDetail.trim()) {
                            setAboutData({
                              ...aboutData,
                              details: [...aboutData.details, newDetail.trim()],
                            });
                            setNewDetail('');
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          if (newDetail.trim()) {
                            setAboutData({
                              ...aboutData,
                              details: [...aboutData.details, newDetail.trim()],
                            });
                            setNewDetail('');
                          }
                        }}
                        className="bg-green-500 text-white px-3 py-2 rounded-md"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                  <SaveButton onClick={saveAbout} />
                </div>
              </div>
            )}

            {activeTab === 'skills' && (
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Edit Skills</h2>
                <div className="space-y-6">
                  {skillsData.sections.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="border p-4 rounded-md">
                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) => {
                            const newSections = [...skillsData.sections];
                            newSections[sectionIndex].title = e.target.value;
                            setSkillsData({ ...skillsData, sections: newSections });
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md font-medium text-gray-900 bg-white placeholder-gray-500"
                          placeholder="Section Title"
                        />
                        <button
                          onClick={() => {
                            const newSections = skillsData.sections.filter((_, i) => i !== sectionIndex);
                            setSkillsData({ ...skillsData, sections: newSections });
                          }}
                          className="bg-red-500 text-white px-3 py-2 rounded-md"
                        >
                          Remove Section
                        </button>
                      </div>
                      <div className="space-y-2">
                        {section.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex gap-2">
                            <input
                              type="text"
                              value={item}
                              onChange={(e) => {
                                const newSections = [...skillsData.sections];
                                newSections[sectionIndex].items[itemIndex] = e.target.value;
                                setSkillsData({ ...skillsData, sections: newSections });
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white placeholder-gray-500"
                            />
                            <button
                              onClick={() => {
                                const newSections = [...skillsData.sections];
                                newSections[sectionIndex].items = newSections[sectionIndex].items.filter(
                                  (_, i) => i !== itemIndex
                                );
                                setSkillsData({ ...skillsData, sections: newSections });
                              }}
                              className="bg-red-500 text-white px-3 py-2 rounded-md"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newSkillItems[sectionIndex] || ''}
                            onChange={(e) => setNewSkillItems({ ...newSkillItems, [sectionIndex]: e.target.value })}
                            placeholder="Add skill"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white placeholder-gray-500"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && newSkillItems[sectionIndex]?.trim()) {
                                const newSections = [...skillsData.sections];
                                newSections[sectionIndex].items.push(newSkillItems[sectionIndex].trim());
                                setSkillsData({ ...skillsData, sections: newSections });
                                setNewSkillItems({ ...newSkillItems, [sectionIndex]: '' });
                              }
                            }}
                          />
                          <button
                            onClick={() => {
                              if (newSkillItems[sectionIndex]?.trim()) {
                                const newSections = [...skillsData.sections];
                                newSections[sectionIndex].items.push(newSkillItems[sectionIndex].trim());
                                setSkillsData({ ...skillsData, sections: newSections });
                                setNewSkillItems({ ...newSkillItems, [sectionIndex]: '' });
                              }
                            }}
                            className="bg-green-500 text-white px-3 py-2 rounded-md"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      setSkillsData({
                        ...skillsData,
                        sections: [...skillsData.sections, { title: 'New Section', items: [] }],
                      });
                    }}
                    className="bg-green-500 text-white px-4 py-2 rounded-md"
                  >
                    Add Section
                  </button>
                  <div>
                    <SaveButton onClick={saveSkills} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'projects' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Edit Projects</h2>
                  <button
                    onClick={addProject}
                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                  >
                    Add Project
                  </button>
                </div>
                <div className="space-y-4">
                  {projectsData.projectItems.map((project) => (
                    <div key={project.id} className="border p-4 rounded-md">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-900">Title</label>
                          <input
                            type="text"
                            value={project.title}
                            onChange={(e) => {
                              const newProjects = {
                                ...projectsData,
                                projectItems: projectsData.projectItems.map((p) =>
                                  p.id === project.id ? { ...p, title: e.target.value } : p
                                ),
                              };
                              setProjectsData(newProjects);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white placeholder-gray-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-900">Summary</label>
                          <textarea
                            value={project.summary || ''}
                            onChange={(e) => {
                              const newProjects = {
                                ...projectsData,
                                projectItems: projectsData.projectItems.map((p) =>
                                  p.id === project.id ? { ...p, summary: e.target.value } : p
                                ),
                              };
                              setProjectsData(newProjects);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white placeholder-gray-500"
                            rows={3}
                            placeholder="Project description..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-900">Tags (comma-separated)</label>
                          <input
                            type="text"
                            value={project.tags ? project.tags.join(', ') : ''}
                            onChange={(e) => {
                              const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
                              const newProjects = {
                                ...projectsData,
                                projectItems: projectsData.projectItems.map((p) =>
                                  p.id === project.id ? { ...p, tags } : p
                                ),
                              };
                              setProjectsData(newProjects);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white placeholder-gray-500"
                            placeholder="TypeScript, React / Next.js, Node.js"
                          />
                          <p className="text-xs text-gray-500 mt-1">Enter skill names that match your skills list</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-900">Link (optional)</label>
                          <input
                            type="text"
                            value={project.href || ''}
                            onChange={(e) => {
                              const newProjects = {
                                ...projectsData,
                                projectItems: projectsData.projectItems.map((p) =>
                                  p.id === project.id ? { ...p, href: e.target.value } : p
                                ),
                              };
                              setProjectsData(newProjects);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white placeholder-gray-500"
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => deleteProject(project.id)}
                        className="mt-2 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                      >
                        Delete Project
                      </button>
                    </div>
                  ))}
                  <SaveButton onClick={saveProjects} />
                </div>
              </div>
            )}

            {activeTab === 'resume' && (
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Edit Resume</h2>
                <div className="space-y-4">
                  <ImageUpload
                    label="Resume Image"
                    imageUrl={resumeData.fileUrl}
                    uploading={uploadingResume}
                    onUpload={handleResumeUpload}
                    onRemove={() => setResumeData({ ...resumeData, fileUrl: null })}
                    previewSize="large"
                  />
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900">Resume Title</label>
                    <input
                      type="text"
                      value={resumeData.title}
                      onChange={(e) => setResumeData({ ...resumeData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white placeholder-gray-500"
                      placeholder="Resume"
                    />
                  </div>
                  <SaveButton onClick={saveResume} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

