import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import {
  Ticket,
  Search,
  ArrowUpDown,
  User,
  Star,
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
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API_BASE = "http://localhost:5000/api";

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
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.id) {
          setUserId(decoded.id);
        } else {
          console.error("Invalid token payload:", decoded);
          localStorage.removeItem("token");
          toast.error("Session invalid. Please log in again.");
          navigate("/login");
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        localStorage.removeItem("token");
        toast.error("Session expired. Please log in again.");
        navigate("/login");
      }
    } else {
      toast.error("Please log in to view tickets.");
      navigate("/login", { state: { from: "/tickets" } });
    }
  }, [navigate]);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = {
          ...(statusFilter && { status: statusFilter }),
          ...(sortBy && { sortBy }),
          ...(sortOrder && { sortOrder }),
          ...(searchQuery && { search: searchQuery }),
        };

        const response = await axios.get(
          `${API_BASE}/users/${userId}/tickets`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            params,
          }
        );

        const fetchedTickets = response.data || [];
        setTickets(fetchedTickets);

        const sellerIds = [
          ...new Set(fetchedTickets.map((t) => t.sellerId._id)),
        ];
        const buyerIds = [...new Set(fetchedTickets.map((t) => t.buyerId._id))];
        const profilePromises = [
          ...sellerIds.map((id) =>
            axios.get(`${API_BASE}/users/${id}`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            })
          ),
          ...buyerIds.map((id) =>
            axios.get(`${API_BASE}/users/${id}`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            })
          ),
        ];

        const profileResponses = await Promise.all(profilePromises);
        const sellerProfilesData = {};
        const buyerProfilesData = {};
        profileResponses.forEach((res) => {
          const user = res.data;
          if (sellerIds.includes(user._id)) {
            sellerProfilesData[user._id] = user;
          }
          if (buyerIds.includes(user._id)) {
            buyerProfilesData[user._id] = user;
          }
        });

        setSellerProfiles(sellerProfilesData);
        setBuyerProfiles(buyerProfilesData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching tickets:", error);
        setError(error.response?.data?.error || "Failed to load tickets.");
        if (error.response?.status === 403 || error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
        setLoading(false);
      }
    };

    if (userId) {
      fetchTickets();
    }
  }, [userId, navigate, statusFilter, sortBy, sortOrder, searchQuery]);

  const handleSortToggle = () => {
    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
  };

  const getStatusColor = (status) => {
    const colors = {
      open: "bg-blue-100 text-blue-800 border-blue-200",
      negotiating: "bg-purple-100 text-purple-800 border-purple-200",
      accepted: "bg-green-100 text-green-800 border-green-200",
      paid: "bg-cyan-100 text-cyan-800 border-cyan-200",
      pending_completion: "bg-amber-100 text-amber-800 border-amber-200",
      completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
      closed: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
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
    return <Icon className="h-4 w-4" />;
  };

  // Stats Calculations
  const totalTickets = tickets.length;
  const activeTickets = tickets.filter((t) =>
    ["open", "negotiating", "accepted", "paid", "pending_completion"].includes(
      t.status
    )
  ).length;
  const completedTickets = tickets.filter(
    (t) => t.status === "completed"
  ).length;
  const closedTickets = tickets.filter((t) => t.status === "closed").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#1A2A4F] opacity-5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#1A2A4F] opacity-5 rounded-full blur-3xl -z-10"></div>

        <div className="max-w-7xl mx-auto px-6 py-12 flex-1">
          <div className="space-y-8">
            <div className="h-12 bg-gray-200 rounded-2xl w-1/4 animate-pulse"></div>
            <div className="flex gap-4 mb-8">
              <div className="h-12 bg-gray-200 rounded-xl w-full animate-pulse"></div>
              <div className="h-12 bg-gray-200 rounded-xl w-48 animate-pulse"></div>
              <div className="h-12 bg-gray-200 rounded-xl w-32 animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white border-2 border-gray-200 rounded-2xl p-6 space-y-4"
                >
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                  <div className="h-12 bg-gray-200 rounded-xl animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#1A2A4F] opacity-5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#1A2A4F] opacity-5 rounded-full blur-3xl -z-10"></div>

        <div className="max-w-7xl mx-auto px-6 py-12 flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-10 w-10 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Error Loading Tickets
            </h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[#1A2A4F] text-white rounded-xl hover:opacity-90 font-semibold transition-all"
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
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden">
      <Navbar />

      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#1A2A4F] opacity-5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#1A2A4F] opacity-5 rounded-full blur-3xl -z-10"></div>

      {/* Hero Section */}
      <div className="relative bg-[#1A2A4F] pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
            My Tickets
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            Manage your active and past gig engagements
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 flex-1">
        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by gig title or user name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-4 text-base border-2 border-gray-300 rounded-2xl bg-white focus:outline-none focus:border-[#1A2A4F] focus:ring-4 focus:ring-[#1A2A4F]/10 transition-all"
              />
            </div>
            <button
              onClick={() => navigate("/gigs")}
              className="hidden md:flex items-center gap-2 px-5 py-4 bg-gray-100 text-gray-700 rounded-2xl font-semibold hover:bg-gray-200 transition-all"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Gigs
            </button>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap gap-3 items-center">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-5 py-3 border-2 border-gray-300 rounded-xl bg-white font-semibold text-sm cursor-pointer hover:border-[#1A2A4F] focus:outline-none focus:border-[#1A2A4F] focus:ring-4 focus:ring-[#1A2A4F]/10 transition-all"
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="negotiating">Negotiating</option>
              <option value="accepted">Accepted</option>
              <option value="paid">Paid</option>
              <option value="pending_completion">Pending Completion</option>
              <option value="completed">Completed</option>
              <option value="closed">Closed</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-5 py-3 border-2 border-gray-300 rounded-xl bg-white font-semibold text-sm cursor-pointer hover:border-[#1A2A4F] focus:outline-none focus:border-[#1A2A4F] focus:ring-4 focus:ring-[#1A2A4F]/10 transition-all"
            >
              <option value="createdAt">Date Created</option>
              <option value="agreedPrice">Price</option>
            </select>
            <button
              onClick={handleSortToggle}
              className="flex items-center gap-2 px-5 py-3 bg-[#1A2A4F] text-white rounded-xl font-semibold hover:opacity-90 transition-all"
              title={`Sort ${
                sortOrder === "desc" ? "Ascending" : "Descending"
              }`}
            >
              <ArrowUpDown size={18} />
              <span className="hidden sm:inline">
                {sortOrder === "desc" ? "Newest" : "Oldest"}
              </span>
            </button>
          </div>
        </div>

        {/* Tickets Grid */}
        {tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border-2 border-dashed border-gray-300 rounded-2xl text-center">
            <Ticket className="w-20 h-20 text-gray-300 mb-6" />
            <h3 className="text-2xl font-bold text-gray-700 mb-3">
              No tickets found
            </h3>
            <p className="text-gray-500 mb-6 max-w-md">
              Start by browsing gigs and applying to opportunities that match
              your skills!
            </p>
            <button
              onClick={() => navigate("/gigs")}
              className="flex items-center gap-2 px-8 py-3 bg-[#1A2A4F] text-white rounded-xl font-semibold hover:opacity-90 transition-all"
            >
              Browse Gigs
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tickets.map((ticket) => (
              <div
                key={ticket._id}
                className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-[#1A2A4F] flex flex-col"
              >
                <div className="p-6 flex flex-col gap-4 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-xl font-bold text-[#1A2A4F] line-clamp-2 leading-tight flex-1">
                      {ticket.gigId.title}
                    </h3>
                    <Ticket className="h-6 w-6 text-[#1A2A4F] flex-shrink-0" />
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border-2 ${getStatusColor(
                        ticket.status
                      )}`}
                    >
                      {getStatusIcon(ticket.status)}{" "}
                      {ticket.status.replace("_", " ").toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-3 flex-1">
                    {/* Seller */}
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-[#1A2A4F] flex items-center justify-center text-white font-bold flex-shrink-0">
                        {sellerProfiles[ticket.sellerId._id]?.profilePicture ? (
                          <img
                            src={
                              sellerProfiles[ticket.sellerId._id].profilePicture
                            }
                            alt={ticket.sellerId.fullName}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          ticket.sellerId.fullName.charAt(0)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 font-semibold uppercase">
                          Seller
                        </p>
                        <button
                          onClick={() =>
                            navigate(`/users/${ticket.sellerId._id}`)
                          }
                          className="text-sm font-bold text-gray-900 hover:text-[#1A2A4F] transition-colors truncate block w-full text-left"
                        >
                          {ticket.sellerId.fullName}
                        </button>
                      </div>
                    </div>

                    {/* Buyer */}
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {buyerProfiles[ticket.buyerId._id]?.profilePicture ? (
                          <img
                            src={
                              buyerProfiles[ticket.buyerId._id].profilePicture
                            }
                            alt={ticket.buyerId.fullName}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          ticket.buyerId.fullName.charAt(0)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 font-semibold uppercase">
                          Buyer
                        </p>
                        <button
                          onClick={() =>
                            navigate(`/users/${ticket.buyerId._id}`)
                          }
                          className="text-sm font-bold text-gray-900 hover:text-[#1A2A4F] transition-colors truncate block w-full text-left"
                        >
                          {ticket.buyerId.fullName}
                        </button>
                      </div>
                    </div>
                  </div>

                  {ticket.agreedPrice && (
                    <div className="pt-3 border-t-2 border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 font-semibold uppercase">
                          Agreed Price
                        </span>
                        <span className="text-2xl font-bold text-[#1A2A4F]">
                          ₹{ticket.agreedPrice.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => navigate(`/tickets/${ticket._id}`)}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#1A2A4F] text-white rounded-xl font-semibold hover:opacity-90 transition-all mt-2"
                  >
                    View Ticket
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* === REDESIGNED STATS BAR - MOBILE FRIENDLY === */}
        {tickets.length > 0 && (
          <div className="mt-12">
            <div className="bg-[#1A2A4F] rounded-2xl p-6 md:p-8 relative overflow-hidden">
              {/* Background Blurs */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
              </div>

              {/* Title */}
              <h3 className="text-xl md:text-2xl font-black text-white mb-6 text-center md:text-left">
                Ticket Overview
              </h3>

              {/* Scrollable Stats on Mobile */}
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                <div className="flex gap-4 md:grid md:grid-cols-4 min-w-max md:min-w-0">
                  {/* Total */}
                  <div className="flex-shrink-0 w-40 md:w-auto bg-white/10 backdrop-blur-sm rounded-2xl p-5 text-center border border-white/20">
                    <div className="flex justify-center mb-2">
                      <div className="p-3 bg-white/20 rounded-full">
                        <Ticket className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="text-3xl md:text-4xl font-black text-white">
                      {totalTickets}
                    </div>
                    <div className="text-white/80 text-sm font-semibold mt-1">
                      Total Tickets
                    </div>
                  </div>

                  {/* Active */}
                  <div className="flex-shrink-0 w-40 md:w-auto bg-white/10 backdrop-blur-sm rounded-2xl p-5 text-center border border-white/20">
                    <div className="flex justify-center mb-2">
                      <div className="p-3 bg-emerald-400/30 rounded-full">
                        <Users className="h-6 w-6 text-emerald-300" />
                      </div>
                    </div>
                    <div className="text-3xl md:text-4xl font-black text-white">
                      {activeTickets}
                    </div>
                    <div className="text-white/80 text-sm font-semibold mt-1">
                      Active
                    </div>
                  </div>

                  {/* Completed */}
                  <div className="flex-shrink-0 w-40 md:w-auto bg-white/10 backdrop-blur-sm rounded-2xl p-5 text-center border border-white/20">
                    <div className="flex justify-center mb-2">
                      <div className="p-3 bg-green-400/30 rounded-full">
                        <CheckSquare className="h-6 w-6 text-green-300" />
                      </div>
                    </div>
                    <div className="text-3xl md:text-4xl font-black text-white">
                      {completedTickets}
                    </div>
                    <div className="text-white/80 text-sm font-semibold mt-1">
                      Completed
                    </div>
                  </div>

                  {/* Closed */}
                  <div className="flex-shrink-0 w-40 md:w-auto bg-white/10 backdrop-blur-sm rounded-2xl p-5 text-center border border-white/20">
                    <div className="flex justify-center mb-2">
                      <div className="p-3 bg-red-400/30 rounded-full">
                        <XCircle className="h-6 w-6 text-red-300" />
                      </div>
                    </div>
                    <div className="text-3xl md:text-4xl font-black text-white">
                      {closedTickets}
                    </div>
                    <div className="text-white/80 text-sm font-semibold mt-1">
                      Closed
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Tickets;
