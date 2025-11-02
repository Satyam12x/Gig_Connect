import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Search,
  Code,
  PenTool,
  BookOpen,
  Users,
  Briefcase,
  CheckCircle,
  Quote,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API_BASE = "http://localhost:5000/api";

const HeroSection = ({ userRole }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/gigs?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const message =
    userRole === "Seller"
      ? "Showcase your skills and start earning with gigs!"
      : userRole === "Buyer"
      ? "Hire talented students for your projects!"
      : "Discover or offer services in your campus community!";

  return (
    <>
      <div className="relative min-h-screen bg-gray-50 overflow-hidden pt-16">
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute top-[-10%] right-[-10%] w-1/2 h-1/2 bg-gradient-to-br from-indigo-600 to-navyBlueLight opacity-25 filter blur-3xl transform rotate-12 animate-float"
            style={{
              clipPath:
                "polygon(30% 0%, 70% 20%, 100% 60%, 70% 100%, 30% 80%, 0% 40%)",
            }}
          ></div>
          <div
            className="absolute bottom-[-15%] left-[-10%] w-1/3 h-1/3 bg-gradient-to-tr from-purple-500 to-indigo-600 opacity-20 filter blur-3xl transform -rotate-6 animate-float-slow"
            style={{
              clipPath:
                "polygon(20% 0%, 80% 0%, 100% 50%, 80% 100%, 20% 100%, 0% 50%)",
            }}
          ></div>
          <div className="absolute top-1/3 left-1/4 w-1/4 h-1/4 bg-gradient-to-bl from-navyBlueLight to-purple-500 opacity-20 filter blur-3xl rounded-full animate-pulse-slow"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="flex flex-col lg:flex-row gap-12 items-center justify-between">
            <div className="w-full lg:w-1/2 space-y-8 text-center lg:text-left order-last lg:order-none">
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-indigo-800 font-sans"
                style={{ color: "#1E3A8A" }}
              >
                Connect with
                <span
                  className="block text-navyBlueLight font-extrabold"
                  style={{ color: "#2A3A6F" }}
                >
                  Student Talent
                </span>
              </h1>
              <p
                className="text-lg sm:text-xl text-indigo-600 max-w-2xl mx-auto lg:mx-0 font-sans"
                style={{ color: "#4B5EAA" }}
              >
                {message}
              </p>
              <form
                onSubmit={handleSearch}
                className="flex max-w-md mx-auto lg:mx-0"
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for gigs..."
                  className="flex-grow p-3 rounded-l-lg border-2 border-r-0 border-indigo-800 focus:outline-none focus:ring-2 focus:ring-navyBlueLight"
                  style={{ borderColor: "#1E3A8A", color: "#4B5EAA" }}
                  aria-label="Search gigs"
                />
                <button
                  type="submit"
                  className="px-4 py-3 bg-indigo-800 text-white rounded-r-lg hover:bg-navyBlueLight transition-colors duration-300"
                  style={{ backgroundColor: "#1E3A8A", color: "#FFFFFF" }}
                  aria-label="Submit search"
                >
                  <Search size={20} />
                </button>
              </form>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/signup"
                  className="px-8 py-4 bg-indigo-800 text-white font-semibold rounded-lg hover:bg-navyBlueLight font-sans transition-colors duration-300"
                  style={{ backgroundColor: "#1E3A8A", color: "#FFFFFF" }}
                >
                  Get Started Free
                </Link>
                <Link
                  to="/gigs"
                  className="px-8 py-4 bg-white text-indigo-800 font-semibold rounded-lg border-2 border-indigo-800 hover:bg-navyBlueFaint hover:text-navyBlueLight font-sans transition-colors duration-300"
                  style={{ color: "#1E3A8A", borderColor: "#1E3A8A" }}
                >
                  Browse Gigs
                </Link>
              </div>
              <div className="flex flex-wrap gap-8 justify-center lg:justify-start pt-8">
                <div className="text-center lg:text-left">
                  <p
                    className="text-3xl font-bold text-indigo-800 font-sans"
                    style={{ color: "#1E3A8A" }}
                  >
                    5,000+
                  </p>
                  <p
                    className="text-indigo-600 font-sans"
                    style={{ color: "#4B5EAA" }}
                  >
                    Active Students
                  </p>
                </div>
                <div className="text-center lg:text-left">
                  <p
                    className="text-3xl font-bold text-indigo-800 font-sans"
                    style={{ color: "#1E3A8A" }}
                  >
                    10,000+
                  </p>
                  <p
                    className="text-indigo-600 font-sans"
                    style={{ color: "#4B5EAA" }}
                  >
                    Projects Completed
                  </p>
                </div>
                <div className="text-center lg:text-left">
                  <p
                    className="text-3xl font-bold text-indigo-800 font-sans"
                    style={{ color: "#1E3A8A" }}
                  >
                    4.9/5
                  </p>
                  <p
                    className="text-indigo-600 font-sans"
                    style={{ color: "#4B5EAA" }}
                  >
                    Average Rating
                  </p>
                </div>
              </div>
            </div>
            <div className="w-full lg:w-1/2 flex justify-center order-first lg:order-none">
              <div className="relative max-w-md">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-500 to-navyBlueLight rounded-full opacity-25 blur-md"></div>
                <div
                  className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden shadow-2xl border-2"
                  style={{ borderColor: "#1E3A8A" }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=800&fit=crop"
                    alt="Students collaborating"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 bg-white/95 px-6 py-4 rounded-2xl shadow-xl border-2 border-navyBlueFaint">
                  <p
                    className="text-sm text-indigo-600 font-sans"
                    style={{ color: "#4B5EAA" }}
                  >
                    Trusted by
                  </p>
                  <p
                    className="text-2xl font-bold text-indigo-800 font-sans"
                    style={{ color: "#1E3A8A" }}
                  >
                    50+ Colleges
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <hr
        className="mx-4 sm:mx-6 lg:mx-8 border-t-2"
        style={{
          borderImage:
            "linear-gradient(to right, transparent, #2A3A6F, transparent) 1",
        }}
      />
    </>
  );
};

const FeaturedGigsSection = ({ userId }) => {
  const [gigs, setGigs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [gigsResponse, applicationsResponse] = await Promise.all([
          axios.get(`${API_BASE}/gigs/recent`),
          token
            ? axios.get(`${API_BASE}/users/${userId}/applications`, {
                headers: { Authorization: `Bearer ${token}` },
              })
            : { data: [] },
        ]);
        setGigs(gigsResponse.data.slice(0, 4));
        setApplications(applicationsResponse.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch gigs");
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const getApplicationStatus = (gigId) => {
    const application = applications.find((app) => app.gigId._id === gigId);
    return application ? application.status : null;
  };

  return (
    <>
      <div className="relative bg-gray-50 py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute top-[-10%] right-[-10%] w-1/2 h-1/2 bg-gradient-to-br from-indigo-600 to-navyBlueLight opacity-25 filter blur-3xl transform rotate-12 animate-float"
            style={{
              clipPath:
                "polygon(30% 0%, 70% 20%, 100% 60%, 70% 100%, 30% 80%, 0% 40%)",
            }}
          ></div>
          <div
            className="absolute bottom-[-15%] left-[-10%] w-1/3 h-1/3 bg-gradient-to-tr from-purple-500 to-indigo-600 opacity-20 filter blur-3xl transform -rotate-6 animate-float-slow"
            style={{
              clipPath:
                "polygon(20% 0%, 80% 0%, 100% 50%, 80% 100%, 20% 100%, 0% 50%)",
            }}
          ></div>
          <div className="absolute top-1/3 left-1/4 w-1/4 h-1/4 bg-gradient-to-bl from-navyBlueLight to-purple-500 opacity-20 filter blur-3xl rounded-full animate-pulse-slow"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              className="text-3xl sm:text-4xl font-bold text-indigo-800 font-sans"
              style={{ color: "#1E3A8A" }}
            >
              Featured Gigs
            </h2>
            <p
              className="mt-4 text-lg text-indigo-600 max-w-3xl mx-auto font-sans"
              style={{ color: "#4B5EAA" }}
            >
              Discover top services offered by talented students in your campus
              community.
            </p>
          </div>
          {error && (
            <div
              className="text-center text-red-500 font-sans flex items-center justify-center gap-2 mb-6"
              style={{ color: "#DC2626" }}
            >
              <AlertTriangle size={20} />
              {error}
            </div>
          )}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white/95 p-6 rounded-xl shadow-lg border border-gray-300 animate-pulse"
                >
                  <div className="w-16 h-16 rounded-full bg-gray-200 mx-auto mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : gigs.length === 0 ? (
            <div
              className="text-center text-indigo-600 font-sans"
              style={{ color: "#4B5EAA" }}
            >
              No gigs available at the moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {gigs.map((gig) => {
                const applicationStatus = getApplicationStatus(gig._id);
                const isClosed = gig.status === "closed";
                const hasApplied = !!applicationStatus;
                return (
                  <div
                    key={gig._id}
                    className={`bg-white/95 p-6 rounded-xl shadow-lg border border-gray-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                      isClosed || hasApplied ? "opacity-70" : ""
                    }`}
                  >
                    {gig.thumbnail ? (
                      <img
                        src={gig.thumbnail}
                        alt={gig.title}
                        className="w-16 h-16 rounded-full mx-auto mb-4 object-cover"
                      />
                    ) : (
                      <div
                        className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-navyBlueLight mx-auto mb-4 flex items-center justify-center text-white text-xl font-bold font-sans"
                        style={{ backgroundColor: "#1E3A8A" }}
                      >
                        {gig.title.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <h3
                      className="text-xl font-semibold text-indigo-800 mb-2 font-sans"
                      style={{ color: "#1E3A8A" }}
                    >
                      {gig.title}
                    </h3>
                    <p
                      className="text-indigo-600 mb-2 font-sans"
                      style={{ color: "#4B5EAA" }}
                    >
                      By{" "}
                      <Link
                        to={`/profile/${gig.sellerId}`}
                        className="hover:underline"
                      >
                        {gig.sellerName}
                      </Link>
                    </p>
                    <p
                      className="text-indigo-600 mb-2 font-sans"
                      style={{ color: "#4B5EAA" }}
                    >
                      From ${gig.price}
                    </p>
                    <p
                      className={`text-indigo-600 mb-2 font-sans font-semibold ${
                        isClosed ? "text-red-600" : ""
                      }`}
                      style={{ color: isClosed ? "#DC2626" : "#4B5EAA" }}
                    >
                      Status:{" "}
                      {gig.status.charAt(0).toUpperCase() + gig.status.slice(1)}
                    </p>
                    {hasApplied && (
                      <p
                        className={`text-sm font-semibold mb-2 font-sans ${
                          applicationStatus === "accepted"
                            ? "text-green-600"
                            : applicationStatus === "rejected"
                            ? "text-red-600"
                            : "text-yellow-600"
                        }`}
                      >
                        Application:{" "}
                        {applicationStatus.charAt(0).toUpperCase() +
                          applicationStatus.slice(1)}
                      </p>
                    )}
                    <p
                      className="text-indigo-600 mb-4 font-sans line-clamp-2"
                      style={{ color: "#4B5EAA" }}
                    >
                      {gig.description}
                    </p>
                    <p
                      className="text-sm text-indigo-600 mb-4 font-sans"
                      style={{ color: "#4B5EAA" }}
                    >
                      {gig.category}
                    </p>
                    {isClosed ? (
                      <span
                        className="px-6 py-2 bg-gray-200 text-gray-600 font-semibold rounded-lg font-sans"
                        style={{ backgroundColor: "#E5E7EB", color: "#4B5563" }}
                      >
                        Applications Closed
                      </span>
                    ) : hasApplied ? (
                      <span
                        className="px-6 py-2 bg-gray-200 text-gray-600 font-semibold rounded-lg font-sans"
                        style={{ backgroundColor: "#E5E7EB", color: "#4B5563" }}
                      >
                        Application Submitted
                      </span>
                    ) : (
                      <Link
                        to={`/gigs/${gig._id}`}
                        className="px-6 py-2 bg-indigo-800 text-white font-semibold rounded-lg hover:bg-navyBlueLight font-sans transition-colors duration-300"
                        style={{ backgroundColor: "#1E3A8A", color: "#FFFFFF" }}
                        aria-label={`View details for ${gig.title}`}
                      >
                        View Details
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <hr
        className="mx-4 sm:mx-6 lg:mx-8 border-t-2"
        style={{
          borderImage:
            "linear-gradient(to right, transparent, #2A3A6F, transparent) 1",
        }}
      />
    </>
  );
};

const RecentGigsSection = ({ userId }) => {
  const [gigs, setGigs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [gigsResponse, applicationsResponse] = await Promise.all([
          axios.get(`${API_BASE}/gigs/recent`),
          token
            ? axios.get(`${API_BASE}/users/${userId}/applications`, {
                headers: { Authorization: `Bearer ${token}` },
              })
            : { data: [] },
        ]);
        setGigs(gigsResponse.data.slice(0, 6));
        setApplications(applicationsResponse.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch recent gigs");
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const getApplicationStatus = (gigId) => {
    const application = applications.find((app) => app.gigId._id === gigId);
    return application ? application.status : null;
  };

  return (
    <>
      <div className="relative bg-gray-50 py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute top-[-10%] right-[-10%] w-1/2 h-1/2 bg-gradient-to-br from-indigo-600 to-navyBlueLight opacity-25 filter blur-3xl transform rotate-12 animate-float"
            style={{
              clipPath:
                "polygon(30% 0%, 70% 20%, 100% 60%, 70% 100%, 30% 80%, 0% 40%)",
            }}
          ></div>
          <div
            className="absolute bottom-[-15%] left-[-10%] w-1/3 h-1/3 bg-gradient-to-tr from-purple-500 to-indigo-600 opacity-20 filter blur-3xl transform -rotate-6 animate-float-slow"
            style={{
              clipPath:
                "polygon(20% 0%, 80% 0%, 100% 50%, 80% 100%, 20% 100%, 0% 50%)",
            }}
          ></div>
          <div className="absolute top-1/3 left-1/4 w-1/4 h-1/4 bg-gradient-to-bl from-navyBlueLight to-purple-500 opacity-20 filter blur-3xl rounded-full animate-pulse-slow"></div>
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              className="text-3xl sm:text-4xl font-bold text-indigo-800 font-sans"
              style={{ color: "#1E3A8A" }}
            >
              Recently Uploaded Gigs
            </h2>
            <p
              className="mt-4 text-lg text-indigo-600 max-w-3xl mx-auto font-sans"
              style={{ color: "#4B5EAA" }}
            >
              Check out the latest services posted by talented students.
            </p>
          </div>
          {error && (
            <div
              className="text-center text-red-500 font-sans flex items-center justify-center gap-2 mb-6"
              style={{ color: "#DC2626" }}
            >
              <AlertTriangle size={20} />
              {error}
            </div>
          )}
          {loading ? (
            <div className="space-y-8">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 animate-pulse"
                >
                  <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 bg-white/95 p-6 rounded-xl shadow-lg border border-gray-300">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded-lg"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : gigs.length === 0 ? (
            <div
              className="text-center text-indigo-600 font-sans"
              style={{ color: "#4B5EAA" }}
            >
              No recent gigs available.
            </div>
          ) : (
            <div className="relative space-y-8">
              <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-indigo-200"></div>
              {gigs.map((gig, index) => {
                const applicationStatus = getApplicationStatus(gig._id);
                const isClosed = gig.status === "closed";
                const hasApplied = !!applicationStatus;
                return (
                  <div
                    key={gig._id}
                    className={`flex items-start space-x-4 opacity-0 animate-slide-in transition-all duration-500 ${
                      isClosed || hasApplied ? "opacity-70" : ""
                    }`}
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <div
                      className="w-4 h-4 bg-navyBlueLight rounded-full mt-2"
                      style={{ backgroundColor: "#2A3A6F" }}
                    ></div>
                    <div className="flex-1 bg-white/95 p-6 rounded-xl shadow-lg border border-gray-300 hover:shadow-xl hover:scale-105 transition-all duration-300">
                      <div className="flex items-center space-x-4">
                        {gig.thumbnail ? (
                          <img
                            src={gig.thumbnail}
                            alt={gig.title}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div
                            className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-navyBlueLight flex items-center justify-center text-white text-lg font-bold font-sans"
                            style={{ backgroundColor: "#1E3A8A" }}
                          >
                            {gig.title.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h3
                            className="text-lg font-semibold text-indigo-800 font-sans"
                            style={{ color: "#1E3A8A" }}
                          >
                            {gig.title}
                          </h3>
                          <p
                            className="text-indigo-600 text-sm font-sans"
                            style={{ color: "#4B5EAA" }}
                          >
                            By{" "}
                            <Link
                              to={`/profile/${gig.sellerId}`}
                              className="hover:underline"
                            >
                              {gig.sellerName}
                            </Link>
                          </p>
                        </div>
                      </div>
                      <p
                        className="text-indigo-600 mt-2 font-sans"
                        style={{ color: "#4B5EAA" }}
                      >
                        From ${gig.price}
                      </p>
                      <p
                        className={`text-indigo-600 mt-1 font-sans font-semibold ${
                          isClosed ? "text-red-600" : ""
                        }`}
                        style={{ color: isClosed ? "#DC2626" : "#4B5EAA" }}
                      >
                        Status:{" "}
                        {gig.status.charAt(0).toUpperCase() +
                          gig.status.slice(1)}
                      </p>
                      {hasApplied && (
                        <p
                          className={`text-sm font-semibold mt-1 font-sans ${
                            applicationStatus === "accepted"
                              ? "text-green-600"
                              : applicationStatus === "rejected"
                              ? "text-red-600"
                              : "text-yellow-600"
                          }`}
                        >
                          Application:{" "}
                          {applicationStatus.charAt(0).toUpperCase() +
                            applicationStatus.slice(1)}
                        </p>
                      )}
                      <p
                        className="text-indigo-600 mt-2 font-sans line-clamp-2"
                        style={{ color: "#4B5EAA" }}
                      >
                        {gig.description}
                      </p>
                      <p
                        className="text-sm text-indigo-600 mt-2 font-sans"
                        style={{ color: "#4B5EAA" }}
                      >
                        {gig.category}
                      </p>
                      <div className="mt-4">
                        {isClosed ? (
                          <span
                            className="px-6 py-2 bg-gray-200 text-gray-600 font-semibold rounded-lg font-sans"
                            style={{
                              backgroundColor: "#E5E7EB",
                              color: "#4B5563",
                            }}
                          >
                            Applications Closed
                          </span>
                        ) : hasApplied ? (
                          <span
                            className="px-6 py-2 bg-gray-200 text-gray-600 font-semibold rounded-lg font-sans"
                            style={{
                              backgroundColor: "#E5E7EB",
                              color: "#4B5563",
                            }}
                          >
                            Application Submitted
                          </span>
                        ) : (
                          <Link
                            to={`/gigs/${gig._id}`}
                            className="px-6 py-2 bg-indigo-800 text-white font-semibold rounded-lg hover:bg-navyBlueLight font-sans transition-colors duration-300"
                            style={{
                              backgroundColor: "#1E3A8A",
                              color: "#FFFFFF",
                            }}
                            aria-label={`View details for ${gig.title}`}
                          >
                            View Details
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <hr
        className="mx-4 sm:mx-6 lg:mx-8 border-t-2"
        style={{
          borderImage:
            "linear-gradient(to right, transparent, #2A3A6F, transparent) 1",
        }}
      />
    </>
  );
};

const CategoriesSection = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categoryIcons = {
    "Web Development": Code,
    "Graphic Design": PenTool,
    Tutoring: BookOpen,
    "Digital Marketing": Search,
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_BASE}/categories`);
        setCategories(response.data.categories || []);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch categories");
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <>
      <div className="relative bg-gray-50 py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute top-[-10%] right-[-10%] w-1/2 h-1/2 bg-gradient-to-br from-indigo-600 to-navyBlueLight opacity-25 filter blur-3xl transform rotate-12 animate-float"
            style={{
              clipPath:
                "polygon(30% 0%, 70% 20%, 100% 60%, 70% 100%, 30% 80%, 0% 40%)",
            }}
          ></div>
          <div
            className="absolute bottom-[-15%] left-[-10%] w-1/3 h-1/3 bg-gradient-to-tr from-purple-500 to-indigo-600 opacity-20 filter blur-3xl transform -rotate-6 animate-float-slow"
            style={{
              clipPath:
                "polygon(20% 0%, 80% 0%, 100% 50%, 80% 100%, 20% 100%, 0% 50%)",
            }}
          ></div>
          <div className="absolute top-1/3 left-1/4 w-1/4 h-1/4 bg-gradient-to-bl from-navyBlueLight to-purple-500 opacity-20 filter blur-3xl rounded-full animate-pulse-slow"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              className="text-3xl sm:text-4xl font-bold text-indigo-800 font-sans"
              style={{ color: "#1E3A8A" }}
            >
              Explore Categories
            </h2>
            <p
              className="mt-4 text-lg text-indigo-600 max-w-3xl mx-auto font-sans"
              style={{ color: "#4B5EAA" }}
            >
              Find the perfect service for your needs from a variety of student
              talent categories.
            </p>
          </div>
          {error && (
            <div
              className="text-center text-red-500 font-sans flex items-center justify-center gap-2 mb-6"
              style={{ color: "#DC2626" }}
            >
              <AlertTriangle size={20} />
              {error}
            </div>
          )}
          {loading ? (
            <div className="flex flex-wrap justify-center gap-6">
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="w-32 h-32 bg-white/95 rounded-xl shadow-lg border border-gray-300 flex flex-col items-center justify-center animate-pulse"
                >
                  <div className="w-6 h-6 bg-gray-200 rounded-full mb-2"></div>
                  <div className="w-20 h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div
              className="text-center text-indigo-600 font-sans"
              style={{ color: "#4B5EAA" }}
            >
              No categories available.
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-6">
              {categories.map((category, index) => {
                const Icon = categoryIcons[category] || Users;
                return (
                  <Link
                    key={index}
                    to={`/gigs?category=${encodeURIComponent(category)}`}
                    className="w-32 h-32 bg-white/95 rounded-xl shadow-lg border border-gray-300 flex flex-col items-center justify-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    aria-label={`Explore ${category} gigs`}
                  >
                    <Icon size={24} style={{ color: "#2A3A6F" }} />
                    <span
                      className="text-sm font-medium mt-2 text-center font-sans"
                      style={{ color: "#1E3A8A" }}
                    >
                      {category}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <hr
        className="mx-4 sm:mx-6 lg:mx-8 border-t-2"
        style={{
          borderImage:
            "linear-gradient(to right, transparent, #2A3A6F, transparent) 1",
        }}
      />
    </>
  );
};

const HowItWorksSection = () => {
  const steps = [
    {
      icon: Search,
      title: "Browse Gigs",
      description:
        "Explore a variety of services offered by talented students in your campus community.",
    },
    {
      icon: Briefcase,
      title: "Hire or Apply",
      description:
        "Hire skilled students or apply to gigs that match your expertise.",
    },
    {
      icon: CheckCircle,
      title: "Complete Project",
      description:
        "Get your project delivered or complete gigs through our secure platform.",
    },
  ];

  return (
    <>
      <div className="relative bg-gray-50 py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute top-[-10%] right-[-10%] w-1/2 h-1/2 bg-gradient-to-br from-indigo-600 to-navyBlueLight opacity-25 filter blur-3xl transform rotate-12 animate-float"
            style={{
              clipPath:
                "polygon(30% 0%, 70% 20%, 100% 60%, 70% 100%, 30% 80%, 0% 40%)",
            }}
          ></div>
          <div
            className="absolute bottom-[-15%] left-[-10%] w-1/3 h-1/3 bg-gradient-to-tr from-purple-500 to-indigo-600 opacity-20 filter blur-3xl transform -rotate-6 animate-float-slow"
            style={{
              clipPath:
                "polygon(20% 0%, 80% 0%, 100% 50%, 80% 100%, 20% 100%, 0% 50%)",
            }}
          ></div>
          <div className="absolute top-1/3 left-1/4 w-1/4 h-1/4 bg-gradient-to-bl from-navyBlueLight to-purple-500 opacity-20 filter blur-3xl rounded-full animate-pulse-slow"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              className="text-3xl sm:text-4xl font-bold text-indigo-800 font-sans"
              style={{ color: "#1E3A8A" }}
            >
              How It Works
            </h2>
            <p
              className="mt-4 text-lg text-indigo-600 max-w-3xl mx-auto font-sans"
              style={{ color: "#4B5EAA" }}
            >
              Getting started with Gig Connect is easy and seamless.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={index}
                  className="bg-white/95 p-6 rounded-xl shadow-lg border border-gray-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-center"
                >
                  <Icon
                    size={32}
                    className="text-navyBlueLight mx-auto mb-4"
                    style={{ color: "#2A3A6F" }}
                  />
                  <h3
                    className="text-xl font-semibold text-indigo-800 mb-2 font-sans"
                    style={{ color: "#1E3A8A" }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="text-indigo-600 font-sans"
                    style={{ color: "#4B5EAA" }}
                  >
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <hr
        className="mx-4 sm:mx-6 lg:mx-8 border-t-2"
        style={{
          borderImage:
            "linear-gradient(to right, transparent, #2A3A6F, transparent) 1",
        }}
      />
    </>
  );
};

const TestimonialsSection = () => {
  const testimonials = [
    {
      quote:
        "Gig Connect connected me with a talented student developer who built my website in record time!",
      author: "Satyam Pandey",
      role: "Small Business Owner",
    },
    {
      quote:
        "As a student, I showcased my graphic design portfolio and landed my first freelance gig within a week.",
      author: "Apoorva Sharma",
      role: "Computer Science Student",
    },
    {
      quote:
        "The platform’s focus on local campus talent made collaboration seamless and trustworthy.",
      author: "Priya Gupta",
      role: "Marketing Coordinator",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowRight" && !isTransitioning) {
        setIsTransitioning(true);
        setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
      } else if (event.key === "ArrowLeft" && !isTransitioning) {
        setIsTransitioning(true);
        setCurrentIndex(
          (prevIndex) =>
            (prevIndex - 1 + testimonials.length) % testimonials.length
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [testimonials.length, isTransitioning]);

  const goToSlide = (index) => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex(index);
    }
  };

  const goToPrevious = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex(
        (prevIndex) =>
          (prevIndex - 1 + testimonials.length) % testimonials.length
      );
    }
  };

  const goToNext = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }
  };

  const handleTransitionEnd = () => {
    setIsTransitioning(false);
  };

  return (
    <>
      <div className="relative bg-gray-50 py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute top-[-10%] right-[-10%] w-1/2 h-1/2 bg-gradient-to-br from-indigo-600 to-navyBlueLight opacity-25 filter blur-3xl transform rotate-12 animate-float"
            style={{
              clipPath:
                "polygon(30% 0%, 70% 20%, 100% 60%, 70% 100%, 30% 80%, 0% 40%)",
            }}
          ></div>
          <div
            className="absolute bottom-[-15%] left-[-10%] w-1/3 h-1/3 bg-gradient-to-tr from-purple-500 to-indigo-600 opacity-20 filter blur-3xl transform -rotate-6 animate-float-slow"
            style={{
              clipPath:
                "polygon(20% 0%, 80% 0%, 100% 50%, 80% 100%, 20% 100%, 0% 50%)",
            }}
          ></div>
          <div className="absolute top-1/3 left-1/4 w-1/4 h-1/4 bg-gradient-to-bl from-navyBlueLight to-purple-500 opacity-20 filter blur-3xl rounded-full animate-pulse-slow"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              className="text-3xl sm:text-4xl font-bold text-indigo-800 font-sans"
              style={{ color: "#1E3A8A" }}
            >
              What Our Users Say
            </h2>
            <p
              className="mt-4 text-lg text-indigo-600 max-w-3xl mx-auto font-sans"
              style={{ color: "#4B5EAA" }}
            >
              Hear from students and clients who have transformed their projects
              through Gig Connect.
            </p>
          </div>
          <div className="relative max-w-3xl mx-auto">
            <div className="overflow-hidden">
              <div
                className="flex transition-opacity duration-500 ease-in-out"
                style={{ opacity: isTransitioning ? 0.5 : 1 }}
                onTransitionEnd={handleTransitionEnd}
              >
                <div className="min-w-full flex justify-center">
                  <div className="bg-white/95 p-6 rounded-xl shadow-lg border border-gray-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-center w-full max-w-lg">
                    <Quote
                      className="text-navyBlueLight mb-4"
                      size={40}
                      style={{ color: "#2A3A6F" }}
                    />
                    <p
                      className="text-indigo-600 mb-4 font-sans"
                      style={{ color: "#4B5EAA" }}
                    >
                      "{testimonials[currentIndex].quote}"
                    </p>
                    <p
                      className="text-indigo-800 font-semibold font-sans"
                      style={{ color: "#1E3A8A" }}
                    >
                      {testimonials[currentIndex].author}
                    </p>
                    <p
                      className="text-indigo-600 text-sm font-sans"
                      style={{ color: "#4B5EAA" }}
                    >
                      {testimonials[currentIndex].role}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={goToPrevious}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-indigo-800 text-white p-3 rounded-full hover:bg-navyBlueLight transition-colors duration-300 shadow-md"
              aria-label="Previous testimonial"
              style={{ backgroundColor: "#1E3A8A", color: "#FFFFFF" }}
              disabled={isTransitioning}
            >
              <ChevronLeft size={28} />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-indigo-800 text-white p-3 rounded-full hover:bg-navyBlueLight transition-colors duration-300 shadow-md"
              aria-label="Next testimonial"
              style={{ backgroundColor: "#1E3A8A", color: "#FFFFFF" }}
              disabled={isTransitioning}
            >
              <ChevronRight size={28} />
            </button>
            <div className="flex justify-center mt-6 space-x-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-4 h-4 rounded-full ${
                    index === currentIndex ? "bg-indigo-800" : "bg-gray-300"
                  } hover:bg-navyBlueLight transition-colors duration-300`}
                  aria-label={`Go to testimonial ${index + 1}`}
                  style={{
                    backgroundColor:
                      index === currentIndex ? "#1E3A8A" : "#D1D5DB",
                  }}
                  disabled={isTransitioning}
                ></button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <hr
        className="mx-4 sm:mx-6 lg:mx-8 border-t-2"
        style={{
          borderImage:
            "linear-gradient(to right, transparent, #2A3A6F, transparent) 1",
        }}
      />
    </>
  );
};

const CTABanner = ({ userRole, userId }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [userId]);

  const ctaMessage =
    userRole === "Seller"
      ? "Post your first gig and reach clients today!"
      : userRole === "Buyer"
      ? "Find the perfect student talent for your project!"
      : "Join Gig Connect to find or post gigs in your campus!";

  return (
    <>
      <div className="relative bg-indigo-800 py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute top-[-10%] left-[-10%] w-1/2 h-1/2 bg-gradient-to-br from-navyBlueLight to-purple-500 opacity-25 filter blur-3xl transform rotate-12 animate-float"
            style={{
              clipPath:
                "polygon(30% 0%, 70% 20%, 100% 60%, 70% 100%, 30% 80%, 0% 40%)",
            }}
          ></div>
          <div
            className="absolute bottom-[-15%] left-[-10%] w-1/3 h-1/3 bg-gradient-to-tr from-purple-500 to-navyBlueLight opacity-20 filter blur-3xl transform -rotate-6 animate-float-slow"
            style={{
              clipPath:
                "polygon(20% 0%, 80% 0%, 100% 50%, 80% 100%, 20% 100%, 0% 50%)",
            }}
          ></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white font-sans">
            Ready to Start?
          </h2>
          <p
            className="mt-4 text-lg text-navyBlueFaint max-w-3xl mx-auto font-sans"
            style={{ color: "#D6DBF5" }}
          >
            {ctaMessage}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/gigs"
              className="px-8 py-3 bg-white text-indigo-800 font-semibold rounded-lg hover:bg-navyBlueFaint hover:text-navyBlueLight font-sans transition-colors duration-300"
              style={{ color: "#1E3A8A", backgroundColor: "#FFFFFF" }}
              aria-label="Find a gig"
            >
              Find a Gig
            </Link>
            {!loading && userRole !== "Buyer" && (
              <Link
                to="/create-gig"
                className="px-8 py-3 bg-navyBlueLight text-white font-semibold rounded-lg hover:bg-navyBlueDark font-sans transition-colors duration-300"
                style={{ backgroundColor: "#2A3A6F", color: "#FFFFFF" }}
                aria-label="Post a gig"
              >
                Post a Gig
              </Link>
            )}
          </div>
        </div>
      </div>
      <hr
        className="mx-4 sm:mx-6 lg:mx-8 border-t-2"
        style={{
          borderImage:
            "linear-gradient(to right, transparent, #2A3A6F, transparent) 1",
        }}
      />
    </>
  );
};

const Home = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_BASE}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch user profile");
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2
          className="animate-spin"
          size={32}
          style={{ color: "#1E3A8A" }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center text-red-500 font-sans flex items-center gap-2 bg-gray-50"
        style={{ color: "#DC2626" }}
      >
        <AlertTriangle size={24} />
        {error}
      </div>
    );
  }

  return (
    <div className="font-sans antialiased">
      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0) rotate(12deg); }
            50% { transform: translateY(-20px) rotate(12deg); }
            100% { transform: translateY(0) rotate(12deg); }
          }
          @keyframes float-slow {
            0% { transform: translateY(0) rotate(-6deg); }
            50% { transform: translateY(-15px) rotate(-6deg); }
            100% { transform: translateY(0) rotate(-6deg); }
          }
          @keyframes pulse-slow {
            0% { transform: scale(1); opacity: 0.2; }
            50% { transform: scale(1.1); opacity: 0.25; }
            100% { transform: scale(1); opacity: 0.2; }
          }
          @keyframes slide-in {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-float { animation: float 6s ease-in-out infinite; }
          .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
          .animate-pulse-slow { animation: pulse-slow 10s ease-in-out infinite; }
          .animate-slide-in { animation: slide-in 0.5s ease-out forwards; }
        `}
      </style>
      <Navbar />
      <HeroSection userRole={user?.role} />
      <FeaturedGigsSection userId={user?._id} />
      <RecentGigsSection userId={user?._id} />
      <CategoriesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CTABanner userRole={user?.role} userId={user?._id} />
      <Footer />
    </div>
  );
};

export default Home;
