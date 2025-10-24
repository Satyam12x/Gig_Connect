import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Star,
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

  const message = userRole === "Seller" 
    ? "Showcase your skills and start earning with gigs!"
    : userRole === "Buyer" 
      ? "Hire talented students for your projects!"
      : "Discover or offer services in your campus community!";

  return (
    <div className="relative min-h-screen bg-white overflow-hidden pt-16">
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-[-5%] right-[-5%] w-1/3 h-1/3 bg-gradient-to-br from-navyBlue to-blue-800 opacity-15 filter blur-3xl transform rotate-12"
          style={{
            clipPath:
              "polygon(30% 0%, 70% 20%, 100% 60%, 70% 100%, 30% 80%, 0% 40%)",
          }}
        ></div>
        <div
          className="absolute bottom-[-10%] right-[-5%] w-1/4 h-1/4 bg-gradient-to-tr from-purple-600 to-navyBlue opacity-10 filter blur-3xl transform -rotate-6"
          style={{
            clipPath:
              "polygon(20% 0%, 80% 0%, 100% 50%, 80% 100%, 20% 100%, 0% 50%)",
          }}
        ></div>
        <div
          className="absolute top-1/2 right-1/4 w-1/4 h-1/4 bg-gradient-to-bl from-blue-800 to-purple-600 opacity-10 filter blur-3xl transform rotate-45"
          style={{
            clipPath:
              "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
          }}
        ></div>
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="flex justify-center md:justify-end order-first md:order-last">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-navyBlue via-purple-600 to-blue-800 rounded-full opacity-20 blur-md"></div>
              <div
                className="relative w-64 h-64 sm:w-96 sm:h-96 rounded-full overflow-hidden shadow-2xl border-[2px] border-navyBlue"
                style={{ borderColor: "#1A2A4F" }}
              >
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=800&fit=crop"
                  alt="Students collaborating"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white px-6 py-4 rounded-2xl shadow-xl border-2 border-blue-100">
                <p
                  className="text-sm text-navyBlueMedium font-sans"
                  style={{ color: "#2A3A6F" }}
                >
                  Trusted by
                </p>
                <p
                  className="text-2xl font-bold text-navyBlue font-sans"
                  style={{ color: "#1A2A4F" }}
                >
                  50+ Colleges
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-8 text-center md:text-left">
            <div className="space-y-4">
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navyBlue font-sans"
                style={{ color: "#1A2A4F" }}
              >
                Connect with
                <span
                  className="block text-navyBlueLight font-extrabold"
                  style={{ color: "#3A4A7F" }}
                >
                  Student Talent
                </span>
              </h1>
              <p
                className="text-lg sm:text-xl text-navyBlueMedium max-w-2xl mx-auto md:mx-0 font-sans"
                style={{ color: "#2A3A6F" }}
              >
                {message}
              </p>
            </div>
            <form onSubmit={handleSearch} className="flex max-w-md mx-auto md:mx-0">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for gigs..."
                className="flex-grow p-3 rounded-l-lg border-2 border-r-0 border-navyBlue focus:outline-none focus:border-navyBlueLight"
                style={{ borderColor: "#1A2A4F", color: "#2A3A6F" }}
                aria-label="Search gigs"
              />
              <button
                type="submit"
                className="px-4 py-3 bg-navyBlue text-white rounded-r-lg hover:bg-navyBlueLight transition-colors duration-300"
                style={{ backgroundColor: "#1A2A4F", color: "#FFFFFF" }}
                aria-label="Submit search"
              >
                <Search size={20} />
              </button>
            </form>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link
                to="/signup"
                className="px-8 py-4 bg-navyBlue text-white font-semibold rounded-lg hover:bg-navyBlueLight font-sans transition-colors duration-300"
                style={{ backgroundColor: "#1A2A4F", color: "#FFFFFF" }}
              >
                Get Started Free
              </Link>
              <Link
                to="/gigs"
                className="px-8 py-4 bg-white text-navyBlue font-semibold rounded-lg border-2 border-navyBlue hover:bg-blue-50 hover:text-navyBlueLight font-sans transition-colors duration-300"
                style={{ color: "#1A2A4F", borderColor: "#1A2A4F" }}
              >
                Browse Gigs
              </Link>
            </div>
            <div className="flex flex-wrap gap-8 justify-center md:justify-start pt-8">
              <div className="text-center md:text-left">
                <p
                  className="text-3xl font-bold text-navyBlue font-sans"
                  style={{ color: "#1A2A4F" }}
                >
                  5,000+
                </p>
                <p
                  className="text-navyBlueMedium font-sans"
                  style={{ color: "#2A3A6F" }}
                >
                  Active Students
                </p>
              </div>
              <div className="text-center md:text-left">
                <p
                  className="text-3xl font-bold text-navyBlue font-sans"
                  style={{ color: "#1A2A4F" }}
                >
                  10,000+
                </p>
                <p
                  className="text-navyBlueMedium font-sans"
                  style={{ color: "#2A3A6F" }}
                >
                  Projects Completed
                </p>
              </div>
              <div className="text-center md:text-left">
                <p
                  className="text-3xl font-bold text-navyBlue font-sans"
                  style={{ color: "#1A2A4F" }}
                >
                  4.9/5
                </p>
                <p
                  className="text-navyBlueMedium font-sans"
                  style={{ color: "#2A3A6F" }}
                >
                  Average Rating
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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
        setGigs(gigsResponse.data.slice(0, 4)); // Limit to 4 featured gigs
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
    <div className="relative bg-white py-16 sm:py-24 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-[-5%] left-[-5%] w-1/3 h-1/3 bg-gradient-to-br from-navyBlue to-blue-800 opacity-15 filter blur-3xl transform rotate-12"
          style={{
            clipPath:
              "polygon(30% 0%, 70% 20%, 100% 60%, 70% 100%, 30% 80%, 0% 40%)",
          }}
        ></div>
        <div
          className="absolute bottom-[-10%] left-[-5%] w-1/4 h-1/4 bg-gradient-to-tr from-purple-600 to-navyBlue opacity-10 filter blur-3xl transform -rotate-6"
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
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2
            className="text-3xl sm:text-4xl font-bold text-navyBlue font-sans"
            style={{ color: "#1A2A4F" }}
          >
            Featured Gigs
          </h2>
          <p
            className="mt-4 text-lg text-navyBlueMedium max-w-3xl mx-auto font-sans"
            style={{ color: "#2A3A6F" }}
          >
            Discover top services offered by talented students in your campus
            community.
          </p>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="bg-white bg-opacity-70 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-blue-100 animate-pulse"
                style={{
                  clipPath:
                    "polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)",
                }}
              >
                <div className="w-16 h-16 rounded-full bg-gray-200 mx-auto mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="flex justify-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-4 h-4 bg-gray-200 rounded-full mx-1"></div>
                  ))}
                </div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-10 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div
            className="text-center text-red-500 font-sans"
            style={{ color: "#DC2626" }}
          >
            {error}
          </div>
        ) : gigs.length === 0 ? (
          <div
            className="text-center text-navyBlueMedium font-sans"
            style={{ color: "#2A3A6F" }}
          >
            No gigs available at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {gigs.map((gig) => {
              const status = getApplicationStatus(gig._id);
              return (
                <div
                  key={gig._id}
                  className="bg-white bg-opacity-70 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-blue-100 hover:bg-blue-50 hover:border-navyBlueLight transition-colors duration-300 text-center"
                  style={{
                    clipPath:
                      "polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)",
                  }}
                >
                  {gig.thumbnail ? (
                    <img
                      src={gig.thumbnail}
                      alt={gig.title}
                      className="w-16 h-16 rounded-full mx-auto mb-4 object-cover"
                    />
                  ) : (
                    <div
                      className="w-16 h-16 rounded-full bg-gradient-to-br from-navyBlue to-blue-800 mx-auto mb-4 flex items-center justify-center text-white text-xl font-bold font-sans"
                      style={{ backgroundColor: "#1A2A4F" }}
                    >
                      {gig.title.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <h3
                    className="text-xl font-semibold text-navyBlue mb-2 font-sans"
                    style={{ color: "#1A2A4F" }}
                  >
                    {gig.title}
                  </h3>
                  <p
                    className="text-navyBlueMedium mb-2 font-sans"
                    style={{ color: "#2A3A6F" }}
                  >
                    By{" "}
                    <Link
                      to={`/profile/${gig.sellerId}`}
                      className="hover:underline"
                    >
                      {gig.sellerName}
                    </Link>
                  </p>
                  <div className="flex justify-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={
                          i < Math.round(gig.rating || 0)
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }
                        fill={
                          i < Math.round(gig.rating || 0) ? "#FFD700" : "none"
                        }
                        size={16}
                      />
                    ))}
                  </div>
                  <p
                    className="text-navyBlueMedium mb-2 font-sans"
                    style={{ color: "#2A3A6F" }}
                  >
                    From ${gig.price}
                  </p>
                  <p
                    className="text-navyBlueMedium mb-2 font-sans"
                    style={{ color: "#2A3A6F" }}
                  >
                    Status: {gig.status.charAt(0).toUpperCase() + gig.status.slice(1)}
                  </p>
                  {status && (
                    <p
                      className={`text-sm font-semibold mb-2 font-sans ${
                        status === "accepted"
                          ? "text-green-600"
                          : status === "rejected"
                          ? "text-red-600"
                          : "text-yellow-600"
                      }`}
                    >
                      Application: {status.charAt(0).toUpperCase() + status.slice(1)}
                    </p>
                  )}
                  <p
                    className="text-navyBlueMedium mb-4 font-sans line-clamp-2"
                    style={{ color: "#2A3A6F" }}
                  >
                    {gig.description}
                  </p>
                  <p
                    className="text-sm text-navyBlueMedium mb-4 font-sans"
                    style={{ color: "#2A3A6F" }}
                  >
                    {gig.category}
                  </p>
                  <Link
                    to={`/gigs/${gig._id}`}
                    className="px-6 py-3 bg-navyBlue text-white font-semibold rounded-lg hover:bg-navyBlueLight font-sans transition-colors duration-300"
                    style={{ backgroundColor: "#1A2A4F", color: "#FFFFFF" }}
                    aria-label={`View details for ${gig.title}`}
                  >
                    View Details
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const RecentGigsSection = ({ userId }) => {
  const [gigs, setGigs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
        setGigs(gigsResponse.data.slice(0, 6)); // Limit to 6 recent gigs
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
    <div className="relative bg-white py-16 sm:py-24 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-[-5%] left-[-5%] w-1/3 h-1/3 bg-gradient-to-br from-navyBlue to-blue-800 opacity-15 filter blur-3xl transform rotate-12"
          style={{
            clipPath:
              "polygon(30% 0%, 70% 20%, 100% 60%, 70% 100%, 30% 80%, 0% 40%)",
          }}
        ></div>
        <div
          className="absolute bottom-[-10%] left-[-5%] w-1/4 h-1/4 bg-gradient-to-tr from-purple-600 to-navyBlue opacity-10 filter blur-3xl transform -rotate-6"
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
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2
            className="text-3xl sm:text-4xl font-bold text-navyBlue font-sans"
            style={{ color: "#1A2A4F" }}
          >
            Recently Uploaded Gigs
          </h2>
          <p
            className="mt-4 text-lg text-navyBlueMedium max-w-3xl mx-auto font-sans"
            style={{ color: "#2A3A6F" }}
          >
            Check out the latest services posted by talented students.
          </p>
        </div>
        {loading ? (
          <div className="flex overflow-x-auto gap-8 pb-4">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="min-w-[280px] bg-white bg-opacity-70 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-blue-100 animate-pulse"
                style={{
                  clipPath:
                    "polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)",
                }}
              >
                <div className="w-16 h-16 rounded-full bg-gray-200 mx-auto mb-4"></div>
                <div className="h-5 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="flex justify-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-4 h-4 bg-gray-200 rounded-full mx-1"></div>
                  ))}
                </div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-10 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div
            className="text-center text-red-500 font-sans"
            style={{ color: "#DC2626" }}
          >
            {error}
          </div>
        ) : gigs.length === 0 ? (
          <div
            className="text-center text-navyBlueMedium font-sans"
            style={{ color: "#2A3A6F" }}
          >
            No recent gigs available.
          </div>
        ) : (
          <>
            <div className="flex overflow-x-auto gap-8 pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-navyBlue scrollbar-track-blue-100">
              {gigs.map((gig) => {
                const status = getApplicationStatus(gig._id);
                return (
                  <div
                    key={gig._id}
                    className="min-w-[280px] snap-center bg-white bg-opacity-70 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-blue-100 hover:bg-blue-50 hover:border-navyBlueLight transition-colors duration-300 text-center"
                    style={{
                      clipPath:
                        "polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)",
                    }}
                  >
                    {gig.thumbnail ? (
                      <img
                        src={gig.thumbnail}
                        alt={gig.title}
                        className="w-16 h-16 rounded-full mx-auto mb-4 object-cover"
                      />
                    ) : (
                      <div
                        className="w-16 h-16 rounded-full bg-gradient-to-br from-navyBlue to-blue-800 mx-auto mb-4 flex items-center justify-center text-white text-xl font-bold font-sans"
                        style={{ backgroundColor: "#1A2A4F" }}
                      >
                        {gig.title.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <h3
                      className="text-lg font-semibold text-navyBlue mb-2 font-sans"
                      style={{ color: "#1A2A4F" }}
                    >
                      {gig.title}
                    </h3>
                    <p
                      className="text-navyBlueMedium mb-2 font-sans"
                      style={{ color: "#2A3A6F" }}
                    >
                      By{" "}
                      <Link
                        to={`/profile/${gig.sellerId}`}
                        className="hover:underline"
                      >
                        {gig.sellerName}
                      </Link>
                    </p>
                    <div className="flex justify-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={
                            i < Math.round(gig.rating || 0)
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }
                          fill={
                            i < Math.round(gig.rating || 0) ? "#FFD700" : "none"
                          }
                          size={14}
                        />
                      ))}
                    </div>
                    <p
                      className="text-navyBlueMedium mb-2 font-sans"
                      style={{ color: "#2A3A6F" }}
                    >
                      From ${gig.price}
                    </p>
                    <p
                      className="text-navyBlueMedium mb-2 font-sans"
                      style={{ color: "#2A3A6F" }}
                    >
                      Status: {gig.status.charAt(0).toUpperCase() + gig.status.slice(1)}
                    </p>
                    {status && (
                      <p
                        className={`text-sm font-semibold mb-2 font-sans ${
                          status === "accepted"
                            ? "text-green-600"
                            : status === "rejected"
                            ? "text-red-600"
                            : "text-yellow-600"
                        }`}
                      >
                        Application: {status.charAt(0).toUpperCase() + status.slice(1)}
                      </p>
                    )}
                    <p
                      className="text-navyBlueMedium mb-4 font-sans line-clamp-2"
                      style={{ color: "#2A3A6F" }}
                    >
                      {gig.description}
                    </p>
                    <p
                      className="text-sm text-navyBlueMedium mb-4 font-sans"
                      style={{ color: "#2A3A6F" }}
                    >
                      {gig.category}
                    </p>
                    <Link
                      to={`/gigs/${gig._id}`}
                      className="px-6 py-3 bg-navyBlue text-white font-semibold rounded-lg hover:bg-navyBlueLight font-sans transition-colors duration-300"
                      style={{ backgroundColor: "#1A2A4F", color: "#FFFFFF" }}
                      aria-label={`View details for ${gig.title}`}
                    >
                      View Details
                    </Link>
                  </div>
                );
              })}
            </div>
            <div className="text-center mt-8">
              <Link
                to="/gigs"
                className="px-8 py-4 bg-navyBlue text-white font-semibold rounded-lg hover:bg-navyBlueLight font-sans transition-colors duration-300"
                style={{ backgroundColor: "#1A2A4F", color: "#FFFFFF" }}
                aria-label="Explore more gigs"
              >
                Explore More
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
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
        const response = await axios.get(`${API_BASE}/gigs`, {
          params: { page: 1, limit: 100 }, // Fetch enough gigs to get categories
        });
        const gigs = response.data.gigs || [];
        const uniqueCategories = [...new Set(gigs.map((gig) => gig.category))];
        setCategories(uniqueCategories);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch categories");
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="relative bg-white py-16 sm:py-24 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-[-5%] left-[-5%] w-1/3 h-1/3 bg-gradient-to-br from-navyBlue to-blue-800 opacity-15 filter blur-3xl transform rotate-12"
          style={{
            clipPath:
              "polygon(30% 0%, 70% 20%, 100% 60%, 70% 100%, 30% 80%, 0% 40%)",
          }}
        ></div>
        <div
          className="absolute bottom-[-10%] left-[-5%] w-1/4 h-1/4 bg-gradient-to-tr from-purple-600 to-navyBlue opacity-10 filter blur-3xl transform -rotate-6"
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
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2
            className="text-3xl sm:text-4xl font-bold text-navyBlue font-sans"
            style={{ color: "#1A2A4F" }}
          >
            Explore Categories
          </h2>
          <p
            className="mt-4 text-lg text-navyBlueMedium max-w-3xl mx-auto font-sans"
            style={{ color: "#2A3A6F" }}
          >
            Find the perfect service for your needs from a variety of student
            talent categories.
          </p>
        </div>
        {loading ? (
          <div className="flex flex-wrap justify-center gap-8">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="w-32 h-32 bg-white bg-opacity-70 backdrop-blur-lg rounded-full flex flex-col items-center justify-center animate-pulse"
                style={{ clipPath: "circle(50%)" }}
              >
                <div className="w-6 h-6 bg-gray-200 rounded-full mb-2"></div>
                <div className="w-20 h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div
            className="text-center text-red-500 font-sans"
            style={{ color: "#DC2626" }}
          >
            {error}
          </div>
        ) : categories.length === 0 ? (
          <div
            className="text-center text-navyBlueMedium font-sans"
            style={{ color: "#2A3A6F" }}
          >
            No categories available.
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-8">
            {categories.map((category, index) => {
              const Icon = categoryIcons[category] || Users; // Fallback icon
              return (
                <Link
                  key={index}
                  to={`/gigs?category=${encodeURIComponent(category)}`}
                  className="w-32 h-32 bg-white bg-opacity-70 backdrop-blur-lg rounded-full flex flex-col items-center justify-center text-navyBlue hover:bg-blue-50 hover:text-navyBlueLight transition-colors duration-300"
                  style={{ clipPath: "circle(50%)" }}
                  aria-label={`Explore ${category} gigs`}
                >
                  <Icon size={24} style={{ color: "#3A4A7F" }} />
                  <span
                    className="text-sm font-medium mt-2 text-center font-sans"
                    style={{ color: "#1A2A4F" }}
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
    <div className="relative bg-white py-16 sm:py-24 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-[-5%] left-[-5%] w-1/3 h-1/3 bg-gradient-to-br from-navyBlue to-blue-800 opacity-15 filter blur-3xl transform rotate-12"
          style={{
            clipPath:
              "polygon(30% 0%, 70% 20%, 100% 60%, 70% 100%, 30% 80%, 0% 40%)",
          }}
        ></div>
        <div
          className="absolute bottom-[-10%] left-[-5%] w-1/4 h-1/4 bg-gradient-to-tr from-purple-600 to-navyBlue opacity-10 filter blur-3xl transform -rotate-6"
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
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2
            className="text-3xl sm:text-4xl font-bold text-navyBlue font-sans"
            style={{ color: "#1A2A4F" }}
          >
            How It Works
          </h2>
          <p
            className="mt-4 text-lg text-navyBlueMedium max-w-3xl mx-auto font-sans"
            style={{ color: "#2A3A6F" }}
          >
            Getting started with Gig Connect is easy and seamless.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="bg-white bg-opacity-70 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-blue-100 hover:bg-blue-50 hover:border-navyBlueLight transition-colors duration-300 text-center"
                style={{
                  clipPath:
                    "polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)",
                }}
              >
                <Icon
                  size={32}
                  className="text-navyBlueLight mx-auto mb-4"
                  style={{ color: "#3A4A7F" }}
                />
                <h3
                  className="text-xl font-semibold text-navyBlue mb-2 font-sans"
                  style={{ color: "#1A2A4F" }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-navyBlueMedium font-sans"
                  style={{ color: "#2A3A6F" }}
                >
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
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

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowRight") {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
      } else if (event.key === "ArrowLeft") {
        setCurrentIndex(
          (prevIndex) =>
            (prevIndex - 1 + testimonials.length) % testimonials.length
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [testimonials.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  return (
    <div className="relative bg-white py-16 sm:py-24 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-[-5%] right-[-5%] w-1/3 h-1/3 bg-gradient-to-br from-navyBlue to-blue-800 opacity-15 filter blur-3xl transform rotate-12"
          style={{
            clipPath:
              "polygon(30% 0%, 70% 20%, 100% 60%, 70% 100%, 30% 80%, 0% 40%)",
          }}
        ></div>
        <div
          className="absolute bottom-[-10%] right-[-5%] w-1/4 h-1/4 bg-gradient-to-tr from-purple-600 to-navyBlue opacity-10 filter blur-3xl transform -rotate-6"
          style={{
            clipPath:
              "polygon(20% 0%, 80% 0%, 100% 50%, 80% 100%, 20% 100%, 0% 50%)",
          }}
        ></div>
        <div
          className="absolute top-1/2 right-1/4 w-1/4 h-1/4 bg-gradient-to-bl from-blue-800 to-purple-600 opacity-10 filter blur-3xl transform rotate-45"
          style={{
            clipPath:
              "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
          }}
        ></div>
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2
            className="text-3xl sm:text-4xl font-bold text-navyBlue font-sans"
            style={{ color: "#1A2A4F" }}
          >
            What Our Users Say
          </h2>
          <p
            className="mt-4 text-lg text-navyBlueMedium max-w-3xl mx-auto font-sans"
            style={{ color: "#2A3A6F" }}
          >
            Hear from students and clients who have transformed their projects
            through Gig Connect.
          </p>
        </div>
        <div className="relative max-w-3xl mx-auto">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={index} className="min-w-full flex justify-center">
                  <div
                    className="bg-white bg-opacity-70 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-blue-100 hover:bg-blue-50 hover:border-navyBlueLight transition-colors duration-300 text-center w-full max-w-lg"
                    style={{
                      clipPath:
                        "polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)",
                    }}
                  >
                    <Quote
                      className="text-navyBlueLight mb-4"
                      size={40}
                      style={{ color: "#3A4A7F" }}
                    />
                    <p
                      className="text-navyBlueMedium mb-4 font-sans"
                      style={{ color: "#2A3A6F" }}
                    >
                      "{testimonial.quote}"
                    </p>
                    <p
                      className="text-navyBlue font-semibold font-sans"
                      style={{ color: "#1A2A4F" }}
                    >
                      {testimonial.author}
                    </p>
                    <p
                      className="text-navyBlueMedium text-sm font-sans"
                      style={{ color: "#2A3A6F" }}
                    >
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-navyBlue text-white p-2 rounded-full hover:bg-navyBlueLight transition-colors duration-300"
            aria-label="Previous testimonial"
            style={{ backgroundColor: "#1A2A4F", color: "#FFFFFF" }}
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-navyBlue text-white p-2 rounded-full hover:bg-navyBlueLight transition-colors duration-300"
            aria-label="Next testimonial"
            style={{ backgroundColor: "#1A2A4F", color: "#FFFFFF" }}
          >
            <ChevronRight size={24} />
          </button>
          <div className="flex justify-center mt-6 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full ${
                  index === currentIndex ? "bg-navyBlue" : "bg-gray-300"
                } hover:bg-navyBlueLight transition-colors duration-300`}
                aria-label={`Go to testimonial ${index + 1}`}
                style={{
                  backgroundColor:
                    index === currentIndex ? "#1A2A4F" : "#D1D5DB",
                }}
              ></button>
            ))}
          </div>
        </div>
      </div>
    </div>
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

  const ctaMessage = userRole === "Seller"
    ? "Post your first gig and reach clients today!"
    : userRole === "Buyer"
      ? "Find the perfect student talent for your project!"
      : "Join Gig Connect to find or post gigs in your campus!";

  return (
    <div className="relative bg-navyBlue py-16 sm:py-24 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-[-5%] left-[-5%] w-1/3 h-1/3 bg-gradient-to-br from-blue-800 to-purple-600 opacity-15 filter blur-3xl transform rotate-12"
          style={{
            clipPath:
              "polygon(30% 0%, 70% 20%, 100% 60%, 70% 100%, 30% 80%, 0% 40%)",
          }}
        ></div>
        <div
          className="absolute bottom-[-10%] left-[-5%] w-1/4 h-1/4 bg-gradient-to-tr from-purple-600 to-blue-800 opacity-10 filter blur-3xl transform -rotate-6"
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
        <p className="mt-4 text-lg text-blue-200 max-w-3xl mx-auto font-sans">
          {ctaMessage}
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/gigs"
            className="px-8 py-4 bg-white text-navyBlue font-semibold rounded-lg hover:bg-blue-50 hover:text-navyBlueLight font-sans transition-colors duration-300"
            style={{ color: "#1A2A4F", backgroundColor: "#FFFFFF" }}
            aria-label="Find a gig"
          >
            Find a Gig
          </Link>
          {!loading && userRole !== "Buyer" && (
            <Link
              to="/create-gig"
              className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 font-sans transition-colors duration-300"
              style={{ backgroundColor: "#2563EB", color: "#FFFFFF" }}
              aria-label="Post a gig"
            >
              Post a Gig
            </Link>
          )}
        </div>
      </div>
    </div>
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
        setUser(null);
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2
          className="animate-spin"
          size={32}
          style={{ color: "#1A2A4F" }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center text-red-500 font-sans"
        style={{ color: "#DC2626" }}
      >
        {error}
      </div>
    );
  }

  return (
    <div className="font-sans antialiased">
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