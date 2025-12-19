import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { jwtDecode } from "jwt-decode";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Paperclip, DollarSign, CheckCircle, Star, X, Clock, MessageSquare,
  Info, ArrowLeft, File, AlertCircle, TrendingUp, Package, Shield, Users,
  Check, ChevronRight, Briefcase, Lock, Download, MoreVertical, CreditCard
} from "lucide-react";
import io from "socket.io-client";
import { debounce } from "lodash";
import moment from "moment";
import { API_BASE, API_URL } from "../constants/api";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_URL;

// --- Helper Components ---

const StatusBadge = ({ status }) => {
  const styles = {
    open: "bg-blue-100 text-blue-700",
    negotiating: "bg-purple-100 text-purple-700",
    accepted: "bg-indigo-100 text-indigo-700",
    paid: "bg-cyan-100 text-cyan-700",
    completed: "bg-emerald-100 text-emerald-700",
    closed: "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${styles[status] || styles.closed}`}>
      {status?.replace(/_/g, " ")}
    </span>
  );
};

const ActionButton = ({ onClick, variant = "primary", icon: Icon, children, disabled, className = "" }) => {
  const baseStyle = "flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all shadow-sm active:scale-[0.98]";
  const variants = {
    primary: "bg-[#1A2A4F] text-white hover:bg-[#2A3A5F] disabled:opacity-50",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50",
    secondary: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
  };
  
  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
       {Icon && <Icon size={18} />}
       {children}
    </button>
  );
};

// --- Main Component ---

const Ticket = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [ticket, setTicket] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Chat State
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  
  // Action State
  const [agreedPrice, setAgreedPrice] = useState("");
  const [showPriceInput, setShowPriceInput] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [rating, setRating] = useState(0);

  // Refs
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Initialization
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        setUserId(jwtDecode(token).id);
      } catch (e) {
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  // Fetch Ticket & Socket Setup
  useEffect(() => {
    if (!userId) return;

    const fetchTicket = async () => {
        try {
            const { data } = await axios.get(`${API_BASE}/tickets/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            setTicket(data);
            setLoading(false);
        } catch (error) {
            toast.error("Failed to load ticket");
            navigate("/gigs");
        }
    };
    fetchTicket();

    // Socket
    const socket = io(SOCKET_URL, {
        auth: { token: localStorage.getItem("token") },
        path: "/ticket-socket",
        transports: ["websocket", "polling"],
    });
    socketRef.current = socket;
    socket.emit("joinTicket", id);
    
    socket.on("newMessage", (updated) => {
        setTicket(updated);
        scrollToBottom();
    });
    
    socket.on("typing", ({ userId: typerId, userName }) => {
        if (typerId !== userId) {
            setTypingUser(userName);
            setTimeout(() => setTypingUser(null), 3000);
        }
    });

    return () => socket.disconnect();
  }, [id, userId, navigate]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [ticket?.messages]);

  // --- Handlers ---

  const handleSendMessage = async () => {
    if ((!message.trim() && !file) || isSending) return;
    setIsSending(true);
    
    try {
        const endpoint = file 
            ? `${API_BASE}/tickets/${id}/messages/attachment` 
            : `${API_BASE}/tickets/${id}/messages`;
            
        const formData = new FormData();
        if (message.trim()) formData.append("content", message);
        if (file) formData.append("attachment", file);

        const { data } = await axios.post(endpoint, file ? formData : { content: message }, {
            headers: { 
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": file ? "multipart/form-data" : "application/json"
            }
        });
        
        setTicket(data.ticket);
        setMessage("");
        setFile(null);
        setFilePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (e) {
        toast.error("Failed to send");
    } finally {
        setIsSending(false);
    }
  };

  const handleAction = async (actionType, payload = {}) => {
      try {
          let endpoint = "";
          let successMsg = "";
          
          switch(actionType) {
              case 'propose_price':
                  endpoint = `${API_BASE}/tickets/${id}/price`;
                  successMsg = "Price proposed";
                  break;
              case 'accept_price':
                  endpoint = `${API_BASE}/tickets/${id}/accept-price`;
                  successMsg = "Price accepted";
                  break;
              case 'pay':
                  endpoint = `${API_BASE}/tickets/${id}/paid`;
                  successMsg = "Payment confirmed";
                  break;
              case 'complete':
                  endpoint = `${API_BASE}/tickets/${id}/complete`;
                  successMsg = "Marked as complete";
                  break;
              case 'close':
                  endpoint = `${API_BASE}/tickets/${id}/close`;
                  successMsg = "Ticket closed";
                  break;
          }

          const { data } = await axios.patch(endpoint, payload, {
              headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          });
          
          setTicket(data.ticket);
          toast.success(successMsg);
          if (actionType === 'propose_price') setShowPriceInput(false);
          if (actionType === 'close') setIsRatingModalOpen(false);
          
      } catch (e) {
          toast.error(e.response?.data?.error || "Action failed");
      }
  };

  const onTyping = (e) => {
      setMessage(e.target.value);
      if (socketRef.current) {
         const userName = userId === ticket?.freelancerId?._id 
            ? ticket.freelancerId.fullName 
            : ticket.providerId?.fullName;
         socketRef.current.emit("typing", { ticketId: id, userId, userName });
      }
  };

  // --- Render Helpers ---

  const isProvider = ticket && userId === ticket.providerId?._id;
  const isFreelancer = ticket && userId === ticket.freelancerId?._id;
  const otherParty = isProvider ? ticket?.freelancerId : ticket?.providerId;

  if (loading || !ticket) return <div className="h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1A2A4F]"></div></div>;

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Navbar Placeholder/Real Navbar - Assuming Navbar logic handled elsewhere or simple header */}
      <header className="h-16 border-b flex items-center justify-between px-4 sm:px-6 bg-white shrink-0 z-20 relative">
         <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
            <button onClick={() => navigate('/tickets')} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 shrink-0">
                <ArrowLeft size={20} />
            </button>
            <div className="min-w-0">
                <h1 className="font-bold text-gray-900 leading-tight truncate text-sm sm:text-base">{ticket.gigId?.title}</h1>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="font-mono hidden sm:inline">#{id.slice(-6).toUpperCase()}</span>
                    <span className="hidden sm:inline">•</span>
                    <StatusBadge status={ticket.status} />
                </div>
            </div>
         </div>
         <button 
            onClick={() => setShowMobileSidebar(!showMobileSidebar)}
            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
         >
            {showMobileSidebar ? <X size={20} /> : <Info size={20} />}
         </button>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* LEFT: Main Chat */}
        <div className="flex-1 flex flex-col min-w-0 bg-gray-50/50">
           
           {/* Action Banner */}
           {ticket.status !== 'closed' && (
              <div className="bg-white border-b p-4 shadow-sm z-10">
                 {/* Logic for Banner based on status */}
                 {(ticket.status === 'open' || ticket.status === 'negotiating') && !ticket.agreedPrice && (
                    <div className="flex items-center justify-between flex-wrap gap-3">
                       <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><DollarSign size={20} /></div>
                          <div><p className="font-medium text-sm sm:text-base">Price Negotiation</p><p className="text-xs text-gray-500">Agree on a budget to start working</p></div>
                       </div>
                       <ActionButton onClick={() => setShowPriceInput(!showPriceInput)} icon={DollarSign} className="w-full sm:w-auto text-sm">Propose Price</ActionButton>
                    </div>
                 )}
                 {(ticket.status === 'open' || ticket.status === 'negotiating') && ticket.agreedPrice && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-purple-50 p-3 rounded-lg border border-purple-100 gap-3">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-white rounded-lg text-purple-600 shadow-sm"><TrendingUp size={20} /></div>
                           <div>
                              <p className="font-bold text-purple-900 text-sm">Proposal: ₹{ticket.agreedPrice.toLocaleString()}</p>
                              <p className="text-xs text-purple-700">Waiting for {isProvider ? 'your approval' : 'provider approval'}</p>
                           </div>
                        </div>
                        {isProvider ? (
                            <div className="flex gap-2 w-full sm:w-auto">
                                <ActionButton variant="secondary" onClick={() => setShowPriceInput(true)} className="flex-1 sm:flex-none text-sm">Counter</ActionButton>
                                <ActionButton variant="success" onClick={() => handleAction('accept_price')} className="flex-1 sm:flex-none text-sm">Accept</ActionButton>
                            </div>
                        ) : (
                            <span className="text-sm font-medium text-purple-600 px-3 bg-white/50 rounded py-1">Pending Approval</span>
                        )}
                    </div>
                 )}
                 {ticket.status === 'accepted' && (
                    <div className="flex items-center justify-between flex-wrap gap-3">
                       <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><CreditCard size={20} /></div>
                          <div><p className="font-medium text-sm sm:text-base">Payment Required</p><p className="text-xs text-gray-500">{isProvider ? 'Please confirm payment' : 'Waiting for provider to pay'}</p></div>
                       </div>
                       {isProvider && <ActionButton onClick={() => handleAction('pay')} icon={CheckCircle} className="w-full sm:w-auto text-sm">Confirm Payment</ActionButton>}
                    </div>
                 )}
                 {ticket.status === 'paid' && (
                    <div className="flex items-center justify-between flex-wrap gap-3">
                       <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><Package size={20} /></div>
                          <div><p className="font-medium text-sm sm:text-base">Work in Progress</p><p className="text-xs text-gray-500">{isFreelancer ? 'Mark complete when done' : 'Freelancer is working'}</p></div>
                       </div>
                       {isFreelancer && <ActionButton onClick={() => handleAction('complete')} variant="success" icon={CheckCircle} className="w-full sm:w-auto text-sm">Mark Complete</ActionButton>}
                    </div>
                 )}
                 {ticket.status === 'completed' && (
                    <div className="flex flex-col sm:flex-row items-center justify-between text-center w-full gap-3">
                       <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-lg text-green-700"><CheckCircle size={20} /></div>
                          <div className="text-left"><p className="font-medium text-sm sm:text-base">Work Completed</p><p className="text-xs text-gray-500">Provider needs to review & close</p></div>
                       </div>
                       {isProvider && <ActionButton onClick={() => { 
                          if(isProvider) setIsRatingModalOpen(true);
                          else handleAction('close');
                       }} className="w-full sm:w-auto text-sm">Close & Rate</ActionButton>}
                    </div>
                 )}
              </div>
           )}

           {/* Create Offer Input (Overlay/In-flow) */}
           <AnimatePresence>
             {showPriceInput && (
                <motion.div initial={{height: 0, opacity: 0}} animate={{height: 'auto', opacity: 1}} exit={{height: 0, opacity: 0}} className="bg-white border-b p-4">
                    <div className="flex gap-2 max-w-md mx-auto">
                        <div className="relative flex-1">
                            <span className="absolute left-3 top-2.5 text-gray-500 font-bold">₹</span>
                            <input type="number" value={agreedPrice} onChange={e => setAgreedPrice(e.target.value)} className="w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Enter Amount" autoFocus />
                        </div>
                        <ActionButton onClick={() => handleAction('propose_price', { agreedPrice: parseFloat(agreedPrice) })} disabled={!agreedPrice}>Send Offer</ActionButton>
                    </div>
                    {ticket.gigId?.price && <p className="text-xs text-center text-gray-500 mt-2">Original Budget: ₹{ticket.gigId.price}</p>}
                </motion.div>
             )}
           </AnimatePresence>

           {/* Messages Area */}
           <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {ticket.messages?.map((msg, i) => {
                  const isMine = msg.senderId === userId;
                  const isSystem = msg.senderId === 'system';
                  
                  if (isSystem) return (
                      <div key={i} className="flex justify-center"><span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-center">{msg.content}</span></div>
                  );

                  return (
                      <div key={i} className={`flex gap-3 ${isMine ? 'justify-end' : ''}`}>
                          {!isMine && (
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold shrink-0">
                                  {msg.senderName?.[0] || '?'}
                              </div>
                          )}
                          <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3 px-4 shadow-sm text-sm ${isMine ? 'bg-[#1A2A4F] text-white rounded-br-none' : 'bg-white border border-gray-100 rounded-bl-none text-gray-800'}`}>
                              {msg.content && <p className="whitespace-pre-wrap break-words">{msg.content}</p>}
                              {msg.attachment && (
                                  <div className="mt-2">
                                      {msg.attachment.match(/\.(jpg|png|jpeg|webp)$/i) ? (
                                          <img src={msg.attachment} alt="attachment" className="rounded-lg max-w-full max-h-48 cursor-pointer" onClick={() => window.open(msg.attachment)} />
                                      ) : (
                                          <a href={msg.attachment} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 bg-black/10 rounded-lg text-xs hover:bg-black/20 transition-colors">
                                              <File size={16} /> <span className="truncate">View Attachment</span>
                                          </a>
                                      )}
                                  </div>
                              )}
                              <div className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${isMine ? 'text-blue-100' : 'text-gray-400'}`}>
                                  {moment(msg.timestamp).format("LT")}
                                  {isMine && msg.read && <Check size={12} />}
                              </div>
                          </div>
                      </div>
                  );
              })}
              <div ref={messagesEndRef} />
              {typingUser && <div className="text-xs text-gray-400 italic ml-12">{typingUser} is typing...</div>}
           </div>

           {/* Input Area */}
           <div className="p-4 bg-white border-t">
              {ticket.status !== 'closed' ? (
                <div className="flex items-end gap-2 max-w-5xl mx-auto">
                    {file && (
                        <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg text-xs mb-2 absolute bottom-20 shadow-md z-20">
                           <span className="truncate max-w-[150px]">{file.name}</span>
                           <button onClick={() => setFile(null)}><X size={14} /></button>
                        </div>
                    )}
                    <button onClick={() => fileInputRef.current?.click()} className="p-3 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors shrink-0"><Paperclip size={20} /></button>
                    <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => setFile(e.target.files[0])} />
                    
                    <textarea 
                        value={message} 
                        onChange={onTyping}
                        onKeyDown={e => {
                            if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
                        }}
                        placeholder="Type a message..." 
                        className="flex-1 bg-gray-50 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#1A2A4F]/20 focus:bg-white transition-all resize-none max-h-32 shadow-inner text-sm sm:text-base"
                        rows={1}
                    />
                    <button onClick={handleSendMessage} disabled={isSending || (!message && !file)} className="p-3 bg-[#1A2A4F] text-white rounded-xl hover:bg-[#2A3A5F] disabled:opacity-50 shadow-md transition-all shrink-0">
                        {isSending ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={20} />}
                    </button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-gray-400 py-4 bg-gray-50 rounded-lg">
                    <Lock size={16} /> <span>Conversation Closed</span>
                </div>
              )}
           </div>
        </div>

        {/* RIGHT: Sidebar (Details) */}
        <AnimatePresence>
            {(showMobileSidebar || window.innerWidth >= 1024) && (
                <motion.div 
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                    className={`fixed inset-y-0 right-0 w-80 bg-white shadow-2xl z-30 transform lg:transform-none lg:relative lg:flex lg:shadow-none border-l flex-col overflow-y-auto ${showMobileSidebar ? 'flex' : 'hidden lg:flex'}`}
                >
                    {/* Mobile Header for Sidebar */}
                    <div className="lg:hidden p-4 border-b flex items-center justify-between bg-gray-50">
                        <h3 className="font-bold text-gray-700">Ticket Details</h3>
                        <button onClick={() => setShowMobileSidebar(false)} className="p-2 hover:bg-gray-200 rounded-full"><X size={20}/></button>
                    </div>

                    {/* Participants */}
                    <div className="p-6 border-b">
                        <h3 className="text-xs font-bold text-gray-400 uppercase mb-4">Users</h3>
                        <div className="space-y-4">
                            <div className={`flex items-center gap-3 p-2 rounded-lg ${isProvider ? 'bg-gray-50' : ''}`}>
                                <img src={ticket.providerId?.profilePicture || `https://ui-avatars.com/api/?name=${ticket.providerId.fullName}`} className="w-10 h-10 rounded-full" alt="" />
                                <div>
                                    <p className="font-semibold text-sm">{ticket.providerId.fullName}</p>
                                    <p className="text-xs text-gray-500">Client {isProvider && '(You)'}</p>
                                </div>
                            </div>
                            <div className={`flex items-center gap-3 p-2 rounded-lg ${!isProvider ? 'bg-gray-50' : ''}`}>
                                <img src={ticket.freelancerId?.profilePicture || `https://ui-avatars.com/api/?name=${ticket.freelancerId.fullName}`} className="w-10 h-10 rounded-full" alt="" />
                                <div>
                                    <p className="font-semibold text-sm">{ticket.freelancerId.fullName}</p>
                                    <p className="text-xs text-gray-500">Freelancer {!isProvider && '(You)'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Financials */}
                    <div className="p-6 border-b">
                        <h3 className="text-xs font-bold text-gray-400 uppercase mb-4">Financials</h3>
                        <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Original Budget</span>
                                <span className="font-medium">₹{ticket.gigId?.price?.toLocaleString() || '-'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Agreed Price</span>
                                <span className={`font-bold ${ticket.agreedPrice ? 'text-green-600' : 'text-gray-400'}`}>
                                    {ticket.agreedPrice ? `₹${ticket.agreedPrice.toLocaleString()}` : 'Pending'}
                                </span>
                            </div>
                            <div className="h-px bg-gray-200 my-2" />
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-400">Payment Status</span>
                                <span className={`font-medium ${['paid', 'completed', 'closed'].includes(ticket.status) ? 'text-green-600' : 'text-gray-400'}`}>
                                    {['paid', 'completed', 'closed'].includes(ticket.status) ? 'Paid' : 'Unpaid'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Info */}
                    <div className="p-6">
                        <h3 className="text-xs font-bold text-gray-400 uppercase mb-4">Gig Info</h3>
                        <p className="text-sm text-gray-600">{ticket.gigId?.description || 'No description available for this gig.'}</p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      {/* Rating Modal */}
      <AnimatePresence>
         {isRatingModalOpen && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm">
                <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-xl m-4">
                    <h2 className="text-xl font-bold text-center mb-2">Rate Experience</h2>
                    <p className="text-gray-500 text-center text-sm mb-6">How was working with {otherParty?.fullName}?</p>
                    <div className="flex justify-center gap-2 mb-6">
                        {[1,2,3,4,5].map(star => (
                            <button key={star} onClick={() => setRating(star)} className={`p-1 transition-all hover:scale-110 ${rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}>
                                <Star size={32} fill={rating >= star ? "currentColor" : "none"} />
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setIsRatingModalOpen(false)} className="flex-1 py-3 text-gray-500 hover:bg-gray-50 rounded-xl font-medium">Cancel</button>
                        <button onClick={() => handleAction('close', { rating })} disabled={rating === 0} className="flex-1 py-3 bg-[#1A2A4F] text-white rounded-xl font-bold hover:bg-[#2A3A5F] disabled:opacity-50">Submit</button>
                    </div>
                </div>
            </motion.div>
         )}
      </AnimatePresence>

      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default Ticket;
