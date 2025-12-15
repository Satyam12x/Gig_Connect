import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  Search,
  Bookmark,
  Plus,
  X,
  Loader2,
  Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API_BASE = "http://localhost:5000/api";

const CATEGORIES = ["All", "UI/UX", "Web", "Mobile", "Branding", "Illustrations", "Motion"];

const ProjectCard = ({ project, onLike, currentUser }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(project.likes || 0);
  const [bookmarked, setBookmarked] = useState(false);

  // Sync local like state with prop changes if needed, 
  // though optimally we just trust the prop + local optimistic update
  useEffect(() => {
     setLikeCount(project.likes || 0);
  }, [project.likes]);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!currentUser) return; // simple guard
    
    // Optimistic update
    const newLikedState = !liked;
    setLiked(newLikedState);
    setLikeCount(prev => newLikedState ? prev + 1 : prev - 1);

    try {
       await onLike(project._id);
    } catch (error) {
       // Revert on error
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
            className={`bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white hover:text-blue-600 transition-colors shadow-md ${bookmarked ? 'text-blue-600' : 'text-gray-700'}`}
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
            <p className="text-gray-900 font-bold text-base leading-tight group-hover:text-blue-600 transition-colors line-clamp-1">
              {project.title}
            </p>
            <p className="text-gray-500 text-sm font-normal">
              {project.author}
            </p>
          </div>
        </div>
        
        <button 
          onClick={handleLike}
          className="flex items-center gap-1 text-gray-500 hover:text-pink-500 transition-colors group/like"
          title={!currentUser ? "Login to like" : "Like this project"}
        >
          <Heart 
            size={20} 
            className={`transition-colors ${liked ? "fill-pink-500 text-pink-500" : "group-hover/like:text-pink-500"}`} 
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
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    image: "",
    tags: "",
  });

  const navigate = useNavigate();

  // Fetch User & Projects
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch User Profile if token exists
        const token = localStorage.getItem("token");
        if (token) {
          try {
            const userRes = await axios.get(`${API_BASE}/users/profile`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setUser(userRes.data);
          } catch (err) {
            console.error("User fetch error", err);
            // Optionally clear invalid token here
          }
        }

        // 2. Fetch Projects
        const projectsRes = await axios.get(`${API_BASE}/spotlight`);
        setProjects(projectsRes.data);
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
    await axios.put(`${API_BASE}/spotlight/${projectId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
    });
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setSubmissionLoading(true);
      const tagsArray = newProject.tags.split(',').map(tag => tag.trim()).filter(Boolean);
      
      const payload = {
        ...newProject,
        tags: tagsArray
      };

      const res = await axios.post(`${API_BASE}/spotlight`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProjects([res.data, ...projects]);
      setIsModalOpen(false);
      setNewProject({ title: "", description: "", image: "", tags: "" });
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Failed to post project. Please try again.");
    } finally {
      setSubmissionLoading(false);
    }
  };

  const filteredProjects = projects.filter(p => {
      if (filter === "All") return true;
      // Handle case where tags might be missing or different format
      const pTags = Array.isArray(p.tags) ? p.tags : [];
      return pTags.some(tag => tag.toLowerCase() === filter.toLowerCase()) || 
             p.title?.toLowerCase().includes(filter.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <Navbar />

      <main className="flex-1 flex justify-center py-6 md:py-10 px-4 md:px-10">
        <div className="flex flex-col w-full max-w-[1280px]">
          
          {/* Page Heading & Hero */}
          <div className="flex flex-wrap justify-between items-end gap-6 pb-8 border-b border-gray-200 mb-8 mt-6">
            <div className="flex max-w-2xl flex-col gap-3">
              <h1 className="text-gray-900 text-4xl md:text-5xl font-black leading-tight tracking-tight">
                Spotlight <span className="text-blue-600">Greatness</span>
              </h1>
              <p className="text-gray-500 text-lg font-normal leading-relaxed">
                Curated work from elite freelancers. Discover, connect, and get inspired.
              </p>
            </div>

            {/* Post Button for Freelancers */}
            {user && user.role === "Freelancer" && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-bold shadow-lg shadow-blue-600/20 transition-all hover:scale-105 active:scale-95"
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
                      ? "bg-gray-900 text-white shadow-sm active:scale-95" 
                      : "bg-white border border-gray-200 text-gray-900 hover:bg-gray-50"
                  }`}
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
                 <input 
                    type="text" 
                    required
                    value={newProject.title}
                    onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                    placeholder="e.g. Modern Banking App"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                 />
               </div>

               <div>
                 <label className="block text-sm font-semibold text-gray-700 mb-1">Image URL</label>
                 <div className="flex gap-2">
                    <input 
                        type="url" 
                        required
                        value={newProject.image}
                        onChange={(e) => setNewProject({...newProject, image: e.target.value})}
                        placeholder="https://..."
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                    <div className="w-10 h-10 shrink-0 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200 overflow-hidden">
                        {newProject.image ? (
                             <img src={newProject.image} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                             <ImageIcon size={20} className="text-gray-400" />
                        )}
                    </div>
                 </div>
                 <p className="text-xs text-gray-400 mt-1">Direct link to your project screenshot.</p>
               </div>

               <div>
                 <label className="block text-sm font-semibold text-gray-700 mb-1">Tags</label>
                 <input 
                    type="text" 
                    value={newProject.tags}
                    onChange={(e) => setNewProject({...newProject, tags: e.target.value})}
                    placeholder="e.g. UI/UX, Mobile, Fintech (comma separated)"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                 />
               </div>

               <div>
                 <label className="block text-sm font-semibold text-gray-700 mb-1">Description (Optional)</label>
                 <textarea 
                    value={newProject.description}
                    onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                    placeholder="Tell us a bit about this project..."
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[100px] resize-none"
                 />
               </div>

               <div className="pt-2">
                 <button 
                    type="submit"
                    disabled={submissionLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center gap-2"
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

