import React, { useState } from 'react';
import {Link } from 'react-router-dom';

// Mock Data
const gigs = [
  { id: 1, title: "Logo Design", price: "$50", seller: "John D.", rating: 4.5, image: "https://via.placeholder.com/150?format=webp" },
  { id: 2, title: "Python Tutoring", price: "$30/hr", seller: "Sarah K.", rating: 4.8, image: "https://via.placeholder.com/150?format=webp" },
  { id: 3, title: "Website Development", price: "$200", seller: "Mike R.", rating: 4.2, image: "https://via.placeholder.com/150?format=webp" },
  { id: 4, title: "Essay Editing", price: "$25", seller: "Emma L.", rating: 4.7, image: "https://via.placeholder.com/150?format=webp" },
];

const categories = ["Graphic Design", "Coding", "Tutoring", "Writing"];
const testimonials = [
  { id: 1, quote: "Amazing logo design, delivered on time!", user: "A.B.", rating: 5 },
  { id: 2, quote: "Helped me ace my Python exam!", user: "C.D.", rating: 4.8 },
  { id: 3, quote: "Professional and affordable website.", user: "E.F.", rating: 4.5 },
];

// Hero Section Component
function HeroSection() {
  return (
    <div className="bg-gradient-to-b from-navyBlue to-white py-20 text-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-navyBlue mb-4">
          Connect with Student Talent: Hire or Offer Services!
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6">
          Find graphic designers, coders, tutors, and more in your college community.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/signup" className="bg-navyBlue text-white py-2 px-6 rounded-md hover:bg-blue-800 transition-colors" aria-label="Sign up">
            Sign Up
          </Link>
          <Link to="/gigs" className="bg-navyBlue text-white py-2 px-6 rounded-md hover:bg-blue-800 transition-colors" aria-label="Browse gigs">
            Browse Gigs
          </Link>
        </div>
      </div>
    </div>
  );
}

// Search Bar Component
function SearchBar() {
  const [search, setSearch] = useState("");
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8">
      <div className="flex justify-center">
        <div className="w-full max-w-md flex">
          <input
            type="text"
            className="w-full border border-gray-300 rounded-l-md py-2 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-navyBlue"
            placeholder="Search for coding, design, tutoring..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search services"
          />
          <button className="bg-navyBlue text-white py-2 px-4 rounded-r-md hover:bg-blue-800 transition-colors" aria-label="Search">
            Search
          </button>
        </div>
      </div>
    </div>
  );
}

// Gig Card Component
function GigCard({ gig }) {
  return (
    <div className="w-full sm:w-1/2 lg:w-1/4 p-4">
      <div className="bg-white border border-gray-300 rounded-lg shadow-md">
        <img src={gig.image} className="w-full h-40 object-cover rounded-t-lg" alt={gig.title} loading="lazy" />
        <div className="p-4">
          <h5 className="text-lg font-semibold text-navyBlue">{gig.title}</h5>
          <p className="text-gray-700">By {gig.seller}</p>
          <p className="text-navyBlue font-medium">{gig.price}</p>
          <p className="text-gray-700">Rating: {gig.rating} ★</p>
          <Link to={`/gigs/${gig.id}`} className="bg-navyBlue text-white py-2 px-4 rounded-md hover:bg-blue-800 transition-colors mt-2 inline-block" aria-label={`View details for ${gig.title}`}>
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

// Featured Gigs Section
function FeaturedGigs() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-12">
      <h2 className="text-2xl md:text-3xl font-bold text-navyBlue text-center mb-6">Featured Gigs</h2>
      <div className="flex flex-wrap -mx-4">
        {gigs.map((gig) => <GigCard key={gig.id} gig={gig} />)}
      </div>
      <div className="text-center mt-6">
        <Link to="/gigs" className="bg-navyBlue text-white py-2 px-6 rounded-md hover:bg-blue-800 transition-colors" aria-label="View all gigs">
          View All Gigs
        </Link>
      </div>
    </div>
  );
}

// Category Button Component
function CategoryButton({ category }) {
  return (
    <div className="w-full sm:w-1/2 lg:w-1/4 p-4">
      <Link to={`/gigs?category=${category}`} className="bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-navyBlue transition-colors block text-center" aria-label={`Browse ${category}`}>
        {category}
      </Link>
    </div>
  );
}

// Categories Section
function Categories() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-12">
      <h2 className="text-2xl md:text-3xl font-bold text-navyBlue text-center mb-6">Explore Categories</h2>
      <div className="flex flex-wrap -mx-4">
        {categories.map((category) => <CategoryButton key={category} category={category} />)}
      </div>
      <div className="text-center mt-6">
        <Link to="/categories" className="bg-navyBlue text-white py-2 px-6 rounded-md hover:bg-blue-800 transition-colors" aria-label="See all categories">
          See All Categories
        </Link>
      </div>
    </div>
  );
}

// Testimonial Card Component
function TestimonialCard({ testimonial }) {
  return (
    <div className="w-full sm:w-1/2 lg:w-1/3 p-4">
      <div className="bg-white border border-gray-300 rounded-lg shadow-md p-6">
        <p className="text-navyBlue italic">"{testimonial.quote}"</p>
        <p className="text-gray-700 mt-2">— {testimonial.user} ({testimonial.rating} ★)</p>
      </div>
    </div>
  );
}

// Testimonials Section
function Testimonials() {
  return (
    <div className="bg-navyBlue/10 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-navyBlue text-center mb-6">What Our Users Say</h2>
        <div className="flex flex-wrap -mx-4">
          {testimonials.map((testimonial) => <TestimonialCard key={testimonial.id} testimonial={testimonial} />)}
        </div>
      </div>
    </div>
  );
}

// How It Works Step Component
function HowItWorksStep({ title, description, icon }) {
  return (
    <div className="w-full sm:w-1/3 p-4">
      <div className="bg-white border border-gray-300 rounded-lg shadow-md p-6 text-center">
        <i className={`${icon} text-4xl text-navyBlue mb-4`}></i>
        <h5 className="text-lg font-semibold text-navyBlue mb-2">{title}</h5>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
}

// How It Works Section
function HowItWorks() {
  const steps = [
    { title: "Browse or Post Gigs", description: "Find or offer services like coding or tutoring.", icon: "bi bi-search" },
    { title: "Chat & Book", description: "Negotiate and pay securely with Stripe.", icon: "bi bi-chat" },
    { title: "Deliver & Review", description: "Complete the service and share feedback.", icon: "bi bi-check-circle" },
  ];
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-12">
      <h2 className="text-2xl md:text-3xl font-bold text-navyBlue text-center mb-6">How It Works</h2>
      <div className="flex flex-wrap -mx-4">
        {steps.map((step, index) => <HowItWorksStep key={index} {...step} />)}
      </div>
    </div>
  );
}

// Portfolio Teaser Component
function PortfolioTeaser() {
  const portfolios = [
    { id: 1, title: "Graphic Design Sample", image: "https://via.placeholder.com/150?format=webp" },
    { id: 2, title: "Coding Project", image: "https://via.placeholder.com/150?format=webp" },
  ];
  return (
    <div className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-navyBlue text-center mb-6">Showcase Your Work</h2>
        <div className="flex flex-wrap -mx-4">
          {portfolios.map((portfolio) => (
            <div key={portfolio.id} className="w-full sm:w-1/2 lg:w-1/3 p-4">
              <div className="bg-white border border-gray-300 rounded-lg shadow-md">
                <img src={portfolio.image} className="w-full h-40 object-cover rounded-t-lg" alt={portfolio.title} loading="lazy" />
                <div className="p-4">
                  <p className="text-gray-700">{portfolio.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-6">
          <Link to="/signup" className="bg-navyBlue text-white py-2 px-6 rounded-md hover:bg-blue-800 transition-colors" aria-label="Start building your portfolio">
            Start Building Your Portfolio
          </Link>
        </div>
      </div>
    </div>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="bg-navyBlue/10 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
        <p className="mb-4">
          <Link to="/about" className="text-gray-600 hover:text-navyBlue transition-colors mx-2">About</Link> |
          <Link to="/contact" className="text-gray-600 hover:text-navyBlue transition-colors mx-2">Contact</Link> |
          <Link to="/privacy" className="text-gray-600 hover:text-navyBlue transition-colors mx-2">Privacy Policy</Link> |
          <Link to="/terms" className="text-gray-600 hover:text-navyBlue transition-colors mx-2">Terms of Service</Link>
        </p>
        <p>&copy; 2025 Student Services Platform. All rights reserved.</p>
      </div>
    </footer>
  );
}

// Main Home Page Component
function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <SearchBar />
      <FeaturedGigs />
      <Categories />
      <Testimonials />
      <HowItWorks />
      <PortfolioTeaser />
      <Footer />
    </div>
  );
}

export default LandingPage;