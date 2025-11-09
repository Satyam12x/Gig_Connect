import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Home,
  Briefcase,
  MessageCircle,
  Bell,
  Menu,
  X,
  Search,
  Code,
  Users,
  Quote,
  Laptop,
  PenTool,
  BookOpen,
  Linkedin,
  Twitter,
  Instagram,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API_BASE = "http://localhost:5000/api";

const HeroSection = () => {
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
              <div className="absolute inset-0 bg-gradient-to-br from-navyBlue via-purple-600 to-blue-800 rounded-full opacity-20 blur-md animate-spin-slow"></div>
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
                Discover skilled designers, developers, and tutors right in your
                campus community. Hire services or showcase your expertise—all
                in one platform.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link
                to="/signup"
                className="px-8 py-4 bg-navyBlue text-white font-semibold rounded-lg shadow-lg hover:bg-navyBlueLight font-sans"
                style={{ backgroundColor: "#1A2A4F" }}
              >
                Get Started Free
              </Link>
              <button
                className="px-8 py-4 bg-white text-navyBlue font-semibold rounded-lg border-2 border-navyBlue hover:bg-blue-50 hover:text-blue-800 font-sans"
                style={{ color: "#1A2A4F", borderColor: "#1A2A4F" }}
              >
                Browse Services
              </button>
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

const FeaturesSection = () => {
  const features = [
    {
      icon: Search,
      title: "Find Talent",
      description:
        "Browse a diverse pool of student designers, developers, tutors, and more, ready to tackle your projects with fresh ideas.",
      cta: "Explore Talent",
      href: "#explore",
    },
    {
      icon: Code,
      title: "Showcase Skills",
      description:
        "Students can create portfolios to display their expertise, connect with clients, and land exciting gigs.",
      cta: "Build Your Profile",
      href: "#profile",
    },
    {
      icon: Users,
      title: "Campus Community",
      description:
        "Connect with verified students from your campus, fostering local collaboration and trust.",
      cta: "Join the Community",
      href: "#community",
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
            Why Choose Gig Connect?
          </h2>
          <p
            className="mt-4 text-lg text-navyBlueMedium max-w-3xl mx-auto font-sans"
            style={{ color: "#2A3A6F" }}
          >
            Empower your projects with talented students or showcase your skills
            to the world, all within a trusted campus network.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-lg border border-blue-100 flex flex-col items-center text-center hover:bg-blue-50 hover:border-navyBlue hover:shadow-xl transition-all duration-300"
              >
                <Icon
                  className="text-navyBlueLight mb-4 hover:text-navyBlue"
                  size={40}
                  style={{ color: "#3A4A7F" }}
                />
                <h3
                  className="text-xl font-semibold text-navyBlue mb-2 font-sans"
                  style={{ color: "#1A2A4F" }}
                >
                  {feature.title}
                </h3>
                <p
                  className="text-navyBlueMedium mb-6 font-sans"
                  style={{ color: "#2A3A6F" }}
                >
                  {feature.description}
                </p>
                <a
                  href={feature.href}
                  className="px-6 py-3 bg-navyBlue text-white font-semibold rounded-lg hover:bg-navyBlueLight font-sans"
                  style={{ backgroundColor: "#1A2A4F" }}
                >
                  {feature.cta}
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const FeaturedGigsSection = () => {
  const gigs = [
    {
      icon: Laptop,
      title: "Web Development",
      description:
        "Get a responsive, modern website built with the latest technologies like React and Node.js.",
      provider: "Satyam Pandey",
      cta: "Hire Now",
      href: "#hire-web",
    },
    {
      icon: PenTool,
      title: "Graphic Design",
      description:
        "Professional logos, posters, and branding materials tailored to your needs.",
      provider: "Apoorva Sharma",
      cta: "Hire Now",
      href: "#hire-design",
    },
    {
      icon: BookOpen,
      title: "Math Tutoring",
      description:
        "Personalized tutoring sessions for calculus, algebra, or statistics to boost your grades.",
      provider: "Rohan Mehta",
      cta: "Book Session",
      href: "#hire-tutor",
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
            Featured Gigs
          </h2>
          <p
            className="mt-4 text-lg text-navyBlueMedium max-w-3xl mx-auto font-sans"
            style={{ color: "#2A3A6F" }}
          >
            Explore top services offered by talented students like Satyam Pandey
            and Apoorva Sharma.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {gigs.map((gig, index) => {
            const Icon = gig.icon;
            return (
              <div
                key={index}
                className="group bg-white p-6 rounded-lg shadow-lg border border-blue-100 flex flex-col items-center text-center hover:bg-blue-50 hover:border-navyBlueLight hover:shadow-2xl transition-all duration-300"
              >
                <Icon
                  className="text-navyBlueLight mb-4 group-hover:text-navyBlue group-hover:rotate-12"
                  size={40}
                  style={{ color: "#3A4A7F" }}
                />
                <h3
                  className="text-xl font-semibold text-navyBlue mb-2 font-sans"
                  style={{ color: "#1A2A4F" }}
                >
                  {gig.title}
                </h3>
                <p
                  className="text-navyBlueMedium mb-4 font-sans"
                  style={{ color: "#2A3A6F" }}
                >
                  {gig.description}
                </p>
                <p
                  className="text-navyBlue font-medium mb-4 font-sans"
                  style={{ color: "#1A2A4F" }}
                >
                  By {gig.provider}
                </p>
                <a
                  href={gig.href}
                  className="px-6 py-3 bg-navyBlue text-white font-semibold rounded-lg hover:bg-navyBlueLight group-hover:ring-2 group-hover:ring-navyBlueLight font-sans"
                  style={{ backgroundColor: "#1A2A4F" }}
                >
                  {gig.cta}
                </a>
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
                  <div className="bg-white p-6 rounded-lg shadow-lg border border-blue-100 flex flex-col items-center text-center hover:bg-blue-50 hover:border-navyBlue hover:shadow-xl transition-all duration-300 w-full max-w-lg">
                    <Quote
                      className="text-navyBlueLight mb-4 hover:text-navyBlue"
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
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-navyBlue text-white p-2 rounded-full hover:bg-navyBlueLight focus:outline-none focus:ring-2 focus:ring-navyBlueLight"
            aria-label="Previous testimonial"
            style={{ backgroundColor: "#1A2A4F", color: "#FFFFFF" }}
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-navyBlue text-white p-2 rounded-full hover:bg-navyBlueLight focus:outline-none focus:ring-2 focus:ring-navyBlueLight"
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
                } hover:bg-navyBlueLight focus:outline-none focus:ring-2 focus:ring-navyBlueLight`}
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

const LandingPage = () => {
  return (
    <div className="font-sans antialiased">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <FeaturedGigsSection />
      <TestimonialsSection />
      <Footer />
    </div>
  );
};

export default LandingPage;
