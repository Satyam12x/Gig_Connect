import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import { Briefcase, Search, Users, User } from "lucide-react";

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
  const [isApplying, setIsApplying] = useState({}); // Track applying state per gig
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
      // Refresh user applications if the user is viewing their own applications
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
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Available Gigs</h1>
        {userId && (
          <button
            onClick={() => navigate("/tickets")}
            className="text-blue-500 hover:underline flex items-center"
          >
            <Users className="h-5 w-5 mr-2" />
            My Tickets
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search gigs..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {gigs.length === 0 ? (
        <p className="text-gray-500">No gigs available at the moment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gigs.map((gig) => {
            const userApplication = userApplications.find(
              (app) => app.gigId === gig._id
            );
            const isClosed = gig.status !== "open";
            return (
              <div
                key={gig._id}
                className={`border rounded-lg p-4 shadow-md hover:shadow-lg ${
                  isClosed ? "opacity-75 bg-gray-100" : ""
                }`}
              >
                {gig.thumbnail && (
                  <img
                    src={gig.thumbnail}
                    alt={gig.title}
                    className="w-full h-48 object-cover rounded-md mb-4"
                  />
                )}
                <h2 className="text-xl font-semibold">{gig.title}</h2>
                <p className="text-gray-600 mb-2">
                  {gig.description.substring(0, 100)}...
                </p>
                <p className="text-gray-500">Category: {gig.category}</p>
                <p className="text-gray-500">
                  Price:{" "}
                  {gig.price.toLocaleString("en-IN", {
                    style: "currency",
                    currency: "INR",
                  })}
                </p>
                <p className="text-gray-500">Seller: {gig.sellerName}</p>
                {isClosed && (
                  <p className="text-red-500 font-semibold mt-2">Gig Closed</p>
                )}
                <div className="mt-4">
                  {gig.sellerId === userId ? (
                    <div>
                      <button
                        onClick={() => navigate(`/gigs/${gig._id}`)}
                        className="text-blue-500 hover:underline mb-2"
                      >
                        View Applicants
                      </button>
                      {applicants[gig._id] && applicants[gig._id].length > 0 ? (
                        <div className="mt-2">
                          <h3 className="font-semibold">Applicants:</h3>
                          {applicants[gig._id].map((app) => (
                            <div key={app._id} className="border-t pt-2 mt-2">
                              <div className="flex items-center justify-between">
                                <p>
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
                                  className="text-blue-500 hover:underline flex items-center"
                                >
                                  <User className="h-4 w-4 mr-1" />
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
                                    className="text-green-500 hover:underline"
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
                                    className="text-red-500 hover:underline"
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No applicants yet.</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => navigate(`/gigs/${gig._id}`)}
                        className="text-blue-500 hover:underline"
                      >
                        View Details
                      </button>
                      {userApplication ? (
                        <span
                          className={`font-semibold px-4 py-2 rounded-md ${
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
                          className={`px-4 py-2 rounded-md ${
                            isClosed || isApplying[gig._id]
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-blue-500 hover:bg-blue-600"
                          } text-white`}
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

      <div className="mt-6 flex justify-center gap-2">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Gigs;
