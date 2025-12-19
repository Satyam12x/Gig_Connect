import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import moment from "moment";
import {
  Search,
  ArrowUpDown,
  Filter,
  MoreVertical,
  ExternalLink,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Package,
  Shield,
  Loader2,
  ChevronRight,
  Inbox
} from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { API_BASE } from "../constants/api";

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters & Sorting
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("desc"); // 'desc' = newest first
  
  // Profile Data
  const [sellerProfiles, setSellerProfiles] = useState({});
  const [buyerProfiles, setBuyerProfiles] = useState({});
  
  const navigate = useNavigate();

  // Authentication & Initial Load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to view your tickets.");
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setUserId(decoded.id);
    } catch (err) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [navigate]);

  // Fetch Tickets
  useEffect(() => {
    if (!userId) return;

    const fetchTickets = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user's tickets
        const response = await axios.get(
          `${API_BASE}/users/${userId}/tickets`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );

        const fetchedTickets = response.data || [];
        setTickets(fetchedTickets);

        // Extract unique IDs for bulk profile fetching
        const sellerIds = [...new Set(fetchedTickets.map((t) => t.sellerId?._id).filter(Boolean))];
        const buyerIds = [...new Set(fetchedTickets.map((t) => t.buyerId?._id).filter(Boolean))];

        // Fetch profiles
        const fetchProfiles = async (ids) => {
          const promises = ids.map(id => 
            axios.get(`${API_BASE}/users/${id}`, {
              headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            }).catch(() => null)
          );
          const results = await Promise.all(promises);
          return ids.reduce((acc, id, index) => {
            if (results[index]?.data) acc[id] = results[index].data;
            return acc;
          }, {});
        };

        const [sellers, buyers] = await Promise.all([
          fetchProfiles(sellerIds),
          fetchProfiles(buyerIds)
        ]);

        setSellerProfiles(sellers);
        setBuyerProfiles(buyers);

      } catch (err) {
        console.error("Failed to fetch tickets:", err);
        setError("Failed to load your tickets. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [userId, navigate]);

  // Filter & Sort Logic
  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      // Tab Filter
      if (activeTab === 'active') {
        if (['completed', 'closed'].includes(ticket.status)) return false;
      } else if (activeTab === 'completed') {
        if (!['completed', 'closed'].includes(ticket.status)) return false;
      }

      // Search Filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const title = ticket.gigId?.title?.toLowerCase() || "";
        const id = ticket._id.toLowerCase();
        return title.includes(query) || id.includes(query);
      }
      return true;
    }).sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [tickets, activeTab, searchQuery, sortOrder]);

  // Status Badge Component
  const StatusBadge = ({ status }) => {
    const styles = {
      open: "bg-blue-50 text-blue-700 border-blue-200",
      negotiating: "bg-purple-50 text-purple-700 border-purple-200",
      accepted: "bg-indigo-50 text-indigo-700 border-indigo-200",
      paid: "bg-cyan-50 text-cyan-700 border-cyan-200",
      pending_completion: "bg-amber-50 text-amber-700 border-amber-200",
      completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
      closed: "bg-gray-50 text-gray-600 border-gray-200",
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.closed} capitalize`}>
        {status.replace(/_/g, " ")}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 text-[#1A2A4F] animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Loading your tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#1A2A4F]">Support Tickets</h1>
            <p className="text-sm text-gray-500 mt-1">Manage all your ongoing projects and support requests</p>
          </div>
          
          <div className="flex items-center gap-3">
             <button
              onClick={() => navigate('/gigs')} 
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A2A4F] text-white rounded-lg text-sm font-semibold hover:bg-[#2A3A5F] transition-colors shadow-sm"
             >
               <ExternalLink size={16} />
               Browse Gigs
             </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-1 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
           {/* Tabs */}
           <div className="flex p-1 bg-gray-50 rounded-lg self-start sm:self-auto w-full sm:w-auto">
             {['all', 'active', 'completed'].map((tab) => (
               <button
                 key={tab}
                 onClick={() => setActiveTab(tab)}
                 className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                   activeTab === tab 
                     ? "bg-white text-[#1A2A4F] shadow-sm ring-1 ring-black/5" 
                     : "text-gray-500 hover:text-gray-700"
                 } capitalize`}
               >
                 {tab}
               </button>
             ))}
           </div>

           {/* Search & Sort */}
           <div className="flex items-center gap-3 w-full sm:w-auto px-2 pb-2 sm:pb-0">
             <div className="relative flex-1 sm:w-64">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
               <input
                 type="text"
                 placeholder="Search tickets..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full pl-9 pr-4 py-1.5 text-sm border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1A2A4F]/20 focus:border-[#1A2A4F] transition-all"
               />
             </div>
             <button 
               onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
               className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
               title={`Sort by date: ${sortOrder === 'desc' ? 'Newest' : 'Oldest'}`}
             >
               <ArrowUpDown size={16} />
             </button>
           </div>
        </div>

        {/* Tickets Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {filteredTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Inbox className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No tickets found</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                {searchQuery 
                  ? "Try adjusting your search terms or filters" 
                  : activeTab === 'all' 
                    ? "You haven't applied to any gigs or created any tickets yet." 
                    : `You have no ${activeTab} tickets at the moment.`}
              </p>
              {activeTab === 'all' && !searchQuery && (
                <button
                  onClick={() => navigate('/gigs')}
                  className="mt-6 px-6 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Start Exploring
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                    <th className="px-6 py-4">Ticket / Gig</th>
                    <th className="px-6 py-4">Counterparty</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                    <th className="px-6 py-4">Last Activity</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTickets.map((ticket) => {
                    // Determine Counterparty (The person who IS NOT the current user)
                    const isCurrentUserSeller = ticket.sellerId?._id === userId;
                    const counterpartId = isCurrentUserSeller ? ticket.buyerId?._id : ticket.sellerId?._id;
                    const counterpartProfile = isCurrentUserSeller ? buyerProfiles[counterpartId] : sellerProfiles[counterpartId];
                    const counterpartName = counterpartProfile?.fullName || (isCurrentUserSeller ? ticket.buyerId?.fullName : ticket.sellerId?.fullName) || "Unknown User";
                    const counterpartAvatar = counterpartProfile?.profilePicture;
                    const counterpartInitial = counterpartName.charAt(0);
                    const counterpartRole = isCurrentUserSeller ? "Freelancer" : "Provider";

                    return (
                      <tr 
                        key={ticket._id} 
                        onClick={() => navigate(`/tickets/${ticket._id}`)}
                        className="group hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#1A2A4F]/5 flex items-center justify-center flex-shrink-0 text-[#1A2A4F]">
                              <Package size={20} />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 truncate max-w-[200px]" title={ticket.gigId?.title}>
                                {ticket.gigId?.title || "Untitled Project"}
                              </p>
                              <p className="text-xs text-gray-500 font-mono mt-0.5">#{ticket._id.slice(-6).toUpperCase()}</p>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                             <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm flex-shrink-0
                               ${isCurrentUserSeller ? 'bg-purple-600' : 'bg-[#1A2A4F]'}`}>
                               {counterpartAvatar ? (
                                 <img src={counterpartAvatar} alt="" className="w-full h-full rounded-full object-cover" />
                               ) : (
                                 counterpartInitial
                               )}
                             </div>
                             <div>
                               <p className="text-sm font-medium text-gray-900">{counterpartName}</p>
                               <p className="text-xs text-gray-500">{counterpartRole}</p>
                             </div>
                           </div>
                        </td>

                        <td className="px-6 py-4">
                          <StatusBadge status={ticket.status} />
                        </td>

                        <td className="px-6 py-4 text-right">
                          {ticket.agreedPrice ? (
                            <span className="font-mono font-medium text-gray-900">
                              ₹{ticket.agreedPrice.toLocaleString('en-IN')}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Pending</span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            <Clock size={14} />
                            <span>{moment(ticket.updatedAt).fromNow()}</span>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button 
                            className="p-2 text-gray-400 hover:text-[#1A2A4F] hover:bg-gray-100 rounded-lg transition-all"
                            title="Open Ticket"
                          >
                            <ChevronRight size={20} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Footer of Table */}
          {filteredTickets.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
               <span>Showing {filteredTickets.length} ticket(s)</span>
               <span>Updates in real-time</span>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Tickets;
