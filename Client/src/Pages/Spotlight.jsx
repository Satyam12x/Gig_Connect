import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import {
  Heart,
  Search,
  Bookmark,
  Plus,
  X,
  Loader2,
  Image as ImageIcon,
  Upload,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { theme } from "../constants";

// New imports
import { spotlightAPI, authAPI } from "../api";
import { API_BASE } from "../constants/api";


const CATEGORIES = ["All", "UI/UX", "Web", "Mobile", "Branding", "Illustrations", "Motion"];

const ProjectCard = ({ project, onLike, currentUser }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(project.likes || 0);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
     setLikeCount(project.likes || 0);
  }, [project.likes]);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!currentUser) return; 
    
    // Optimistic update
    const newLikedState = !liked;
    setLiked(newLikedState);
    setLikeCount(prev => newLikedState ? prev + 1 : prev - 1);

    try {
       await onLike(project._id);
    } catch (error) {
       setLiked(!newLikedState);
       setLikeCount(prev => newLikedState ? prev - 1 : prev + 1);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      layout
      className="group flex flex-col gap-3 cursor-pointer"
    >
      <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-sm transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1 bg-gray-100">
        <div 
          className="w-full h-full bg-center bg-no-repeat bg-cover transition-transform duration-500 group-hover:scale-110" 
          style={{ backgroundImage: `url("${project.image}")` }}
        />
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => { e.stopPropagation(); setBookmarked(!bookmarked); }}
            className={`bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors shadow-md ${bookmarked ? 'text-[#1A2A4F]' : 'text-gray-700'}`}
          >
            <Bookmark size={20} className={bookmarked ? "fill-current" : ""} />
          </button>
        </div>
      </div>
      
      <div className="flex justify-between items-start gap-2">
        <div className="flex gap-3 items-center">
          <div 
            className="w-8 h-8 rounded-full bg-gray-200 bg-cover bg-center border border-gray-100" 
            style={{ backgroundImage: `url("${project.authorAvatar || 'https://ui-avatars.com/api/?name=' + project.author}")` }} 
          />
          <div>
            <p className="text-gray-900 font-bold text-base leading-tight group-hover:text-[#1A2A4F] transition-colors line-clamp-1">
              {project.title}
            </p>
            <p className="text-gray-500 text-sm font-normal">
              {project.author}
            </p>
          </div>
        </div>
        
        <button 
          onClick={handleLike}
          className="flex items-center gap-1 text-gray-500 hover:text-[#E91E63] transition-colors group/like"
          title={!currentUser ? "Login to like" : "Like this project"}
        >
          <Heart 
            size={20} 
            className={`transition-colors ${liked ? "fill-[#E91E63] text-[#E91E63]" : "group-hover/like:text-[#E91E63]"}`} 
          />
          <span className="text-xs font-medium">
            {likeCount.toLocaleString()}
          </span>
        </button>
      </div>
    </motion.div>
  );
};

const Spotlight = () => {
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  
  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef(null);

  const navigate = useNavigate();

  // Fetch User & Projects
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (token) {
          try {
            const userData = await authAPI.getCurrentUser();
            setUser(userData);
          } catch (err) {
            console.error("User fetch error", err);
          }
        }
        const projectsData = await spotlightAPI.getAll();
        setProjects(projectsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLike = async (projectId) => {
    const token = localStorage.getItem("token");
    if (!token) {
        navigate("/login");
        return;
    }
    await spotlightAPI.toggleLike(projectId);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("File size too large (max 5MB)");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Manual generation handler (triggered by button click)
  const handleGenerateAI = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to use AI features");
      return;
    }
    
    // Input validation & sanitization
    if (!title || title.trim().length < 3) {
      toast.error("Please enter a project title (at least 3 characters)");
      return;
    }

    if (title.trim().length > 100) {
      toast.error("Project title is too long (max 100 characters)");
      return;
    }

    // Prevent duplicate/concurrent requests
    if (generatingAI) {
      toast.error("Please wait for the current generation to complete");
      return;
    }

    try {
      setGeneratingAI(true);
      
      // Sanitize input - prevent injection attacks
      const sanitizedTitle = title.trim().replace(/[<>]/g, '');
      
      // Use the same AI endpoint as CreateGig
      const prompt = `Based on this project title: "${sanitizedTitle}", generate:
1. A compelling, professional description (2-3 sentences) that showcases the project
2. 3-5 relevant tags (single words or short phrases, comma-separated)

Format your response as:
DESCRIPTION: [your description here]
TAGS: [tag1, tag2, tag3]`;

      const response = await axios.post(
        `${API_BASE}/generate`,
        { message: prompt },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 30000, // 30 second timeout for scalability
        }
      );

      if (response.data.success && response.data.response) {
        const aiResponse = response.data.response;
        
        // Parse the AI response
        const descMatch = aiResponse.match(/DESCRIPTION:\s*(.+?)(?=TAGS:|$)/s);
        const tagsMatch = aiResponse.match(/TAGS:\s*(.+)/s);
        
        if (descMatch) {
          setDescription(descMatch[1].trim());
        }
        if (tagsMatch) {
          setTags(tagsMatch[1].trim());
        }
        
        toast.success("Description and tags generated successfully!");
      } else {
        toast.error("No response from AI. Please try again.");
      }
    } catch (error) {
      console.error("AI Generation failed:", error);
      
      // Better error handling for different scenarios
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        toast.error("Request timed out. Please try again.");
      } else if (error.response?.status === 429) {
        toast.error("Too many requests. Please wait a moment and try again.");
      } else if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate('/login');
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else if (error.message.includes('Network Error')) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error("Failed to generate details. Please try again.");
      }
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token || !imageFile) return;

    try {
      setSubmissionLoading(true);
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(Boolean);
      
      // Use FormData for file upload
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      
      // Send tags as a simple comma-separated string
      formData.append("tags", tagsArray.join(",")); 
      
      formData.append("image", imageFile); 

      const newProject = await spotlightAPI.create(formData);

      setProjects([newProject, ...projects]);
      setIsModalOpen(false);
      
      // Reset form
      setTitle("");
      setDescription("");
      setTags("");
      setImageFile(null);
      setImagePreview("");
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Failed to post project. Please try again.");
    } finally {
      setSubmissionLoading(false);
    }
  };

  const filteredProjects = projects.filter(p => {
      if (filter === "All") return true;
      const pTags = Array.isArray(p.tags) ? p.tags : [];
      return pTags.some(tag => tag.toLowerCase() === filter.toLowerCase()) || 
             p.title?.toLowerCase().includes(filter.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <Toaster position="top-right" />
      <Navbar />

      <main className="flex-1 flex justify-center py-6 md:py-10 px-4 md:px-10">
        <div className="flex flex-col w-full max-w-[1280px]">
          
          {/* Page Heading & Hero */}
          <div className="flex flex-wrap justify-between items-end gap-6 pb-8 border-b border-gray-200 mb-8 mt-6">
            <div className="flex max-w-2xl flex-col gap-3">
              <h1 className="text-gray-900 text-4xl md:text-5xl font-black leading-tight tracking-tight">
                Spotlight <span style={{ color: theme.primary }}>Greatness</span>
              </h1>
              <p className="text-gray-500 text-lg font-normal leading-relaxed">
                Curated work from elite freelancers. Discover, connect, and get inspired.
              </p>
            </div>

            {/* Post Button for Freelancers */}
            {user && user.role === "Freelancer" && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 text-white px-5 py-3 rounded-lg font-bold shadow-lg transition-all hover:scale-105 active:scale-95"
                style={{ backgroundColor: theme.primary, boxShadow: `0 10px 15px -3px ${theme.primary}40` }}
              >
                <Plus size={20} />
                Post Work
              </button>
            )}
          </div>

          {/* Chips / Filters */}
          <div className="flex gap-3 pb-8 flex-wrap overflow-x-auto no-scrollbar">
            {CATEGORIES.map((cat) => (
               <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg px-5 transition-all text-sm font-medium ${
                    filter === cat 
                      ? "text-white shadow-sm active:scale-95" 
                      : "bg-white border border-gray-200 text-gray-900 hover:bg-gray-50"
                  }`}
                  style={filter === cat ? { backgroundColor: theme.primary } : {}}
               >
                 {cat === "All" ? "All Work" : cat}
               </button>
            ))}
          </div>

          {/* Content Area */}
          {loading ? (
             <div className="flex justify-center items-center min-h-[400px]">
                <Loader2 size={40} className="animate-spin text-gray-300" />
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10 min-h-[400px]">
              <AnimatePresence mode="popLayout">
                {filteredProjects.map((project) => (
                  <ProjectCard 
                    key={project._id || project.id} 
                    project={project} 
                    onLike={handleLike}
                    currentUser={user}
                  />
                ))}
              </AnimatePresence>

              {filteredProjects.length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500">
                      <Search size={48} className="mb-4 opacity-20" />
                      <p className="text-xl font-medium">No projects found matching your filter.</p>
                  </div>
              )}
            </div>
          )}

          {/* Load More - Optional / Placeholder */}
          {!loading && filteredProjects.length > 0 && (
            <div className="flex px-4 py-12 justify-center">
                <button className="text-gray-400 hover:text-gray-900 font-medium transition-colors">
                    End of results
                </button>
            </div>
          )}

        </div>
      </main>
      
      <Footer />

      {/* Add Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div 
             className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
             onClick={() => setIsModalOpen(false)}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
          >
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Share Your Work</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreateProject} className="p-6 space-y-5">
               <div>
                 <label className="block text-sm font-semibold text-gray-700 mb-1">Project Title</label>
                 <div className="flex gap-2">
                   <input 
                      type="text" 
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Modern Banking App"
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1A2A4F]/20 focus:border-[#1A2A4F] transition-all"
                   />
                   <button
                     type="button"
                     onClick={handleGenerateAI}
                     disabled={generatingAI || !title || title.trim().length < 3}
                     className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 whitespace-nowrap"
                     title="Generate description and tags with AI"
                   >
                     {generatingAI ? (
                       <>
                         <Loader2 size={16} className="animate-spin" />
                         <span className="hidden sm:inline">Generating...</span>
                       </>
                     ) : (
                       <>
                         <Sparkles size={16} />
                         <span className="hidden sm:inline">Generate</span>
                       </>
                     )}
                   </button>
                 </div>
                 <p className="text-xs text-gray-500 mt-1">💡 Click Generate to auto-fill description and tags with AI</p>
               </div>

               <div>
                 <label className="block text-sm font-semibold text-gray-700 mb-1">Project Image</label>
                 <div 
                    className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors ${imagePreview ? 'border-[#1A2A4F] bg-blue-50/50' : 'border-gray-200 hover:border-[#1A2A4F] hover:bg-gray-50'}`}
                    onClick={() => fileInputRef.current?.click()}
                 >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImageChange} 
                      accept="image/*" 
                      className="hidden" 
                    />
                    
                    {imagePreview ? (
                      <div className="relative w-full h-48 rounded-lg overflow-hidden">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <span className="text-white font-medium flex items-center gap-2">
                                <Upload size={18} /> Change Image
                            </span>
                        </div>
                      </div>
                    ) : (
                      <div className="py-8 text-center text-gray-500">
                         <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <ImageIcon size={24} className="text-gray-400" />
                         </div>
                         <p className="text-sm font-medium text-gray-700">Click to upload image</p>
                         <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                      </div>
                    )}
                 </div>
               </div>

               <div>
                 <label className="block text-sm font-semibold text-gray-700 mb-1">Tags</label>
                 <input 
                    type="text" 
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="e.g. UI/UX, Mobile, Fintech (comma separated)"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1A2A4F]/20 focus:border-[#1A2A4F] transition-all"
                 />
               </div>

               <div>
                 <label className="block text-sm font-semibold text-gray-700 mb-1">Description (Optional)</label>
                 <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell us a bit about this project..."
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1A2A4F]/20 focus:border-[#1A2A4F] transition-all min-h-[100px] resize-none"
                 />
               </div>

               <div className="pt-2">
                 <button 
                    type="submit"
                    disabled={submissionLoading || !imageFile}
                    className="w-full text-white font-bold py-3 rounded-lg shadow-lg transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center gap-2"
                    style={{ backgroundColor: theme.primary, boxShadow: `0 10px 15px -3px ${theme.primary}40` }}
                 >
                    {submissionLoading && <Loader2 size={20} className="animate-spin" />}
                    {submissionLoading ? "Publishing..." : "Publish Project"}
                 </button>
               </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Spotlight;
