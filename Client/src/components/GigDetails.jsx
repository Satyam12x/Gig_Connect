import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import { Briefcase, Users, User, Loader2, AlertTriangle } from "lucide-react";

const API_BASE = "http://localhost:5000/api";

const GigDetails = () => {
  const { id } = useParams();
  const [gig, setGig] = useState(null);
  const [userApplications, setUserApplications] = useState([]);
  const [userId, setUserId] = useState(null);
  const [role, setRole] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false); // Loading state for apply button
  const [error, setError] = useState(null);
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
        setLoading(true);
        setError(null);

        // Fetch gig details
        const gigResponse = await axios.get(`${API_BASE}/gigs/${id}`);
        const fetchedGig = gigResponse.data || null;
        setGig(fetchedGig);

        // Prepare requests for applications and applicants
        const requests = [];
        if (userId) {
          requests.push(
            axios.get(`${API_BASE}/users/${userId}/applications`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            })
          );
          if (fetchedGig && fetchedGig.sellerId === userId) {
            requests.push(
              axios.get(`${API_BASE}/gigs/${id}/applications`, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              })
            );
          } else {
            requests.push(Promise.resolve({ data: [] }));
          }
        } else {
          requests.push(
            Promise.resolve({ data: [] }),
            Promise.resolve({ data: [] })
          );
        }

        const [applicationsResponse, applicantsResponse] = await Promise.all(
          requests
        );

        setUserApplications(
          applicationsResponse.data.map((app) => ({
            gigId: app.gigId._id,
            status: app.status,
            _id: app._id,
          })) || []
        );
        setApplicants(applicantsResponse.data || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.response?.data?.error || "Failed to load gig details.");
        setLoading(false);
      }
    };

    fetchData();
  }, [id, userId]); // Removed 'gig' from dependencies

  const handleApply = async () => {
    if (!userId) {
      toast.error("Please log in to apply for gigs.");
      navigate("/login", { state: { from: `/gigs/${id}` } });
      return;
    }

    setIsApplying(true);
    try {
      const response = await axios.post(
        `${API_BASE}/gigs/${id}/apply`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      toast.success("Application submitted! Redirecting to ticket...");
      setUserApplications([
        ...userApplications,
        { gigId: id, status: "pending", _id: response.data.application._id },
      ]);
      navigate(`/tickets/${response.data.ticketId}`);
    } catch (error) {
      console.error("Error applying for gig:", error);
      const errorMsg =
        error.response?.data?.error || "Failed to apply for gig.";
      toast.error(errorMsg);
    } finally {
      setIsApplying(false);
    }
  };

  const handleApplicationStatus = async (applicationId, status) => {
    try {
      const response = await axios.patch(
        `${API_BASE}/gigs/${id}/applications/${applicationId}`,
        { status },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      toast.success(`Application ${status}!`);
      setApplicants((prev) =>
        prev.map((app) =>
          app._id === applicationId ? { ...app, status } : app
        )
      );
      // Refresh user applications to reflect status changes
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

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // Trigger useEffect to refetch data
    const fetchData = async () => {
      try {
        const gigResponse = await axios.get(`${API_BASE}/gigs/${id}`);
        const fetchedGig = gigResponse.data || null;
        setGig(fetchedGig);

        const requests = [];
        if (userId) {
          requests.push(
            axios.get(`${API_BASE}/users/${userId}/applications`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            })
          );
          if (fetchedGig && fetchedGig.sellerId === userId) {
            requests.push(
              axios.get(`${API_BASE}/gigs/${id}/applications`, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              })
            );
          } else {
            requests.push(Promise.resolve({ data: [] }));
          }
        } else {
          requests.push(
            Promise.resolve({ data: [] }),
            Promise.resolve({ data: [] })
          );
        }

        const [applicationsResponse, applicantsResponse] = await Promise.all(
          requests
        );

        setUserApplications(
          applicationsResponse.data.map((app) => ({
            gigId: app.gigId._id,
            status: app.status,
            _id: app._id,
          })) || []
        );
        setApplicants(applicantsResponse.data || []);
        setLoading(false);
      } catch (error) {
        console.error("Error retrying fetch:", error);
        setError(error.response?.data?.error || "Failed to load gig details.");
        setLoading(false);
      }
    };
    fetchData();
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4 text-red-500">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6" />
            <span>{error}</span>
          </div>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2 text-gray-500">
          <AlertTriangle className="h-6 w-6" />
          <span>Gig not found.</span>
        </div>
      </div>
    );
  }

  const userApplication = userApplications.find((app) => app.gigId === id);
  const hasApplied = !!userApplication;
  const isClosed = gig.status === "closed";

  return (
    <div
      className="container mx-auto p-4 min-h-screen font-sans"
      style={{ color: "#2A3A6F" }}
    >
      <div className="flex justify-between items-center mb-6">
        <h1
          className="text-3xl font-bold text-navyBlue"
          style={{ color: "#1A2A4F" }}
        >
          {gig.title}
        </h1>
        {userId && (
          <button
            onClick={() => navigate("/tickets")}
            className="text-blue-500 hover:underline flex items-center"
            style={{ color: "#2563EB" }}
          >
            <Users className="h-5 w-5 mr-2" />
            My Tickets
          </button>
        )}
      </div>
      <div
        className={`border rounded-lg p-6 shadow-md bg-white bg-opacity-70 backdrop-blur-lg ${
          isClosed ? "opacity-75 bg-gray-100" : ""
        }`}
        style={{
          borderColor: "#E5E7EB",
          clipPath:
            "polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)",
        }}
      >
        {gig.thumbnail && (
          <img
            src={gig.thumbnail}
            alt={gig.title}
            className="w-full h-64 object-cover rounded-md mb-4"
          />
        )}
        <p className="text-navyBlueMedium mb-4" style={{ color: "#2A3A6F" }}>
          {gig.description}
        </p>
        <p className="text-navyBlueMedium mb-2" style={{ color: "#2A3A6F" }}>
          Category: {gig.category}
        </p>
        <p className="text-navyBlueMedium mb-2" style={{ color: "#2A3A6F" }}>
          Price:{" "}
          {gig.price.toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
          })}
        </p>
        <p className="text-navyBlueMedium mb-2" style={{ color: "#2A3A6F" }}>
          Seller: {gig.sellerName}
        </p>
        <p
          className={`text-navyBlueMedium mb-4 font-semibold ${
            isClosed ? "text-red-600" : ""
          }`}
          style={{ color: isClosed ? "#DC2626" : "#2A3A6F" }}
        >
          Status: {gig.status.charAt(0).toUpperCase() + gig.status.slice(1)}
        </p>
        {gig.sellerId === userId ? (
          <div>
            <h2
              className="text-xl font-semibold mb-4 text-navyBlue"
              style={{ color: "#1A2A4F" }}
            >
              Applicants
            </h2>
            {applicants.length > 0 ? (
              <div className="space-y-4">
                {applicants.map((app) => (
                  <div key={app._id} className="border-t pt-2">
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-navyBlueMedium ${
                          app.status === "pending"
                            ? "text-yellow-600"
                            : app.status === "accepted"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {app.applicantName} -{" "}
                        {app.status.charAt(0).toUpperCase() +
                          app.status.slice(1)}
                      </p>
                      <button
                        onClick={() =>
                          navigate(
                            `/users/${app.applicantId._id || app.applicantId}`
                          )
                        }
                        className="text-blue-500 hover:underline flex items-center"
                        style={{ color: "#2563EB" }}
                      >
                        <User className="h-4 w-4 mr-1" />
                        View Profile
                      </button>
                    </div>
                    {app.status === "pending" && (
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() =>
                            handleApplicationStatus(app._id, "accepted")
                          }
                          className="text-green-500 hover:underline"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() =>
                            handleApplicationStatus(app._id, "rejected")
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
              <p className="text-navyBlueMedium" style={{ color: "#2A3A6F" }}>
                No applicants yet.
              </p>
            )}
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate("/gigs")}
              className="text-blue-500 hover:underline"
              style={{ color: "#2563EB" }}
            >
              Back to Gigs
            </button>
            {hasApplied ? (
              <span
                className={`px-4 py-2 font-semibold rounded-md ${
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
                Application{" "}
                {userApplication.status.charAt(0).toUpperCase() +
                  userApplication.status.slice(1)}
              </span>
            ) : (
              <button
                onClick={handleApply}
                className={`px-4 py-2 rounded-md font-semibold ${
                  isClosed || hasApplied || isApplying
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-navyBlue text-white hover:bg-navyBlueLight"
                }`}
                style={{
                  backgroundColor:
                    isClosed || hasApplied || isApplying
                      ? "#D1D5DB"
                      : "#1A2A4F",
                  color:
                    isClosed || hasApplied || isApplying
                      ? "#4B5563"
                      : "#FFFFFF",
                }}
                disabled={isClosed || hasApplied || isApplying}
              >
                {isApplying
                  ? "Applying..."
                  : isClosed
                  ? "Applications Closed"
                  : "Apply"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GigDetails;
