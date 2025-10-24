import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { jwtDecode } from 'jwt-decode';
import { MessageCircle, DollarSign, XCircle } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const Ticket = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [userId, setUserId] = useState(null);
  const [message, setMessage] = useState('');
  const [agreedPrice, setAgreedPrice] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.id) {
          setUserId(decoded.id);
        } else {
          console.error('Invalid token payload:', decoded);
          localStorage.removeItem('token');
          toast.error('Session invalid. Please log in again.');
          navigate('/login');
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.removeItem('token');
        toast.error('Session expired. Please log in again.');
        navigate('/login');
      }
    } else {
      toast.error('Please log in to view tickets.');
      navigate('/login', { state: { from: `/tickets/${id}` } });
    }
  }, [navigate]);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await axios.get(`${API_BASE}/tickets/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setTicket(response.data);
      } catch (error) {
        console.error('Error fetching ticket:', error);
        toast.error(error.response?.data?.error || 'Failed to load ticket.');
        if (error.response?.status === 403 || error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };

    if (userId) {
      fetchTicket();
    }
  }, [id, userId, navigate]);

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.error('Message cannot be empty.');
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE}/tickets/${id}/messages`,
        { content: message },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setTicket(response.data.ticket);
      setMessage('');
      toast.success('Message sent!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error.response?.data?.error || 'Failed to send message.');
    }
  };

  const handleSetPrice = async () => {
    if (!agreedPrice || isNaN(agreedPrice) || agreedPrice <= 0) {
      toast.error('Please enter a valid price.');
      return;
    }

    try {
      const response = await axios.patch(
        `${API_BASE}/tickets/${id}/price`,
        { agreedPrice },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setTicket(response.data.ticket);
      setAgreedPrice('');
      toast.success('Price agreed!');
    } catch (error) {
      console.error('Error setting price:', error);
      toast.error(error.response?.data?.error || 'Failed to set price.');
    }
  };

  const handleConfirmPayment = async () => {
    try {
      const response = await axios.patch(
        `${API_BASE}/tickets/${id}/pay`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setTicket(response.data.ticket);
      toast.success('Payment confirmed!');
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast.error(error.response?.data?.error || 'Failed to confirm payment.');
    }
  };

  const handleCloseTicket = async () => {
    try {
      const response = await axios.patch(
        `${API_BASE}/tickets/${id}/close`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setTicket(response.data.ticket);
      toast.success('Ticket closed!');
    } catch (error) {
      console.error('Error closing ticket:', error);
      toast.error(error.response?.data?.error || 'Failed to close ticket.');
    }
  };

  if (!ticket) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  const isBuyer = userId === ticket.buyerId;
  const isSeller = userId === ticket.sellerId;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Ticket for {ticket.gigId.title}</h1>
      <div className="border rounded-lg p-6 shadow-md">
        <p className="text-gray-600 mb-2">Status: {ticket.status}</p>
        <p className="text-gray-600 mb-2">Seller: {ticket.sellerId.fullName}</p>
        <p className="text-gray-600 mb-2">Buyer: {ticket.buyerId.fullName}</p>
        {ticket.agreedPrice && (
          <p className="text-gray-600 mb-4">Agreed Price: ${ticket.agreedPrice}</p>
        )}
        
        <h2 className="text-xl font-semibold mb-4">Messages</h2>
        <div className="border rounded-md p-4 mb-4 max-h-96 overflow-y-auto">
          {ticket.messages.length === 0 ? (
            <p className="text-gray-500">No messages yet.</p>
          ) : (
            ticket.messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-2 p-2 rounded-md ${
                  msg.senderId === userId ? 'bg-blue-100 ml-auto' : 'bg-gray-100'
                } max-w-[70%]`}
              >
                <p className="font-semibold">{msg.senderName}</p>
                <p>{msg.content}</p>
                <p className="text-xs text-gray-500">
                  {new Date(msg.timestamp).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>

        {ticket.status !== 'closed' && (
          <div className="mb-4">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full p-2 border rounded-md mb-2"
              rows="4"
            />
            <button
              onClick={handleSendMessage}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Send Message
            </button>
          </div>
        )}

        {ticket.status !== 'closed' && ticket.status !== 'paid' && (
          <div className="mb-4">
            <input
              type="number"
              value={agreedPrice}
              onChange={(e) => setAgreedPrice(e.target.value)}
              placeholder="Enter agreed price"
              className="p-2 border rounded-md mr-2"
              min="0"
              step="0.01"
            />
            <button
              onClick={handleSetPrice}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 flex items-center"
            >
              <DollarSign className="h-5 w-5 mr-2" />
              Set Price
            </button>
          </div>
        )}

        {ticket.status === 'accepted' && isBuyer && (
          <button
            onClick={handleConfirmPayment}
            className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 flex items-center mb-4"
          >
            <DollarSign className="h-5 w-5 mr-2" />
            Confirm Payment
          </button>
        )}

        {ticket.status !== 'closed' && (
          <button
            onClick={handleCloseTicket}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 flex items-center"
          >
            <XCircle className="h-5 w-5 mr-2" />
            Close Ticket
          </button>
        )}

        <button
          onClick={() => navigate('/gigs')}
          className="text-blue-500 hover:underline mt-4"
        >
          Back to Gigs
        </button>
      </div>
    </div>
  );
};

export default Ticket;