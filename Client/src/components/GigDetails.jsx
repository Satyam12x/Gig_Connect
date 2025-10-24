import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import { Briefcase } from "lucide-react";

const API_BASE = "http://localhost:5000/api";

const GigDetails = () => {
  const { id } = useParams();
  const [gig, setGig] = useState(null);
  const [userApplications, setUserApplications] = useState([]);
  const [userId, setUserId] = useState(null);
  const [role, setRole] = useState(null);
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
        const requests = [axios.get(`${API_BASE}/gigs/${id}`)];

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

        const [gigResponse, applicationsResponse] = await Promise.all(requests);

        setGig(gigResponse.data || null);
        setUserApplications(applicationsResponse.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load gig details.");
      }
    };

    fetchData();
  }, [id, userId]);

  const handleApply = async () => {
    if (!userId) {
      toast.error("Please log in to apply for gigs.");
      navigate("/login", { state: { from: `/gigs/${id}` } });
      return;
    }

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
        { gigId: id, status: "pending" },
      ]);
      navigate(`/tickets/${response.data.ticketId}`);
    } catch (error) {
      console.error("Error applying for gig:", error);
      const errorMsg =
        error.response?.data?.error || "Failed to apply for gig.";
      toast.error(errorMsg);
    }
  };

  if (!gig) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">{gig.title}</h1>
      <div className="border rounded-lg p-6 shadow-md">
        {gig.thumbnail && (
          <img
            src={gig.thumbnail}
            alt={gig.title}
            className="w-full h-64 object-cover rounded-md mb-4"
          />
        )}
        <p className="text-gray-600 mb-4">{gig.description}</p>
        <p className="text-gray-500 mb-2">Category: {gig.category}</p>
        <p className="text-gray-500 mb-2">Price: ${gig.price}</p>
        <p className="text-gray-500 mb-2">Seller: {gig.sellerName}</p>
        <p className="text-gray-500 mb-4">Status: {gig.status}</p>
        <div className="flex justify-between">
          <button
            onClick={() => navigate("/gigs")}
            className="text-blue-500 hover:underline"
          >
            Back to Gigs
          </button>
          {userApplications.some((app) => app.gigId === id) ? (
            <span className="text-green-500">Applied</span>
          ) : (
            <button
              onClick={handleApply}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              disabled={gig.status !== "open"}
            >
              Apply
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GigDetails;
