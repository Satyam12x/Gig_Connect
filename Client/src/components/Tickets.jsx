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

        // Fetch seller and buyer profiles for hover previews
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
          <div className="animate-pulse space-y-6 max-w-4xl mx-auto">
            <div className="h-10 bg-gray-200 rounded w-1/4"></div>
            <div className="flex gap-4 mb-6">
              <div className="h-10 bg-gray-200 rounded w-48"></div>
              <div className="h-10 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-lg p-6 space-y-4"
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 flex items-center justify-center">
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
          @keyframes fadeIn {
            0% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fadeIn 0.5s ease-out forwards;
          }
          @keyframes slideIn {
            0% { opacity: 0; transform: translateX(20px); }
            100% { opacity: 1; transform: translateX(0); }
          }
          .animate-slide-in {
            animation: slideIn 0.5s ease-out forwards;
          }
          .hover-card {
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }
          .hover-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
          }
          .progress-bar {
            height: 6px;
            background-color: #D1D5DB;
            border-radius: 3px;
            overflow: hidden;
          }
          .progress-bar-fill {
            height: 100%;
            transition: width 0.3s ease;
          }
        `}
      </style>
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <h1
              className="text-3xl sm:text-4xl font-bold text-indigo-800 animate-fade-in"
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
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by gig title or user name..."
                className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                aria-label="Search tickets"
              />
            </div>
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
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
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                aria-label="Sort by"
              >
                <option value="createdAt">Date Created</option>
                <option value="agreedPrice">Price</option>
              </select>
              <button
                onClick={handleSortToggle}
                className="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                style={{ backgroundColor: "#1E3A8A" }}
                aria-label={`Sort ${
                  sortOrder === "desc" ? "ascending" : "descending"
                }`}
              >
                <ArrowUpDown className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Tickets Grid */}
          {tickets.length === 0 ? (
            <div className="text-center py-12 animate-fade-in">
              <TicketIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4" style={{ color: "#4B5EAA" }}>
                No tickets found. Start by browsing gigs!
              </p>
              <button
                onClick={() => navigate("/gigs")}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
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
                return (
                  <div
                    key={ticket._id}
                    className="bg-white rounded-lg shadow-lg p-6 hover-card animate-slide-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <h2
                      className="text-xl font-semibold text-indigo-800 flex items-center mb-2"
                      style={{ color: "#1E3A8A" }}
                    >
                      <TicketIcon className="h-5 w-5 mr-2" />
                      {ticket.gigId.title}
                    </h2>
                    <div className="progress-bar mb-4">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${statusProgress}%`,
                          backgroundColor: "#1E3A8A",
                        }}
                      ></div>
                    </div>
                    <p
                      className="text-gray-600 mb-2"
                      style={{ color: "#4B5EAA" }}
                    >
                      <span className="font-semibold">Status:</span>{" "}
                      <span
                        className={`capitalize ${
                          ticket.status === "open"
                            ? "text-yellow-600"
                            : ticket.status === "negotiating"
                            ? "text-orange-600"
                            : ticket.status === "accepted"
                            ? "text-blue-600"
                            : ticket.status === "paid"
                            ? "text-purple-600"
                            : ticket.status === "completed"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {ticket.status}
                      </span>
                    </p>
                    <p
                      className="text-gray-600 mb-2"
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
                          <div className="absolute hidden group-hover:block bg-white shadow-lg rounded-lg p-4 w-64 z-10">
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
                                  {sellerProfiles[ticket.sellerId._id].fullName}
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
                    <p
                      className="text-gray-600 mb-2"
                      style={{ color: "#4B5EAA" }}
                    >
                      <span className="font-semibold">Buyer:</span>{" "}
                      <button
                        onClick={() => navigate(`/users/${ticket.buyerId._id}`)}
                        className="text-indigo-600 hover:underline relative group"
                        style={{ color: "#2563EB" }}
                        aria-label={`View ${ticket.buyerId.fullName}'s profile`}
                      >
                        {ticket.buyerId.fullName}
                        {buyerProfiles[ticket.buyerId._id] && (
                          <div className="absolute hidden group-hover:block bg-white shadow-lg rounded-lg p-4 w-64 z-10">
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
                                  {buyerProfiles[ticket.buyerId._id].college ||
                                    "No college provided"}
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
                      className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
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
