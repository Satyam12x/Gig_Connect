import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  Share2,
  ExternalLink,
  Search,
  Filter,
  Zap,
  Award,
  TrendingUp,
  User,
  CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { theme } from "../constants/theme";

// --- MOCK DATA FOR HIGH IMPACT ---
const MOCK_PROJECTS = [
  {
    id: 1,
    title: "Neon Brand Identity",
    author: "Alex Morgan",
    authorAvatar: "",
    image: "https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&q=80&w=800",
    likes: 342,
    comments: 28,
    tags: ["Branding", "Design"],
    featured: true,
  },
  {
    id: 2,
    title: "E-Commerce Dashboard UI",
    author: "Sarah Chen",
    authorAvatar: "",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800",
    likes: 856,
    comments: 124,
    tags: ["UI/UX", "Web"],
    featured: true,
  },
  {
    id: 3,
    title: "Abstract 3D Motion",
    author: "David Park",
    authorAvatar: "",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800",
    likes: 1205,
    comments: 45,
    tags: ["3D", "Motion"],
  },
  {
    id: 4,
    title: "Minimalist Coffee App",
    author: "Emma Wilson",
    authorAvatar: "",
    image: "https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?auto=format&fit=crop&q=80&w=800",
    likes: 215,
    comments: 12,
    tags: ["Mobile", "App"],
  },
  {
    id: 5,
    title: "Eco-Friendly Packaging",
    author: "Green Studio",
    authorAvatar: "",
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=800",
    likes: 67,
    comments: 5,
    tags: ["Packaging", "Print"],
  },
  {
    id: 6,
    title: "Cyberpunk City Concept",
    author: "Neo Artist",
    authorAvatar: "",
    image: "https://images.unsplash.com/photo-1515630278258-407f66498911?auto=format&fit=crop&q=80&w=800",
    likes: 1543,
    comments: 320,
    tags: ["Concept Art", "Illustration"],
  },
  {
    id: 7,
    title: "Modern Finance App",
    author: "FinTech Sol",
    authorAvatar: "",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800",
    likes: 432,
    comments: 56,
    tags: ["UI/UX", "Finance"],
  },
  {
    id: 8,
    title: "Editorial Fashion Shoot",
    author: "Lens Queen",
    authorAvatar: "",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800",
    likes: 89,
    comments: 14,
    tags: ["Photography", "Fashion"],
  },
];

const CATEGORIES = ["All", "UI/UX", "Web", "Mobile", "Branding", "3D", "Illustration", "Photography"];

const ProjectCard = ({ project }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [liked, setLiked] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="relative break-inside-avoid mb-6 rounded-2xl overflow-hidden cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ boxShadow: "0 10px 40px -10px rgba(0,0,0,0.1)" }}
    >
      <div className="relative overflow-hidden bg-gray-100">
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-110"
          style={{ minHeight: "200px" }}
        />
        
        {/* Overlay Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`} />

        {/* Content Overlay */}
        <div className={`absolute inset-0 p-5 flex flex-col justify-between transition-all duration-300 ${isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
           <div className="flex justify-between items-start">
             <div className="flex gap-2">
                {project.featured && (
                    <span className="px-2 py-1 bg-yellow-400 text-black text-xs font-bold rounded-full flex items-center gap-1">
                        <Award size={10} /> Featured
                    </span>
                )}
             </div>
             <div className="flex gap-2">
                <button className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-black transition-colors">
                    <Share2 size={16} />
                </button>
             </div>
           </div>

           <div>
              <h3 className="text-white font-bold text-lg mb-1">{project.title}</h3>
              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs text-white font-bold">
                          {project.author[0]}
                      </div>
                      <span className="text-white/80 text-sm font-medium">{project.author}</span>
                  </div>
                  <div className="flex items-center gap-3">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
                        className={`flex items-center gap-1 text-sm font-medium transition-colors ${liked ? "text-red-500" : "text-white"}`}
                      >
                          <Heart size={16} className={liked ? "fill-current" : ""} />
                          {project.likes + (liked ? 1 : 0)}
                      </button>
                  </div>
              </div>
           </div>
        </div>
      </div>
      
      {/* Quick Action Bar (Visible on mobile or below card usually, but here integrated) */}
       <div className="absolute top-3 right-3 md:hidden">
          {/* Mobile specific badge if needed */}
       </div>
    </motion.div>
  );
};

const Spotlight = () => {
  const [filter, setFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("trending"); // trending, new, following

  const filteredProjects = MOCK_PROJECTS.filter(p => 
      filter === "All" || p.tags.includes(filter)
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-16 px-6 bg-[#1A2A4F] overflow-hidden">
        {/* Abstract Shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#2A3A6F] rounded-full blur-3xl opacity-30 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#7dd3fc] rounded-full blur-3xl opacity-10 -translate-x-1/2 translate-y-1/2"></div>

        <div className="relative z-10 max-w-7xl mx-auto text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-sky-200 border border-white/10 mb-6">
                    <Zap size={16} className="fill-current" />
                    <span className="text-sm font-bold tracking-wide uppercase">Community Showcase</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight leading-tight">
                    Spotlight <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400">Greatness</span>
                </h1>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
                    Discover inspiring projects from the top talent on Gig Connect. Show your best work, get feedback, and find your next opportunity.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button className="px-8 py-4 bg-white text-[#1A2A4F] font-bold rounded-xl hover:scale-105 transition-transform shadow-xl shadow-white/10 flex items-center gap-2">
                        <ExternalLink size={20} />
                        Submit Your Work
                    </button>
                    <button className="px-8 py-4 bg-transparent border-2 border-white/20 text-white font-bold rounded-xl hover:bg-white/10 transition-all">
                        Hire Talent
                    </button>
                </div>
            </motion.div>
        </div>
      </section>

      {/* --- FILTERS & TABS --- */}
      <div className="sticky top-16 z-30 bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  
                  {/* Tabs */}
                  <div className="flex p-1 bg-gray-100 rounded-lg">
                      {["trending", "new", "following"].map(tab => (
                          <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-md text-sm font-bold capitalize transition-all ${activeTab === tab ? "bg-white text-[#1A2A4F] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                          >
                            <div className="flex items-center gap-2">
                                {tab === "trending" && <TrendingUp size={14} />}
                                {tab === "new" && <Zap size={14} />}
                                {tab === "following" && <User size={14} />}
                                {tab}
                            </div>
                          </button>
                      ))}
                  </div>

                  {/* Categories */}
                  <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto scrollbar-hide pb-2 md:pb-0">
                      {CATEGORIES.map(cat => (
                          <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition-all ${filter === cat ? "bg-[#1A2A4F] text-white border-[#1A2A4F]" : "bg-white text-gray-600 border-gray-200 hover:border-[#1A2A4F]"}`}
                          >
                              {cat}
                          </button>
                      ))}
                  </div>
              </div>
          </div>
      </div>

      {/* --- MASONRY GRID --- */}
      <div className="max-w-7xl mx-auto px-6 py-12">
         <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            <AnimatePresence>
                {filteredProjects.map(project => (
                    <ProjectCard key={project.id} project={project} />
                ))}
            </AnimatePresence>
         </div>
         {filteredProjects.length === 0 && (
             <div className="text-center py-20 text-gray-500">
                 <p className="text-xl">No projects found in this category.</p>
             </div>
         )}
      </div>

      {/* --- CTA BOTTOM --- */}
       <section className="py-20 px-6 bg-gray-50">
           <div className="max-w-4xl mx-auto text-center p-12 bg-gradient-to-br from-[#1A2A4F] to-[#243454] rounded-3xl relative overflow-hidden text-white shadow-2xl">
               <div className="relative z-10">
                   <h2 className="text-3xl md:text-4xl font-black mb-6">Ready to showcase your talent?</h2>
                   <p className="text-lg text-white/80 mb-8">Join thousands of creators who are sharing their best work and getting hired on Gig Connect.</p>
                   <Link to="/signup">
                       <button className="px-8 py-4 bg-white text-[#1A2A4F] font-bold rounded-xl hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all transform hover:-translate-y-1">
                           Get Started for Free
                       </button>
                   </Link>
               </div>
               
               {/* Decorative Circles */}
               <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
               <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-sky-500/20 rounded-full blur-3xl"></div>
           </div>
       </section>

      <Footer />
    </div>
  );
};

export default Spotlight;
