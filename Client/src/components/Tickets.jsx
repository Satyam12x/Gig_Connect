import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import {
  Ticket as TicketIcon,
  Search,
  Filter,
  ArrowUpDown,
  User,
  Star,
  Menu,
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
  const [isFilterOpen, setIsFilterOpen] = useState(false); // For mobile filter toggle
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 flex-1">
          <div className="animate-pulse space-y-6 max-w-4xl mx-auto">
            <div className="h-10 bg-gray-200 rounded w-1/4"></div>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="h-10 bg-gray-200 rounded w-full sm:w-48"></div>
              <div className="h-10 bg-gray-200 rounded w-full sm:w-32"></div>
              <div className="h-10 bg-gray-200 rounded w-full sm:w-32"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-lg p-6 space-y-4"
                >
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/4"></div>
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
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-red-600">
            <TicketIcon className="h-6 w-6" />
            <span>{error}</span>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
              style={{ backgroundColor: "#1E3A8A" }}
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
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <style>
        {`
          @keyframes fadeInUp {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up {
            animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          }
          @keyframes glow {
            0% { box-shadow: 0 0 5px rgba(30, 58, 138, 0.3); }
            50% { box-shadow: 0 0 15px rgba(30, 58, 138, 0.6), 0 0 25px rgba(30, 58, 138, 0.4); }
            100% { box-shadow: 0 0 5px rgba(30, 58, 138, 0.3); }
          }
          .card {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85));
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
          }
          .card:hover {
            transform: translateY(-6px) scale(1.02);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
            animation: glow 2s infinite;
          }
          .card::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .card:hover::before {
            left: 100%;
          }
          .progress-ring circle {
            transition: stroke-dashoffset 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .avatar-badge {
            position: absolute;
            bottom: 0;
            right: 0;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            border: 2px solid #fff;
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .avatar-container:hover .avatar-badge {
            transform: scale(1.2);
          }
          .ripple {
            position: relative;
            overflow: hidden;
          }
          .ripple::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1), height 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s;
            opacity: 0;
          }
          .ripple:active::after {
            width: 200px;
            height: 200px;
            opacity: 1;
            transition: 0s;
          }
          .hover-card {
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .hover-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
          }
          .filter-collapse {
            transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            max-height: 0;
            opacity: 0;
            overflow: hidden;
          }
          .filter-collapse.open {
            max-height: 300px;
            opacity: 1;
          }
        `}
      </style>
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 flex-1">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <h1
              className="text-3xl sm:text-4xl font-bold text-indigo-800 animate-fade-in-up"
              style={{ color: "#1E3A8A" }}
            >
              My Tickets
            </h1>
            <button
              onClick={() => navigate("/gigs")}
              className="mt-4 sm:mt-0 text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
              style={{ color: "#4B5EAA" }}
              aria-label="Back to gigs"
            >
              Back to Gigs
            </button>
          </div>

          {/* Filters and Search */}
          <div className="mb-6">
            <div className="flex items-center justify-between sm:hidden">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="p-2 bg-indigo-600 text-white rounded-lg"
                style={{ backgroundColor: "#1E3A8A" }}
                aria-label="Toggle filters"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
            <div
              className={`sm:flex flex-col sm:flex-row gap-4 filter-collapse ${
                isFilterOpen ? "open" : ""
              }`}
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by gig title or user name..."
                  className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-colors duration-200"
                  aria-label="Search tickets"
                />
              </div>
              <div className="flex gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-colors duration-200"
                  aria-label="Filter by status"
                >
                  <option value="">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="negotiating">Negotiating</option>
                  <option value="accepted">Accepted</option>
                  <option value="paid">Paid</option>
                  <option value="completed">Completed</option>
                  <option value="closed">Closed</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-colors duration-200"
                  aria-label="Sort by"
                >
                  <option value="createdAt">Date Created</option>
                  <option value="agreedPrice">Price</option>
                </select>
                <button
                  onClick={handleSortToggle}
                  className="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 ripple"
                  style={{ backgroundColor: "#1E3A8A" }}
                  aria-label={`Sort ${
                    sortOrder === "desc" ? "ascending" : "descending"
                  }`}
                >
                  <ArrowUpDown className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Tickets Grid */}
          {tickets.length === 0 ? (
            <div className="text-center py-12 animate-fade-in-up">
              <TicketIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4" style={{ color: "#4B5EAA" }}>
                No tickets found. Start by browsing gigs!
              </p>
              <button
                onClick={() => navigate("/gigs")}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 ripple"
                style={{ backgroundColor: "#1E3A8A" }}
                aria-label="Browse gigs"
              >
                Browse Gigs
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {tickets.map((ticket, index) => {
                const statusProgress = {
                  open: 20,
                  negotiating: 40,
                  accepted: 60,
                  paid: 80,
                  completed: 90,
                  closed: 100,
                }[ticket.status];
                const statusColor = {
                  open: "#F59E0B",
                  negotiating: "#F97316",
                  accepted: "#2563EB",
                  paid: "#6D28D9",
                  completed: "#16A34A",
                  closed: "#DC2626",
                }[ticket.status];
                return (
                  <div
                    key={ticket._id}
                    className="card rounded-xl p-6 relative animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div
                      className="absolute inset-0"
                      style={{
                        border: `2px solid ${statusColor}`,
                        borderRadius: "12px",
                        animation: `pulse 2s infinite`,
                      }}
                    ></div>
                    <h2
                      className="text-xl font-semibold text-indigo-800 flex items-center mb-4"
                      style={{ color: "#1E3A8A" }}
                    >
                      <TicketIcon className="h-5 w-5 mr-2" />
                      {ticket.gigId.title}
                    </h2>
                    <div className="flex justify-center mb-4">
                      <svg
                        className="progress-ring"
                        width="60"
                        height="60"
                        viewBox="0 0 60 60"
                      >
                        <circle
                          cx="30"
                          cy="30"
                          r="25"
                          stroke="#D1D5DB"
                          strokeWidth="5"
                          fill="none"
                        />
                        <circle
                          cx="30"
                          cy="30"
                          r="25"
                          stroke={statusColor}
                          strokeWidth="5"
                          fill="none"
                          strokeDasharray="157"
                          strokeDashoffset={157 - (157 * statusProgress) / 100}
                          style={{
                            transform: "rotate(-90deg)",
                            transformOrigin: "center",
                          }}
                        />
                        <text
                          x="30"
                          y="35"
                          textAnchor="middle"
                          className="text-sm font-semibold"
                          fill="#1E3A8A"
                        >
                          {statusProgress}%
                        </text>
                      </svg>
                    </div>
                    <p
                      className="text-gray-600 mb-2 flex items-center"
                      style={{ color: "#4B5EAA" }}
                    >
                      <span className="font-semibold">Status:</span>
                      <span
                        className="ml-2 capitalize"
                        style={{ color: statusColor }}
                      >
                        {ticket.status}
                      </span>
                    </p>
                    <div className="flex items-center mb-2">
                      <div className="relative avatar-container">
                        {sellerProfiles[ticket.sellerId._id]?.profilePicture ? (
                          <img
                            src={
                              sellerProfiles[ticket.sellerId._id].profilePicture
                            }
                            alt={ticket.sellerId.fullName}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-8 w-8 text-gray-400" />
                        )}
                        <div
                          className="avatar-badge"
                          style={{ backgroundColor: statusColor }}
                        ></div>
                      </div>
                      <p
                        className="text-gray-600 ml-2"
                        style={{ color: "#4B5EAA" }}
                      >
                        <span className="font-semibold">Seller:</span>{" "}
                        <button
                          onClick={() =>
                            navigate(`/users/${ticket.sellerId._id}`)
                          }
                          className="text-indigo-600 hover:underline relative group"
                          style={{ color: "#2563EB" }}
                          aria-label={`View ${ticket.sellerId.fullName}'s profile`}
                        >
                          {ticket.sellerId.fullName}
                          {sellerProfiles[ticket.sellerId._id] && (
                            <div className="absolute hidden group-hover:block bg-white shadow-lg rounded-lg p-4 w-64 z-10 hover-card">
                              <div className="flex items-center gap-2 mb-2">
                                {sellerProfiles[ticket.sellerId._id]
                                  .profilePicture && (
                                  <img
                                    src={
                                      sellerProfiles[ticket.sellerId._id]
                                        .profilePicture
                                    }
                                    alt={ticket.sellerId.fullName}
                                    className="h-10 w-10 rounded-full object-cover"
                                  />
                                )}
                                <div>
                                  <p className="font-semibold text-indigo-800">
                                    {
                                      sellerProfiles[ticket.sellerId._id]
                                        .fullName
                                    }
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {sellerProfiles[ticket.sellerId._id]
                                      .college || "No college provided"}
                                  </p>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {sellerProfiles[ticket.sellerId._id].bio ||
                                  "No bio provided"}
                              </p>
                              <div className="flex items-center gap-1 mt-2">
                                <Star
                                  className="h-4 w-4 text-yellow-400"
                                  fill="currentColor"
                                />
                                <span className="text-sm text-gray-600">
                                  {sellerProfiles[ticket.sellerId._id]
                                    .averageRating || 0}{" "}
                                  (
                                  {sellerProfiles[ticket.sellerId._id]
                                    .ratingsCount || 0}{" "}
                                  reviews)
                                </span>
                              </div>
                            </div>
                          )}
                        </button>
                      </p>
                    </div>
                    <div className="flex items-center mb-2">
                      <div className="relative avatar-container">
                        {buyerProfiles[ticket.buyerId._id]?.profilePicture ? (
                          <img
                            src={
                              buyerProfiles[ticket.buyerId._id].profilePicture
                            }
                            alt={ticket.buyerId.fullName}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-8 w-8 text-gray-400" />
                        )}
                        <div
                          className="avatar-badge"
                          style={{ backgroundColor: statusColor }}
                        ></div>
                      </div>
                      <p
                        className="text-gray-600 ml-2"
                        style={{ color: "#4B5EAA" }}
                      >
                        <span className="font-semibold">Buyer:</span>{" "}
                        <button
                          onClick={() =>
                            navigate(`/users/${ticket.buyerId._id}`)
                          }
                          className="text-indigo-600 hover:underline relative group"
                          style={{ color: "#2563EB" }}
                          aria-label={`View ${ticket.buyerId.fullName}'s profile`}
                        >
                          {ticket.buyerId.fullName}
                          {buyerProfiles[ticket.buyerId._id] && (
                            <div className="absolute hidden group-hover:block bg-white shadow-lg rounded-lg p-4 w-64 z-10 hover-card">
                              <div className="flex items-center gap-2 mb-2">
                                {buyerProfiles[ticket.buyerId._id]
                                  .profilePicture && (
                                  <img
                                    src={
                                      buyerProfiles[ticket.buyerId._id]
                                        .profilePicture
                                    }
                                    alt={ticket.buyerId.fullName}
                                    className="h-10 w-10 rounded-full object-cover"
                                  />
                                )}
                                <div>
                                  <p className="font-semibold text-indigo-800">
                                    {buyerProfiles[ticket.buyerId._id].fullName}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {buyerProfiles[ticket.buyerId._id]
                                      .college || "No college provided"}
                                  </p>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {buyerProfiles[ticket.buyerId._id].bio ||
                                  "No bio provided"}
                              </p>
                              <div className="flex items-center gap-1 mt-2">
                                <Star
                                  className="h-4 w-4 text-yellow-400"
                                  fill="currentColor"
                                />
                                <span className="text-sm text-gray-600">
                                  {buyerProfiles[ticket.buyerId._id]
                                    .averageRating || 0}{" "}
                                  (
                                  {buyerProfiles[ticket.buyerId._id]
                                    .ratingsCount || 0}{" "}
                                  reviews)
                                </span>
                              </div>
                            </div>
                          )}
                        </button>
                      </p>
                    </div>
                    {ticket.agreedPrice && (
                      <p
                        className="text-gray-600 mb-4"
                        style={{ color: "#4B5EAA" }}
                      >
                        <span className="font-semibold">Agreed Price:</span>{" "}
                        {ticket.agreedPrice.toLocaleString("en-IN", {
                          style: "currency",
                          currency: "INR",
                        })}
                      </p>
                    )}
                    <button
                      onClick={() => navigate(`/tickets/${ticket._id}`)}
                      className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 ripple"
                      style={{ backgroundColor: "#1E3A8A" }}
                      aria-label={`View ticket for ${ticket.gigId.title}`}
                    >
                      View Ticket
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Tickets;
