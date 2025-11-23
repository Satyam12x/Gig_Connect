import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import {
  Ticket,
  Search,
  ArrowUpDown,
  ArrowLeft,
  Clock,
  DollarSign,
  ChevronRight,
  MessageSquare,
  TrendingUp,
  Package,
  CheckCircle,
  Shield,
  AlertCircle,
  Users,
  CheckSquare,
  XCircle,
} from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [sellerProfiles, setSellerProfiles] = useState({});
  const [buyerProfiles, setBuyerProfiles] = useState({});
  const navigate = useNavigate();

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
      toast.error("Session expired. Please log in again.");
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (!userId) return;

    const fetchTickets = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `${API_BASE}/users/${userId}/tickets`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            params: {
              status: statusFilter || undefined,
              sortBy,
              sortOrder,
              search: searchQuery || undefined,
            },
          }
        );

        const fetchedTickets = response.data || [];
        setTickets(fetchedTickets);

        // Extract unique IDs
        const sellerIds = [
          ...new Set(
            fetchedTickets.map((t) => t.sellerId?._id).filter(Boolean)
          ),
        ];
        const buyerIds = [
          ...new Set(fetchedTickets.map((t) => t.buyerId?._id).filter(Boolean)),
        ];

        // Fetch profiles in parallel
        const sellerPromises = sellerIds.map((id) =>
          axios.get(`${API_BASE}/users/${id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          })
        );
        const buyerPromises = buyerIds.map((id) =>
          axios.get(`${API_BASE}/users/${id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          })
        );

        const [sellerRes, buyerRes] = await Promise.all([
          Promise.allSettled(sellerPromises),
          Promise.allSettled(buyerPromises),
        ]);

        const sellerMap = {};
        const buyerMap = {};

        sellerRes.forEach((result, i) => {
          if (result.status === "fulfilled")
            sellerMap[sellerIds[i]] = result.value.data;
        });
        buyerRes.forEach((result, i) => {
          if (result.status === "fulfilled")
            buyerMap[buyerIds[i]] = result.value.data;
        });

        setSellerProfiles(sellerMap);
        setBuyerProfiles(buyerMap);
      } catch (err) {
        console.error("Failed to fetch tickets:", err);
        const msg = err.response?.data?.error || "Failed to load tickets";
        setError(msg);
        toast.error(msg);

        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [userId, statusFilter, sortBy, sortOrder, searchQuery, navigate]);

  const handleSortToggle = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  const getStatusStyle = (status) => {
    const styles = {
      open: "bg-blue-100 text-blue-800 border-blue-200",
      negotiating: "bg-purple-100 text-purple-800 border-purple-200",
      accepted: "bg-green-100 text-green-800 border-green-200",
      paid: "bg-cyan-100 text-cyan-800 border-cyan-200",
      pending_completion: "bg-amber-100 text-amber-800 border-amber-200",
      completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
      closed: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return styles[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusIcon = (status) => {
    const icons = {
      open: MessageSquare,
      negotiating: TrendingUp,
      accepted: CheckCircle,
      paid: DollarSign,
      pending_completion: Clock,
      completed: Package,
      closed: Shield,
    };
    const Icon = icons[status] || AlertCircle;
    return <Icon className="w-4 h-4" />;
  };

  // Stats
  const total = tickets.length;
  const active = tickets.filter((t) =>
    ["open", "negotiating", "accepted", "paid", "pending_completion"].includes(
      t.status
    )
  ).length;
  const completed = tickets.filter((t) => t.status === "completed").length;
  const closed = tickets.filter((t) => t.status === "closed").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-2xl font-bold text-[#1A2A4F]">
            Loading your tickets...
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-center px-6">
          <div>
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-12 h-12 text-red-600" />
            </div>
            <h2 className="text-3xl font-bold text-[#1A2A4F] mb-4">
              Error Loading Tickets
            </h2>
            <p className="text-gray-600 mb-8">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-4 bg-[#1A2A4F] text-white rounded-xl font-bold hover:bg-[#2A3A5F] transition-all"
            >
              Retry
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-[#1A2A4F] pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6">
            My Tickets
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Track all your gig applications and posted gigs in one place
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 -mt-10">
        {/* Filters */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-10 border border-[#1A2A4F]/10">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 relative">
              <Search
                className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
                size={22}
              />
              <input
                type="text"
                placeholder="Search by gig title, provider, or freelancer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-[#1A2A4F] focus:outline-none text-lg"
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-[#1A2A4F] focus:outline-none font-medium"
              >
                <option value="">All Status</option>
                <option value="open">Open</option>
                <option value="negotiating">Negotiating</option>
                <option value="accepted">Accepted</option>
                <option value="paid">Paid</option>
                <option value="pending_completion">Pending Completion</option>
                <option value="completed">Completed</option>
                <option value="closed">Closed</option>
              </select>

              <button
                onClick={handleSortToggle}
                className="px-6 py-4 bg-[#1A2A4F] text-white rounded-2xl font-bold hover:bg-[#2A3A5F] transition-all flex items-center gap-3"
              >
                <ArrowUpDown size={20} />
                {sortOrder === "desc" ? "Newest First" : "Oldest First"}
              </button>
            </div>
          </div>
        </div>

        {/* Tickets Grid */}
        {tickets.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl shadow-xl border-2 border-dashed border-gray-300">
            <Ticket className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-3xl font-bold text-[#1A2A4F] mb-4">
              No Tickets Yet
            </h3>
            <p className="text-xl text-gray-600 mb-8">
              Start applying to gigs or post your own!
            </p>
            <button
              onClick={() => navigate("/gigs")}
              className="px-10 py-5 bg-[#1A2A4F] text-white text-xl font-bold rounded-2xl hover:bg-[#2A3A5F] transition-all"
            >
              Browse Gigs
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {tickets.map((ticket) => {
              const seller =
                sellerProfiles[ticket.sellerId?._id] || ticket.sellerId;
              const buyer =
                buyerProfiles[ticket.buyerId?._id] || ticket.buyerId;

              const isCurrentUserSeller = ticket.sellerId?._id === userId;
              const roleLabel = isCurrentUserSeller
                ? "You posted this gig"
                : "You applied to this gig";

              return (
                <div
                  key={ticket._id}
                  className="bg-white rounded-3xl shadow-xl border border-[#1A2A4F]/10 overflow-hidden hover:shadow-2xl transition-all"
                >
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <h3 className="text-2xl font-bold text-[#1A2A4F] line-clamp-2 flex-1 pr-4">
                        {ticket.gigId?.title || "Untitled Gig"}
                      </h3>
                      <Ticket className="w-8 h-8 text-[#1A2A4F] flex-shrink-0" />
                    </div>

                    <div className="mb-6">
                      <span
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border ${getStatusStyle(
                          ticket.status
                        )}`}
                      >
                        {getStatusIcon(ticket.status)}
                        {ticket.status.replace(/_/g, " ").toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-6 mb-6">
                      {/* Provider (Seller) */}
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1A2A4F] to-[#2A3A5F] flex items-center justify-center text-white font-bold text-xl">
                          {seller?.profilePicture ? (
                            <img
                              src={seller.profilePicture}
                              alt=""
                              className="w-full h-full rounded-2xl object-cover"
                            />
                          ) : (
                            seller?.fullName?.[0] || "P"
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">
                            Provider
                          </p>
                          <p className="font-bold text-[#1A2A4F]">
                            {seller?.fullName || "Unknown"}
                          </p>
                        </div>
                        {isCurrentUserSeller && (
                          <span className="ml-auto bg-[#1A2A4F] text-white text-xs px-3 py-1 rounded-full font-bold">
                            YOU
                          </span>
                        )}
                      </div>

                      {/* Freelancer (Buyer) */}
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center text-white font-bold text-xl">
                          {buyer?.profilePicture ? (
                            <img
                              src={buyer.profilePicture}
                              alt=""
                              className="w-full h-full rounded-2xl object-cover"
                            />
                          ) : (
                            buyer?.fullName?.[0] || "F"
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">
                            Freelancer
                          </p>
                          <p className="font-bold text-[#1A2A4F]">
                            {buyer?.fullName || "Unknown"}
                          </p>
                        </div>
                        {!isCurrentUserSeller && (
                          <span className="ml-auto bg-purple-600 text-white text-xs px-3 py-1 rounded-full font-bold">
                            YOU
                          </span>
                        )}
                      </div>
                    </div>

                    {ticket.agreedPrice && (
                      <div className="pt-6 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-medium">
                            Agreed Price
                          </span>
                          <span className="text-3xl font-black text-[#1A2A4F]">
                            ₹{ticket.agreedPrice.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                      <p className="text-sm text-gray-500 italic mb-4">
                        {roleLabel}
                      </p>
                      <button
                        onClick={() => navigate(`/tickets/${ticket._id}`)}
                        className="w-full py-4 bg-[#1A2A4F] text-white font-bold rounded-2xl hover:bg-[#2A3A5F] transition-all flex items-center justify-center gap-3 text-lg"
                      >
                        Open Ticket <ChevronRight size={24} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Stats */}
        {tickets.length > 0 && (
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Total", value: total, icon: Ticket, color: "#1A2A4F" },
              { label: "Active", value: active, icon: Users, color: "#10b981" },
              {
                label: "Completed",
                value: completed,
                icon: CheckSquare,
                color: "#059669",
              },
              {
                label: "Closed",
                value: closed,
                icon: XCircle,
                color: "#ef4444",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-3xl shadow-xl p-8 text-center border border-[#1A2A4F]/10"
              >
                <div
                  className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}20` }}
                >
                  <stat.icon size={32} style={{ color: stat.color }} />
                </div>
                <div className="text-5xl font-black text-[#1A2A4F]">
                  {stat.value}
                </div>
                <p className="text-xl font-bold text-gray-700 mt-2">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Tickets;
