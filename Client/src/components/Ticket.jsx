import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { jwtDecode } from "jwt-decode";
import {
  MessageCircle,
  DollarSign,
  XCircle,
  User,
  CheckCircle,
} from "lucide-react";

const API_BASE = "http://localhost:5000/api";

const Ticket = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [userId, setUserId] = useState(null);
  const [message, setMessage] = useState("");
  const [agreedPrice, setAgreedPrice] = useState("");
  const [loading, setLoading] = useState(true);

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
      navigate("/login", { state: { from: `/tickets/${id}` } });
    }
  }, [navigate]);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await axios.get(`${API_BASE}/tickets/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        console.log("Fetched ticket:", response.data);
        setTicket(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching ticket:", error);
        toast.error(error.response?.data?.error || "Failed to load ticket.");
        if (error.response?.status === 403 || error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
        setLoading(false);
      }
    };

    if (userId) {
      fetchTicket();
    }
  }, [id, userId, navigate]);

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.error("Message cannot be empty.");
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE}/tickets/${id}/messages`,
        { content: message },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setTicket(response.data.ticket);
      setMessage("");
      toast.success("Message sent!");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error.response?.data?.error || "Failed to send message.");
    }
  };

  const handleSetPrice = async () => {
    if (!agreedPrice || isNaN(agreedPrice) || agreedPrice <= 0) {
      toast.error("Please enter a valid price.");
      return;
    }

    try {
      const response = await axios.patch(
        `${API_BASE}/tickets/${id}/price`,
        { agreedPrice: parseFloat(agreedPrice) },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setTicket(response.data.ticket);
      setAgreedPrice("");
      toast.success("Price proposed!");
    } catch (error) {
      console.error("Error setting price:", error);
      toast.error(error.response?.data?.error || "Failed to set price.");
    }
  };

  const handleAcceptPrice = async () => {
    try {
      const response = await axios.patch(
        `${API_BASE}/tickets/${id}/accept-price`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setTicket(response.data.ticket);
      toast.success("Price accepted! Please confirm payment.");
    } catch (error) {
      console.error("Error accepting price:", error);
      toast.error(error.response?.data?.error || "Failed to accept price.");
    }
  };

  const handleNegotiatePrice = async () => {
    if (!message.trim()) {
      toast.error("Please enter a negotiation message.");
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE}/tickets/${id}/messages`,
        { content: `Negotiation: ${message}` },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setTicket(response.data.ticket);
      setMessage("");
      toast.success("Negotiation message sent!");
    } catch (error) {
      console.error("Error sending negotiation:", error);
      toast.error(error.response?.data?.error || "Failed to send negotiation.");
    }
  };

  const handleConfirmPayment = async () => {
    try {
      const response = await axios.patch(
        `${API_BASE}/tickets/${id}/pay`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setTicket(response.data.ticket);
      toast.success("Payment confirmed! Gig applications closed.");
    } catch (error) {
      console.error("Error confirming payment:", error);
      toast.error(error.response?.data?.error || "Failed to confirm payment.");
    }
  };

  const handleMarkCompleted = async () => {
    try {
      const response = await axios.patch(
        `${API_BASE}/tickets/${id}/complete`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setTicket(response.data.ticket);
      toast.success("Work marked as completed! Awaiting seller confirmation.");
    } catch (error) {
      console.error("Error marking work completed:", error);
      toast.error(
        error.response?.data?.error || "Failed to mark work completed."
      );
    }
  };

  const handleConfirmCompletion = async () => {
    try {
      const response = await axios.patch(
        `${API_BASE}/tickets/${id}/confirm-completion`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setTicket(response.data.ticket);
      toast.success("Completion confirmed! Credits awarded to buyer.");
    } catch (error) {
      console.error("Error confirming completion:", error);
      toast.error(
        error.response?.data?.error || "Failed to confirm completion."
      );
    }
  };

  const handleCloseTicket = async () => {
    try {
      const response = await axios.patch(
        `${API_BASE}/tickets/${id}/close`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setTicket(response.data.ticket);
      toast.success("Ticket closed!");
    } catch (error) {
      console.error("Error closing ticket:", error);
      toast.error(error.response?.data?.error || "Failed to close ticket.");
    }
  };

  if (loading) {
    return <div className="text-center text-gray-600 py-10">Loading...</div>;
  }

  if (!ticket) {
    return (
      <div className="text-center text-red-600 py-10">
        Failed to load ticket.
      </div>
    );
  }

  const isBuyer = userId === ticket.buyerId?._id;
  const isSeller = userId === ticket.sellerId?._id;
  const profileUser = isBuyer ? ticket.sellerId : ticket.buyerId;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <ToastContainer />
      <div className="flex flex-col items-center mb-6">
        {profileUser?.profilePicture && (
          <img
            src={profileUser.profilePicture}
            alt={profileUser.fullName}
            className="w-24 h-24 rounded-full object-cover mb-4"
          />
        )}
        <h1 className="text-3xl font-bold text-center text-gray-800">
          Ticket for {ticket.gigId.title}
        </h1>
      </div>
      <div className="border border-gray-200 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-gray-600 flex items-center">
              Seller: {ticket.sellerId.fullName}
              <button
                onClick={() => {
                  console.log(
                    "Navigating to seller profile:",
                    ticket.sellerId._id
                  );
                  navigate(`/users/${ticket.sellerId._id}`);
                }}
                className="ml-2 text-blue-500 hover:text-blue-700 flex items-center"
              >
                <User className="h-4 w-4 mr-1" />
                View Profile
              </button>
            </p>
            <p className="text-gray-600 flex items-center">
              Buyer: {ticket.buyerId.fullName}
              <button
                onClick={() => {
                  console.log(
                    "Navigating to buyer profile:",
                    ticket.buyerId._id
                  );
                  navigate(`/users/${ticket.buyerId._id}`);
                }}
                className="ml-2 text-blue-500 hover:text-blue-700 flex items-center"
              >
                <User className="h-4 w-4 mr-1" />
                View Profile
              </button>
            </p>
          </div>
          <p className="text-gray-600">
            Status: <span className="font-medium">{ticket.status}</span>
          </p>
        </div>
        {ticket.agreedPrice && (
          <p className="text-gray-600 mb-4">
            Agreed Price:{" "}
            {ticket.agreedPrice.toLocaleString("en-IN", {
              style: "currency",
              currency: "INR",
            })}
          </p>
        )}

        <h2 className="text-xl font-semibold mb-4 text-gray-800">Messages</h2>
        <div className="border border-gray-200 rounded-md p-4 mb-6 max-h-96 overflow-y-auto">
          {ticket.messages.length === 0 ? (
            <p className="text-gray-500">No messages yet.</p>
          ) : (
            ticket.messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-4 p-3 rounded-md max-w-[70%] ${
                  msg.senderId === userId
                    ? "bg-blue-100 ml-auto"
                    : "bg-gray-100"
                }`}
              >
                <p className="font-semibold text-gray-800">{msg.senderName}</p>
                <p className="text-gray-700">{msg.content}</p>
                <p className="text-xs text-gray-500">
                  {new Date(msg.timestamp).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>

        {ticket.status !== "closed" && (
          <div className="mb-6">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
            />
            <button
              onClick={handleSendMessage}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Send Message
            </button>
          </div>
        )}

        {(ticket.status === "open" || ticket.status === "negotiating") && (
          <div className="flex gap-4 mb-6">
            <input
              type="number"
              value={agreedPrice}
              onChange={(e) => setAgreedPrice(e.target.value)}
              placeholder="Enter agreed price"
              className="w-48 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              step="0.01"
            />
            <button
              onClick={handleSetPrice}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center"
            >
              <DollarSign className="h-5 w-5 mr-2" />
              Propose Price
            </button>
          </div>
        )}

        {ticket.status === "negotiating" && isBuyer && ticket.agreedPrice && (
          <div className="flex gap-4 mb-6">
            <button
              onClick={handleAcceptPrice}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center"
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Accept Price
            </button>
            <button
              onClick={handleNegotiatePrice}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 flex items-center"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Negotiate Price
            </button>
          </div>
        )}

        {ticket.status === "accepted" && isBuyer && (
          <button
            onClick={handleConfirmPayment}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center mb-4"
          >
            <DollarSign className="h-5 w-5 mr-2" />
            Confirm Payment
          </button>
        )}

        {ticket.status === "paid" && isBuyer && (
          <button
            onClick={handleMarkCompleted}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center mb-4"
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            Mark Work Completed
          </button>
        )}

        {ticket.status === "completed" && isSeller && (
          <button
            onClick={handleConfirmCompletion}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center mb-4"
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            Confirm Completion
          </button>
        )}

        {ticket.status !== "closed" && (
          <button
            onClick={handleCloseTicket}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center mb-4"
          >
            <XCircle className="h-5 w-5 mr-2" />
            Close Ticket
          </button>
        )}

        <button
          onClick={() => navigate("/gigs")}
          className="text-blue-500 hover:text-blue-700 underline"
        >
          Back to Gigs
        </button>
      </div>
    </div>
  );
};

export default Ticket;
