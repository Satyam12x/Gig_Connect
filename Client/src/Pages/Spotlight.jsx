import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  Share2,
  ExternalLink,
  Search,
  Filter,
  Zap,
  Bookmark,
  TrendingUp,
  User,
  MoreHorizontal
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// --- MOCK DATA FOR HIGH IMPACT ---
const MOCK_PROJECTS = [
  {
    id: 1,
    title: "Fintech Dashboard",
    author: "Sarah Jenkins",
    authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800",
    likes: 1200,
    tags: ["UI/UX", "Web"],
    featured: true,
  },
  {
    id: 2,
    title: "Eco Branding Kit",
    author: "Mike Ross",
    authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
    image: "https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&q=80&w=800",
    likes: 850,
    tags: ["Branding", "Design"],
  },
  {
    id: 3,
    title: "Neon 3D Abstract",
    author: "Jessica Lee",
    authorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800",
    likes: 2100,
    tags: ["3D", "Motion"],
  },
  {
    id: 4,
    title: "Travel App UI",
    author: "David Chen",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
    image: "https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?auto=format&fit=crop&q=80&w=800",
    likes: 400,
    tags: ["Mobile", "App"],
  },
  {
    id: 5,
    title: "Coffee Shop Identity",
    author: "Emily Blunt",
    authorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150",
    image: "https://images.unsplash.com/photo-1515630278258-407f66498911?auto=format&fit=crop&q=80&w=800",
    likes: 900,
    tags: ["Branding", "Print"],
  },
  {
    id: 6,
    title: "Fitness Tracker App",
    author: "Tom Hiddleston",
    authorAvatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150",
    image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&q=80&w=800",
    likes: 1500,
    tags: ["Mobile", "Health"],
  },
  {
    id: 7,
    title: "Editorial Illustration",
    author: "Anna Wintour",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800",
    likes: 3200,
    tags: ["Illustration", "Art"],
  },
  {
    id: 8,
    title: "Tech Icon Set",
    author: "Chris Evans",
    authorAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150",
    image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&q=80&w=800",
    likes: 600,
    tags: ["Icons", "Design"],
  }
];

const CATEGORIES = ["All", "UI/UX", "Web", "Mobile", "Branding", "Illustrations", "Motion"];

const ProjectCard = ({ project }) => {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      layout
      className="group flex flex-col gap-3 cursor-pointer"
    >
      <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-sm transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
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
            style={{ backgroundImage: `url("${project.authorAvatar}")` }} 
          />
          <div>
            <p className="text-gray-900 font-bold text-base leading-tight group-hover:text-blue-600 transition-colors">
              {project.title}
            </p>
            <p className="text-gray-500 text-sm font-normal">
              {project.author}
            </p>
          </div>
        </div>
        
        <button 
          onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
          className="flex items-center gap-1 text-gray-500 hover:text-pink-500 transition-colors group/like"
        >
          <Heart 
            size={20} 
            className={`transition-colors ${liked ? "fill-pink-500 text-pink-500" : "group-hover/like:text-pink-500"}`} 
          />
          <span className="text-xs font-medium">
            {(project.likes + (liked ? 1 : 0)).toLocaleString()}
          </span>
        </button>
      </div>
    </motion.div>
  );
};

const Spotlight = () => {
  const [filter, setFilter] = useState("All");

  const filteredProjects = MOCK_PROJECTS.filter(p => 
      filter === "All" || p.tags.some(tag => tag.toLowerCase().includes(filter.toLowerCase())) || p.title.toLowerCase().includes(filter.toLowerCase())
  );

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
                Curated work from elite freelancers around the globe. Discover, connect, and get inspired by the best in the industry.
              </p>
            </div>
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

          {/* Image Grid / Gallery */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10 min-h-[400px]">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </AnimatePresence>

            {filteredProjects.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500">
                    <Search size={48} className="mb-4 opacity-20" />
                    <p className="text-xl font-medium">No projects found matching your filter.</p>
                </div>
            )}
          </div>

          {/* Load More */}
          <div className="flex px-4 py-12 justify-center">
            <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-8 bg-white border border-gray-200 text-gray-900 text-base font-bold hover:bg-gray-50 transition-all shadow-sm">
              <span className="truncate">Load More Work</span>
            </button>
          </div>

        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Spotlight;
