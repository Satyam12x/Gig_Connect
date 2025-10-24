import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { jwtDecode } from 'jwt-decode';
import { Ticket as TicketIcon } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [userId, setUserId] = useState(null);
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
      navigate('/login', { state: { from: '/tickets' } });
    }
  }, [navigate]);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await axios.get(`${API_BASE}/users/${userId}/tickets`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setTickets(response.data || []);
      } catch (error) {
        console.error('Error fetching tickets:', error);
        toast.error(error.response?.data?.error || 'Failed to load tickets.');
        if (error.response?.status === 403 || error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };

    if (userId) {
      fetchTickets();
    }
  }, [userId, navigate]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">My Tickets</h1>
      {tickets.length === 0 ? (
        <p className="text-gray-500">No tickets found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map((ticket) => (
            <div key={ticket._id} className="border rounded-lg p-4 shadow-md hover:shadow-lg">
              <h2 className="text-xl font-semibold flex items-center">
                <TicketIcon className="h-5 w-5 mr-2" />
                {ticket.gigId.title}
              </h2>
              <p className="text-gray-600 mb-2">Status: {ticket.status}</p>
              <p className="text-gray-500 mb-2">Seller: {ticket.sellerId.fullName}</p>
              <p className="text-gray-500 mb-2">Buyer: {ticket.buyerId.fullName}</p>
              {ticket.agreedPrice && (
                <p className="text-gray-500 mb-4">Agreed Price: ${ticket.agreedPrice}</p>
              )}
              <button
                onClick={() => navigate(`/tickets/${ticket._id}`)}
                className="text-blue-500 hover:underline"
              >
                View Ticket
              </button>
            </div>
          ))}
        </div>
      )}
      <button
        onClick={() => navigate('/gigs')}
        className="text-blue-500 hover:underline mt-6"
      >
        Back to Gigs
      </button>
    </div>
  );
};

export default Tickets;