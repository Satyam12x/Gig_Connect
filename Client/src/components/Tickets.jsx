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

  // Stats
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
        <div className="max-w-7xl mx-auto px-6 py-12 flex-1">
          <div className="space-y-8">
            <div className="h-12 bg-gray-200 rounded-2xl w-1/4 animate-pulse"></div>
            <div className="flex gap-4 mb-8">
              <div className="h-12 bg-gray-200 rounded-xl w-full animate-pulse"></div>
              <div className="h-12 bg-gray-200 rounded-xl w-48 animate-pulse"></div>
              <div className="h-12 bg-gray-200 rounded-xl w-32 animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white border-2 border-gray-200 rounded-2xl p-6 space-y-4"
                >
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div>
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

      {/* Hero */}
      <div className="relative bg-[#1A2A4F] pt-32 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6">
            My Tickets
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Manage your active and past gig engagements
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 flex-1">
        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by gig title or user..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#1A2A4F] transition-all"
              />
            </div>
            <button
              onClick={() => navigate("/gigs")}
              className="sm:hidden flex items-center justify-center gap-2 px-5 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium focus:border-[#1A2A4F] focus:outline-none"
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="negotiating">Negotiating</option>
              <option value="accepted">Accepted</option>
              <option value="paid">Paid</option>
              <option value="pending_completion">Pending</option>
              <option value="completed">Completed</option>
              <option value="closed">Closed</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium focus:border-[#1A2A4F] focus:outline-none"
            >
              <option value="createdAt">Date</option>
              <option value="agreedPrice">Price</option>
            </select>

            <button
              onClick={handleSortToggle}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#1A2A4F] text-white rounded-lg text-sm font-medium hover:opacity-90"
            >
              <ArrowUpDown size={16} />
              <span className="hidden xs:inline">
                {sortOrder === "desc" ? "New" : "Old"}
              </span>
            </button>

            <button
              onClick={() => navigate("/gigs")}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Gigs
            </button>
          </div>
        </div>

        {/* Tickets Grid */}
        {tickets.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
            <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              No tickets yet
            </h3>
            <p className="text-gray-500 mb-6">Apply to gigs to get started!</p>
            <button
              onClick={() => navigate("/gigs")}
              className="px-6 py-2 bg-[#1A2A4F] text-white rounded-lg font-medium hover:opacity-90"
            >
              Browse Gigs
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tickets.map((ticket) => (
              <div
                key={ticket._id}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all hover:border-[#1A2A4F] flex flex-col"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-[#1A2A4F] text-lg line-clamp-2 flex-1 pr-2">
                    {ticket.gigId.title}
                  </h3>
                  <Ticket className="h-5 w-5 text-[#1A2A4F] flex-shrink-0" />
                </div>

                <div className="mb-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold border ${getStatusColor(
                      ticket.status
                    )}`}
                  >
                    {getStatusIcon(ticket.status)}
                    {ticket.status.replace("_", " ").toUpperCase()}
                  </span>
                </div>

                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#1A2A4F] flex items-center justify-center text-white text-xs font-bold">
                      {sellerProfiles[ticket.sellerId._id]?.profilePicture ? (
                        <img
                          src={
                            sellerProfiles[ticket.sellerId._id].profilePicture
                          }
                          alt=""
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        ticket.sellerId.fullName[0]
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500">Seller</p>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {ticket.sellerId.fullName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold">
                      {buyerProfiles[ticket.buyerId._id]?.profilePicture ? (
                        <img
                          src={buyerProfiles[ticket.buyerId._id].profilePicture}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        ticket.buyerId.fullName[0]
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500">Buyer</p>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {ticket.buyerId.fullName}
                      </p>
                    </div>
                  </div>
                </div>

                {ticket.agreedPrice && (
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Price</span>
                      <span className="font-bold text-[#1A2A4F]">
                        ₹{ticket.agreedPrice.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => navigate(`/tickets/${ticket._id}`)}
                  className="mt-4 w-full py-2.5 bg-[#1A2A4F] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
                >
                  View <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* === COMPACT, RESPONSIVE STATS BAR === */}
        {tickets.length > 0 && (
          <div className="mt-10 bg-gray-50 rounded-xl p-5 border border-gray-200">
            <h3 className="text-lg font-bold text-[#1A2A4F] mb-4">Overview</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex justify-center mb-1">
                  <Ticket className="h-5 w-5 text-[#1A2A4F]" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {totalTickets}
                </div>
                <div className="text-xs text-gray-600 mt-1">Total</div>
              </div>

              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex justify-center mb-1">
                  <Users className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {activeTickets}
                </div>
                <div className="text-xs text-gray-600 mt-1">Active</div>
              </div>

              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex justify-center mb-1">
                  <CheckSquare className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {completedTickets}
                </div>
                <div className="text-xs text-gray-600 mt-1">Completed</div>
              </div>

              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex justify-center mb-1">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {closedTickets}
                </div>
                <div className="text-xs text-gray-600 mt-1">Closed</div>
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
