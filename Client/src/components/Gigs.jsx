import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import { Briefcase, Search, Users, User } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API_BASE = "http://localhost:5000/api";

const Gigs = () => {
  const [gigs, setGigs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userApplications, setUserApplications] = useState([]);
  const [userId, setUserId] = useState(null);
  const [role, setRole] = useState(null);
  const [applicants, setApplicants] = useState({});
  const [isApplying, setIsApplying] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.id && decoded.role) {
          setUserId(decoded.id);
          setRole(decoded.role);
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
    }
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = { page, limit: 10 };
        if (selectedCategory) params.category = selectedCategory;
        if (searchTerm) params.search = searchTerm;

        const requests = [
          axios.get(`${API_BASE}/gigs`, { params }),
          axios.get(`${API_BASE}/categories`),
        ];

        if (userId) {
          requests.push(
            axios.get(`${API_BASE}/users/${userId}/applications`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            })
          );
        } else {
          requests.push(Promise.resolve({ data: [] }));
        }

        const [gigsResponse, categoriesResponse, applicationsResponse] =
          await Promise.all(requests);

        setGigs(gigsResponse.data.gigs || []);
        setTotalPages(gigsResponse.data.pages || 1);
        setCategories(categoriesResponse.data.categories || []);
        setUserApplications(
          applicationsResponse.data.map((app) => ({
            gigId: app.gigId._id,
            status: app.status,
            _id: app._id,
          })) || []
        );

        if (userId) {
          const applicantRequests = gigs
            .filter((gig) => gig.sellerId === userId)
            .map((gig) =>
              axios.get(`${API_BASE}/gigs/${gig._id}/applications`, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              })
            );
          const applicantResponses = await Promise.all(applicantRequests);
          const applicantsData = {};
          applicantResponses.forEach((response, index) => {
            const gigId = gigs.filter((gig) => gig.sellerId === userId)[index]
              ._id;
            applicantsData[gigId] = response.data;
          });
          setApplicants(applicantsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load gigs or categories.");
      }
    };

    fetchData();
  }, [page, selectedCategory, searchTerm, userId]);

  const handleApply = async (gigId) => {
    if (!userId) {
      toast.error("Please log in to apply for gigs.");
      navigate("/login", { state: { from: `/gigs/${gigId}` } });
      return;
    }

    setIsApplying((prev) => ({ ...prev, [gigId]: true }));
    try {
      const response = await axios.post(
        `${API_BASE}/gigs/${gigId}/apply`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      toast.success("Application submitted! Redirecting to ticket...");
      setUserApplications([
        ...userApplications,
        { gigId, status: "pending", _id: response.data.application._id },
      ]);
      navigate(`/tickets/${response.data.ticketId}`);
    } catch (error) {
      console.error("Error applying for gig:", error);
      const errorMsg =
        error.response?.data?.error || "Failed to apply for gig.";
      toast.error(errorMsg);
    } finally {
      setIsApplying((prev) => ({ ...prev, [gigId]: false }));
    }
  };

  const handleApplicationStatus = async (gigId, applicationId, status) => {
    try {
      const response = await axios.patch(
        `${API_BASE}/gigs/${gigId}/applications/${applicationId}`,
        { status },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      toast.success(`Application ${status}!`);
      setApplicants((prev) => ({
        ...prev,
        [gigId]: prev[gigId].map((app) =>
          app._id === applicationId ? { ...app, status } : app
        ),
      }));
      if (userId) {
        const applicationsResponse = await axios.get(
          `${API_BASE}/users/${userId}/applications`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setUserApplications(
          applicationsResponse.data.map((app) => ({
            gigId: app.gigId._id,
            status: app.status,
            _id: app._id,
          })) || []
        );
      }
    } catch (error) {
      console.error("Error updating application status:", error);
      toast.error(
        error.response?.data?.error || "Failed to update application."
      );
    }
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-[-5%] left-[-5%] w-1/3 h-1/3 bg-gradient-to-br from-[#1A2A4F] to-blue-800 opacity-15 filter blur-3xl transform rotate-12"
          style={{
            clipPath:
              "polygon(30% 0%, 70% 20%, 100% 60%, 70% 100%, 30% 80%, 0% 40%)",
          }}
        ></div>
        <div
          className="absolute bottom-[-10%] left-[-5%] w-1/4 h-1/4 bg-gradient-to-tr from-purple-600 to-[#1A2A4F] opacity-10 filter blur-3xl transform -rotate-6"
          style={{
            clipPath:
              "polygon(20% 0%, 80% 0%, 100% 50%, 80% 100%, 20% 100%, 0% 50%)",
          }}
        ></div>
        <div
          className="absolute top-1/2 left-1/4 w-1/4 h-1/4 bg-gradient-to-bl from-blue-800 to-purple-600 opacity-10 filter blur-3xl transform rotate-45"
          style={{
            clipPath:
              "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
          }}
        ></div>
      </div>
      <Navbar />
      <div className="relative flex-grow max-w-5xl mx-auto w-full mt-4 sm:mt-6 px-2 sm:px-4">
        {/* WhatsApp-like Header */}
        <div className="bg-[#075E54] text-white p-3 sm:p-4 flex items-center justify-between shadow-md sticky top-0 z-10 rounded-lg mb-4">
          <h1 className="text-base sm:text-lg font-semibold">Available Gigs</h1>
          {userId && (
            <button
              onClick={() => navigate("/tickets")}
              className="flex items-center gap-2 text-white hover:text-[#DCF8C6] text-sm sm:text-base"
            >
              <Users className="h-4 w-4 sm:h-5 sm:w-5" />
              My Tickets
            </button>
          )}
        </div>

        {/* Search and Category Filter */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search gigs..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-3 py-2 sm:py-2.5 text-xs sm:text-sm bg-white text-gray-800 border border-gray-300 rounded-full focus:ring-2 focus:ring-[#25D366] focus:border-transparent placeholder-gray-400"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="p-2 sm:p-2.5 text-xs sm:text-sm bg-white border border-gray-300 rounded-full focus:ring-2 focus:ring-[#25D366] focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Gigs Grid */}
        {gigs.length === 0 ? (
          <div className="flex items-center justify-center h-[50vh]">
            <p className="text-gray-500 text-sm sm:text-base">
              No gigs available at the moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {gigs.map((gig) => {
              const userApplication = userApplications.find(
                (app) => app.gigId === gig._id
              );
              const isClosed = gig.status !== "open";
              return (
                <div
                  key={gig._id}
                  className={`bg-white rounded-lg shadow-md hover:shadow-lg p-3 sm:p-4 border border-blue-100 hover:border-[#1A2A4F] transition-all duration-300 ${
                    isClosed ? "opacity-75" : ""
                  }`}
                >
                  {gig.thumbnail && (
                    <img
                      src={gig.thumbnail}
                      alt={gig.title}
                      className="w-full h-40 sm:h-48 object-cover rounded-md mb-3 sm:mb-4"
                      onError={(e) => {
                        console.error(
                          "Thumbnail failed to load:",
                          gig.thumbnail
                        );
                        e.target.src = "/default-thumbnail.jpg";
                      }}
                    />
                  )}
                  <h2 className="text-base sm:text-lg font-semibold text-[#1A2A4F]">
                    {gig.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#2A3A6F] mb-2 sm:mb-3 line-clamp-2">
                    {gig.description}
                  </p>
                  <p className="text-xs sm:text-sm text-[#2A3A6F]">
                    Category: {gig.category}
                  </p>
                  <p className="text-xs sm:text-sm text-[#2A3A6F]">
                    Price:{" "}
                    {gig.price.toLocaleString("en-IN", {
                      style: "currency",
                      currency: "INR",
                    })}
                  </p>
                  <p className="text-xs sm:text-sm text-[#2A3A6F]">
                    Seller: {gig.sellerName}
                  </p>
                  {isClosed && (
                    <p className="text-red-500 font-semibold text-xs sm:text-sm mt-2">
                      Gig Closed
                    </p>
                  )}
                  <div className="mt-3 sm:mt-4 flex flex-col gap-2">
                    {gig.sellerId === userId ? (
                      <div>
                        <button
                          onClick={() => navigate(`/gigs/${gig._id}`)}
                          className="text-[#25D366] hover:text-[#20C058] text-xs sm:text-sm"
                        >
                          View Applicants
                        </button>
                        {applicants[gig._id] &&
                        applicants[gig._id].length > 0 ? (
                          <div className="mt-2 sm:mt-3">
                            <h3 className="text-xs sm:text-sm font-semibold text-[#1A2A4F]">
                              Applicants:
                            </h3>
                            {applicants[gig._id].map((app) => (
                              <div key={app._id} className="border-t pt-2 mt-2">
                                <div className="flex items-center justify-between">
                                  <p className="text-xs sm:text-sm">
                                    {app.applicantName} -{" "}
                                    <span
                                      className={`${
                                        app.status === "pending"
                                          ? "text-yellow-500"
                                          : app.status === "accepted"
                                          ? "text-green-500"
                                          : "text-red-500"
                                      }`}
                                    >
                                      {app.status.charAt(0).toUpperCase() +
                                        app.status.slice(1)}
                                    </span>
                                  </p>
                                  <button
                                    onClick={() =>
                                      navigate(`/users/${app.applicantId}`)
                                    }
                                    className="text-[#25D366] hover:text-[#20C058] flex items-center text-xs sm:text-sm"
                                  >
                                    <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                    View Profile
                                  </button>
                                </div>
                                {app.status === "pending" && (
                                  <div className="flex gap-2 mt-2">
                                    <button
                                      onClick={() =>
                                        handleApplicationStatus(
                                          gig._id,
                                          app._id,
                                          "accepted"
                                        )
                                      }
                                      className="text-green-500 hover:text-green-600 text-xs sm:text-sm"
                                    >
                                      Accept
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleApplicationStatus(
                                          gig._id,
                                          app._id,
                                          "rejected"
                                        )
                                      }
                                      className="text-red-500 hover:text-red-600 text-xs sm:text-sm"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[#2A3A6F] text-xs sm:text-sm mt-2">
                            No applicants yet.
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <button
                          onClick={() => navigate(`/gigs/${gig._id}`)}
                          className="text-[#25D366] hover:text-[#20C058] text-xs sm:text-sm"
                        >
                          View Details
                        </button>
                        {userApplication ? (
                          <span
                            className={`font-semibold px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-full ${
                              userApplication.status === "pending"
                                ? "text-yellow-600 bg-yellow-100"
                                : userApplication.status === "accepted"
                                ? "text-green-600 bg-green-100"
                                : "text-red-600 bg-red-100"
                            }`}
                            title={
                              userApplication.status === "pending"
                                ? "Your application is pending review"
                                : userApplication.status === "accepted"
                                ? "Your application has been accepted"
                                : "Your application was rejected"
                            }
                          >
                            {userApplication.status.charAt(0).toUpperCase() +
                              userApplication.status.slice(1)}
                          </span>
                        ) : (
                          <button
                            onClick={() => handleApply(gig._id)}
                            className={`px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-full text-white ${
                              isClosed || isApplying[gig._id]
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-[#25D366] hover:bg-[#20C058]"
                            }`}
                            disabled={isClosed || isApplying[gig._id]}
                          >
                            {isApplying[gig._id] ? "Applying..." : "Apply"}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        <div className="mt-4 sm:mt-6 flex justify-center gap-2 sm:gap-3">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm bg-white border border-[#1A2A4F] rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#DCF8C6] text-[#1A2A4F]"
          >
            Previous
          </button>
          <span className="text-xs sm:text-sm text-[#1A2A4F]">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm bg-white border border-[#1A2A4F] rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#DCF8C6] text-[#1A2A4F]"
          >
            Next
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Gigs;
