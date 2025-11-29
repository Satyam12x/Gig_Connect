import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Rocket,
  Code2,
  Users2,
  Zap,
  ArrowRight,
  Play,
  CheckCircle2,
  Laptop,
  PenTool,
  BookOpen,
  Quote,
  ChevronLeft,
  ChevronRight,
  MousePointer2,
  Shield,
  Clock,
  Award,
  MessageCircle,
  Briefcase,
  GraduationCap,
  Target,
  Lightbulb,
  Globe,
  Check,
  TrendingUp,
  Heart,
  Search,
  Plane,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const theme = {
  primary: "#1A2A4F",
  primaryLight: "#2A3A6F",
  primaryMedium: "#3A4A7F",
  primarySoft: "#4A5A8F",
  accent: "#5B6B9F",
  light: "#E8EBF2",
  lighter: "#F4F6FA",
  white: "#FFFFFF",
};

const FadeIn = ({ children, delay = 0, direction = "up", className = "" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const directions = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { x: 40, y: 0 },
    right: { x: -40, y: 0 },
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...directions[direction] }}
      animate={isInView ? { opacity: 1, y: 0, x: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const AnimatedHeading = ({ text, className, delay = 0 }) => {
  const words = text.split(" ");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <span ref={ref} className={`inline-flex flex-wrap ${className}`}>
      {words.map((word, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: delay + index * 0.1 }}
          className="inline-block mr-2"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
};

// Intro Animation with Airplane
const IntroAnimation = ({ onComplete }) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 100),
      setTimeout(() => setPhase(2), 1800),
      setTimeout(() => setPhase(3), 2800),
      setTimeout(() => onComplete(), 3500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase < 3 && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: theme.lighter }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Background Decorations */}
          <div className="absolute inset-0">
            {/* Clouds */}
            <motion.div
              className="absolute top-20 left-10 w-32 h-16 rounded-full opacity-60"
              style={{ backgroundColor: theme.white }}
              animate={{ x: [0, 20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute top-32 right-20 w-40 h-20 rounded-full opacity-50"
              style={{ backgroundColor: theme.white }}
              animate={{ x: [0, -15, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute bottom-40 left-1/4 w-24 h-12 rounded-full opacity-40"
              style={{ backgroundColor: theme.white }}
              animate={{ x: [0, 10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          {/* Airplane Animation */}
          <motion.div
            className="absolute"
            initial={{ x: "-100vw", y: 50 }}
            animate={
              phase >= 1
                ? phase >= 2
                  ? { x: "100vw", y: -100, rotate: 5 }
                  : { x: 0, y: 0, rotate: 0 }
                : {}
            }
            transition={{
              duration: phase >= 2 ? 1 : 1.5,
              ease: phase >= 2 ? "easeIn" : "easeOut",
            }}
          >
            {/* Trail */}
            <motion.div
              className="absolute right-full top-1/2 -translate-y-1/2 h-0.5 origin-right"
              style={{ backgroundColor: theme.primaryMedium }}
              initial={{ width: 0, opacity: 0 }}
              animate={phase >= 1 ? { width: 150, opacity: 0.4 } : {}}
              transition={{ delay: 0.3, duration: 0.5 }}
            />

            {/* Plane */}
            <Plane
              className="w-16 h-16"
              style={{ color: theme.primary }}
              strokeWidth={1.5}
            />
          </motion.div>

          {/* Center Content - Logo & Text */}
          {phase >= 1 && phase < 2 && (
            <motion.div
              className="text-center z-10"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
            >
              {/* Logo Icon */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-6"
              >
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto shadow-lg"
                  style={{ backgroundColor: theme.primary }}
                >
                  <Briefcase className="w-10 h-10 text-white" />
                </div>
              </motion.div>

              {/* Brand Name */}
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-5xl font-bold mb-3"
                style={{ color: theme.primary }}
              >
                Gig Connect
              </motion.h1>

              {/* Tagline */}
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-lg"
                style={{ color: theme.primaryMedium }}
              >
                Where Talent Meets Opportunity
              </motion.p>
            </motion.div>
          )}

          {/* Loading Progress */}
          <motion.div
            className="absolute bottom-16 left-1/2 -translate-x-1/2 w-48"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div
              className="h-1 rounded-full overflow-hidden"
              style={{ backgroundColor: theme.light }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: theme.primary }}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.5, ease: "easeInOut" }}
              />
            </div>
            <motion.p
              className="text-sm text-center mt-3"
              style={{ color: theme.primaryMedium }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Loading amazing experiences...
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Hero Section
// Hero Section
const HeroSection = () => {
  const stats = [
    { value: "50,000+", label: "Active Users" },
    { value: "100,000+", label: "Gigs Completed" },
    { value: "500+", label: "Universities" },
  ];

  return (
    <section
      className="relative min-h-screen flex items-center pt-20"
      style={{ backgroundColor: theme.white }}
    >
      {/* Subtle Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-0 right-0 w-1/2 h-full opacity-50"
          style={{
            background: `linear-gradient(135deg, ${theme.lighter} 0%, transparent 60%)`,
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-30 blur-3xl"
          style={{ backgroundColor: theme.light }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div className="space-y-8 text-center lg:text-left">
            {/* Badge */}
            <FadeIn delay={0.1}>
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                style={{ backgroundColor: theme.lighter }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: theme.primary }}
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: theme.primary }}
                >
                  #1 Student Freelancing Platform
                </span>
              </div>
            </FadeIn>

            {/* Heading */}
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                <AnimatedHeading
                  text="Connect With"
                  className="block"
                  style={{ color: theme.primary }}
                  delay={0.2}
                />
                <AnimatedHeading
                  text="Student Talent"
                  className="block"
                  style={{ color: theme.primaryMedium }}
                  delay={0.4}
                />
              </h1>
            </div>

            {/* Description */}
            <FadeIn delay={0.5}>
              <p
                className="text-lg leading-relaxed max-w-xl mx-auto lg:mx-0"
                style={{ color: theme.primaryLight }}
              >
                Discover skilled designers, developers, and tutors from your
                campus community. Hire services or showcase your expertise—all
                in one trusted platform.
              </p>
            </FadeIn>

            {/* CTA Buttons */}
            <FadeIn delay={0.6}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/signup"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                  style={{ backgroundColor: theme.primary }}
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold border-2 transition-all duration-300 hover:shadow-md"
                  style={{
                    color: theme.primary,
                    borderColor: theme.primary,
                    backgroundColor: "transparent",
                  }}
                >
                  <Play className="w-5 h-5" />
                  Watch Demo
                </button>
              </div>
            </FadeIn>

            {/* Stats */}
            <FadeIn delay={0.7}>
              <div className="flex flex-wrap gap-8 pt-4 justify-center lg:justify-start">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center lg:text-left">
                    <p
                      className="text-3xl font-bold"
                      style={{ color: theme.primary }}
                    >
                      {stat.value}
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: theme.primaryMedium }}
                    >
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>

          {/* Right Content - Image (Hidden on mobile/tablet) */}
          <FadeIn delay={0.3} direction="left" className="hidden lg:block">
            <div className="relative">
              {/* Background Shape - Same as page background */}
              <div
                className="absolute -inset-8 rounded-full opacity-60 blur-3xl"
                style={{ backgroundColor: theme.lighter }}
              />

              {/* Decorative Elements */}
              <div
                className="absolute -top-6 -left-6 w-24 h-24 rounded-2xl opacity-20"
                style={{ backgroundColor: theme.primary }}
              />
              <div
                className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full opacity-15"
                style={{ backgroundColor: theme.primary }}
              />

              {/* Main Image Container - Hexagonal/Diamond Shape */}
              <div className="relative">
                {/* Outer Border Shape */}
                <div
                  className="absolute inset-0 p-1"
                  style={{
                    clipPath:
                      "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                    backgroundColor: theme.primary,
                  }}
                />

                {/* Image with Hexagonal Shape */}
                <div
                  className="relative overflow-hidden"
                  style={{
                    clipPath:
                      "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                    backgroundColor: theme.white,
                  }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=800&fit=crop"
                    alt="Students collaborating"
                    className="w-full h-[500px] object-cover"
                  />
                  {/* Subtle overlay for blend */}
                  <div
                    className="absolute inset-0 opacity-5"
                    style={{ backgroundColor: theme.primary }}
                  />
                </div>
              </div>

              {/* Floating Card - Bottom Left */}
              <motion.div
                className="absolute -bottom-4 -left-8 p-4 rounded-2xl shadow-xl z-10"
                style={{ backgroundColor: theme.white }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: theme.lighter }}
                  >
                    <GraduationCap
                      className="w-6 h-6"
                      style={{ color: theme.primary }}
                    />
                  </div>
                  <div>
                    <p
                      className="text-sm"
                      style={{ color: theme.primaryMedium }}
                    >
                      Trusted by
                    </p>
                    <p
                      className="text-xl font-bold"
                      style={{ color: theme.primary }}
                    >
                      500+ Colleges
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Floating Card - Top Right */}
              <motion.div
                className="absolute -top-4 -right-4 p-4 rounded-2xl shadow-xl z-10"
                style={{ backgroundColor: theme.white }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
              >
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full border-2 overflow-hidden"
                        style={{ borderColor: theme.white }}
                      >
                        <img
                          src={`https://images.unsplash.com/photo-${
                            i === 1
                              ? "1507003211169-0a1dd7228f2d"
                              : i === 2
                              ? "1494790108377-be9c29b29330"
                              : "1500648767791-00dcc994a43e"
                          }?w=50&h=50&fit=crop`}
                          alt="User"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: theme.primary }}
                  >
                    +50K Active
                  </p>
                </div>
              </motion.div>
            </div>
          </FadeIn>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-sm" style={{ color: theme.primaryMedium }}>
            Scroll to explore
          </span>
          <MousePointer2
            className="w-5 h-5"
            style={{ color: theme.primaryMedium }}
          />
        </motion.div>
      </div>
    </section>
  );
};

// Features Section
const FeaturesSection = () => {
  const features = [
    {
      icon: Target,
      title: "Smart Matching",
      description:
        "Our intelligent system connects you with the perfect freelancer based on skills and requirements.",
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description:
        "Escrow protection ensures your money is safe until the project is completed to satisfaction.",
    },
    {
      icon: Clock,
      title: "Fast Delivery",
      description:
        "Get your projects completed quickly with our efficient communication and delivery system.",
    },
    {
      icon: Award,
      title: "Verified Talent",
      description:
        "All freelancers are verified students with portfolios showcasing their best work.",
    },
    {
      icon: MessageCircle,
      title: "Real-time Chat",
      description:
        "Communicate seamlessly with built-in messaging, file sharing, and collaboration tools.",
    },
    {
      icon: Globe,
      title: "Campus Network",
      description:
        "Connect with talented students from universities across the country and beyond.",
    },
  ];

  return (
    <section className="py-24" style={{ backgroundColor: theme.lighter }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <FadeIn>
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
              style={{ backgroundColor: theme.white }}
            >
              <Zap className="w-4 h-4" style={{ color: theme.primary }} />
              <span
                className="text-sm font-medium"
                style={{ color: theme.primary }}
              >
                Powerful Features
              </span>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4"
              style={{ color: theme.primary }}
            >
              Why Choose Gig Connect?
            </h2>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: theme.primaryMedium }}
            >
              Everything you need to connect, collaborate, and create amazing
              projects.
            </p>
          </FadeIn>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <FadeIn key={index} delay={index * 0.1}>
                <div
                  className="group p-8 rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                  style={{ backgroundColor: theme.white }}
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: theme.lighter }}
                  >
                    <Icon
                      className="w-7 h-7"
                      style={{ color: theme.primary }}
                    />
                  </div>
                  <h3
                    className="text-xl font-semibold mb-3"
                    style={{ color: theme.primary }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className="leading-relaxed"
                    style={{ color: theme.primaryMedium }}
                  >
                    {feature.description}
                  </p>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// How It Works Section
const HowItWorksSection = () => {
  const steps = [
    {
      number: "01",
      title: "Create Your Profile",
      description:
        "Sign up and showcase your skills or describe the service you need.",
      icon: Users2,
    },
    {
      number: "02",
      title: "Find or Get Found",
      description:
        "Browse talented students or let clients discover your amazing work.",
      icon: Search,
    },
    {
      number: "03",
      title: "Collaborate & Create",
      description:
        "Work together seamlessly with our built-in tools and secure payments.",
      icon: Briefcase,
    },
    {
      number: "04",
      title: "Deliver & Succeed",
      description:
        "Complete projects, build your reputation, and grow your network.",
      icon: CheckCircle2,
    },
  ];

  return (
    <section className="py-24" style={{ backgroundColor: theme.white }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <FadeIn>
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
              style={{ backgroundColor: theme.lighter }}
            >
              <Lightbulb className="w-4 h-4" style={{ color: theme.primary }} />
              <span
                className="text-sm font-medium"
                style={{ color: theme.primary }}
              >
                Simple Process
              </span>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4"
              style={{ color: theme.primary }}
            >
              How It Works
            </h2>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: theme.primaryMedium }}
            >
              Get started in minutes with our simple four-step process.
            </p>
          </FadeIn>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <FadeIn key={index} delay={index * 0.1}>
                <div className="relative text-center">
                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div
                      className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-0.5"
                      style={{ backgroundColor: theme.light }}
                    />
                  )}

                  {/* Icon Container */}
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 relative"
                    style={{ backgroundColor: theme.lighter }}
                  >
                    <Icon
                      className="w-8 h-8"
                      style={{ color: theme.primary }}
                    />
                    <span
                      className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: theme.primary }}
                    >
                      {step.number}
                    </span>
                  </div>

                  <h3
                    className="text-lg font-semibold mb-2"
                    style={{ color: theme.primary }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-sm" style={{ color: theme.primaryMedium }}>
                    {step.description}
                  </p>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// Featured Gigs Section
const FeaturedGigsSection = () => {
  const gigs = [
    {
      icon: Laptop,
      title: "Web Development",
      description:
        "Build modern, responsive websites with React, Node.js, and cutting-edge technologies.",
      provider: "Satyam Pandey",
      providerImage:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      rating: "4.9",
      reviews: 127,
      price: "₹5,000",
      tags: ["React", "Node.js", "MongoDB"],
    },
    {
      icon: PenTool,
      title: "UI/UX Design",
      description:
        "Create stunning user interfaces and seamless experiences that users will love.",
      provider: "Apoorva Sharma",
      providerImage:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      rating: "5.0",
      reviews: 89,
      price: "₹3,500",
      tags: ["Figma", "Adobe XD", "UI Design"],
    },
    {
      icon: BookOpen,
      title: "Academic Tutoring",
      description:
        "Master complex subjects with personalized tutoring sessions from top students.",
      provider: "Rohan Mehta",
      providerImage:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
      rating: "4.8",
      reviews: 56,
      price: "₹800/hr",
      tags: ["Math", "Physics", "Programming"],
    },
  ];

  return (
    <section className="py-24" style={{ backgroundColor: theme.lighter }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <FadeIn>
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
              style={{ backgroundColor: theme.white }}
            >
              <TrendingUp
                className="w-4 h-4"
                style={{ color: theme.primary }}
              />
              <span
                className="text-sm font-medium"
                style={{ color: theme.primary }}
              >
                Popular Services
              </span>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4"
              style={{ color: theme.primary }}
            >
              Featured Gigs
            </h2>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: theme.primaryMedium }}
            >
              Explore top-rated services from our talented student community.
            </p>
          </FadeIn>
        </div>

        {/* Gigs Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {gigs.map((gig, index) => {
            const Icon = gig.icon;
            return (
              <FadeIn key={index} delay={index * 0.1}>
                <div
                  className="group rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border"
                  style={{
                    backgroundColor: theme.white,
                    borderColor: theme.light,
                  }}
                >
                  {/* Card Header */}
                  <div
                    className="p-6 pb-4"
                    style={{ backgroundColor: theme.white }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: theme.lighter }}
                      >
                        <Icon
                          className="w-6 h-6"
                          style={{ color: theme.primary }}
                        />
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {gig.tags.slice(0, 2).map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 text-xs font-medium rounded-md"
                            style={{
                              backgroundColor: theme.lighter,
                              color: theme.primaryMedium,
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <h3
                      className="text-xl font-semibold mb-2"
                      style={{ color: theme.primary }}
                    >
                      {gig.title}
                    </h3>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: theme.primaryMedium }}
                    >
                      {gig.description}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div
                    className="p-6 pt-4 border-t"
                    style={{ borderColor: theme.light }}
                  >
                    {/* Provider */}
                    <div className="flex items-center gap-3 mb-4">
                      <img
                        src={gig.providerImage}
                        alt={gig.provider}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <p
                          className="text-sm font-medium"
                          style={{ color: theme.primary }}
                        >
                          {gig.provider}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: theme.primaryMedium }}
                        >
                          {gig.rating} ({gig.reviews} reviews)
                        </p>
                      </div>
                    </div>

                    {/* Price & CTA */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className="text-xs"
                          style={{ color: theme.primaryMedium }}
                        >
                          Starting at
                        </p>
                        <p
                          className="text-xl font-bold"
                          style={{ color: theme.primary }}
                        >
                          {gig.price}
                        </p>
                      </div>
                      <button
                        className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                        style={{ backgroundColor: theme.primary }}
                      >
                        Hire Now
                      </button>
                    </div>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>

        {/* View All Button */}
        <FadeIn delay={0.4}>
          <div className="text-center mt-12">
            <Link
              to="/gigs"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold border-2 transition-all duration-300 hover:shadow-md"
              style={{ color: theme.primary, borderColor: theme.primary }}
            >
              Explore All Gigs
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

// Testimonials Section
const TestimonialsSection = () => {
  const testimonials = [
    {
      quote:
        "Gig Connect helped me find an amazing developer who brought my startup idea to life. The quality and professionalism exceeded my expectations!",
      author: "Priya Singh",
      role: "Startup Founder",
      image:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    },
    {
      quote:
        "As a computer science student, I've earned over ₹2 lakhs freelancing on this platform. It has truly changed my life and career trajectory!",
      author: "Satyam Pandey",
      role: "Full-Stack Developer",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    },
    {
      quote:
        "The platform's focus on verified students gave me confidence in hiring. Got my entire brand identity designed perfectly!",
      author: "Rahul Verma",
      role: "Business Owner",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    },
    {
      quote:
        "I landed my first design gig here and built an amazing portfolio. Highly recommend for any student looking to gain experience!",
      author: "Apoorva Sharma",
      role: "UI/UX Designer",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const goTo = (index) => setCurrentIndex(index);
  const goToPrev = () =>
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  const goToNext = () =>
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);

  useEffect(() => {
    const timer = setInterval(goToNext, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-24" style={{ backgroundColor: theme.white }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <FadeIn>
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
              style={{ backgroundColor: theme.lighter }}
            >
              <Heart className="w-4 h-4" style={{ color: theme.primary }} />
              <span
                className="text-sm font-medium"
                style={{ color: theme.primary }}
              >
                Testimonials
              </span>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4"
              style={{ color: theme.primary }}
            >
              What Our Community Says
            </h2>
          </FadeIn>
        </div>

        {/* Testimonial Carousel */}
        <FadeIn delay={0.2}>
          <div className="relative max-w-4xl mx-auto">
            {/* Main Card */}
            <div
              className="relative overflow-hidden rounded-3xl shadow-lg"
              style={{ backgroundColor: theme.lighter }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4 }}
                  className="p-8 md:p-12"
                >
                  {/* Quote Icon */}
                  <Quote
                    className="w-12 h-12 mb-6"
                    style={{ color: theme.light }}
                  />

                  {/* Quote Text */}
                  <p
                    className="text-xl md:text-2xl leading-relaxed mb-8"
                    style={{ color: theme.primary }}
                  >
                    "{testimonials[currentIndex].quote}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <img
                      src={testimonials[currentIndex].image}
                      alt={testimonials[currentIndex].author}
                      className="w-14 h-14 rounded-full object-cover"
                      style={{ border: `3px solid ${theme.white}` }}
                    />
                    <div>
                      <p
                        className="text-lg font-semibold"
                        style={{ color: theme.primary }}
                      >
                        {testimonials[currentIndex].author}
                      </p>
                      <p style={{ color: theme.primaryMedium }}>
                        {testimonials[currentIndex].role}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Buttons */}
            <button
              onClick={goToPrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-6 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
              style={{ backgroundColor: theme.white }}
            >
              <ChevronLeft
                className="w-6 h-6"
                style={{ color: theme.primary }}
              />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-6 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
              style={{ backgroundColor: theme.white }}
            >
              <ChevronRight
                className="w-6 h-6"
                style={{ color: theme.primary }}
              />
            </button>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goTo(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex ? "w-8" : "w-2"
                  }`}
                  style={{
                    backgroundColor:
                      index === currentIndex ? theme.primary : theme.light,
                  }}
                />
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

// CTA Section
const CTASection = () => {
  return (
    <section className="py-24" style={{ backgroundColor: theme.primary }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <FadeIn>
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
          >
            <Rocket className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">
              Start Your Journey
            </span>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
        </FadeIn>

        <FadeIn delay={0.2}>
          <p
            className="text-lg mb-10 max-w-2xl mx-auto"
            style={{ color: theme.light }}
          >
            Join thousands of students and clients already transforming their
            ideas into reality on Gig Connect.
          </p>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              style={{ backgroundColor: theme.white, color: theme.primary }}
            >
              Start Hiring
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold border-2 border-white text-white transition-all duration-300 hover:bg-white/10"
            >
              Start Earning
            </Link>
          </div>
        </FadeIn>

        <FadeIn delay={0.4}>
          <div className="flex flex-wrap items-center justify-center gap-6 mt-12">
            {["Free to join", "No credit card required", "Cancel anytime"].map(
              (text, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className="w-5 h-5" style={{ color: theme.light }} />
                  <span style={{ color: theme.light }}>{text}</span>
                </div>
              )
            )}
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

// Main Landing Page Component
const LandingPage = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem("hasSeenIntro");
    if (hasSeenIntro) {
      setShowIntro(false);
      setIsLoaded(true);
    }
  }, []);

  const handleIntroComplete = () => {
    setShowIntro(false);
    setIsLoaded(true);
    sessionStorage.setItem("hasSeenIntro", "true");
  };

  return (
    <div
      className="font-sans antialiased"
      style={{ backgroundColor: theme.white }}
    >
      {/* Intro Animation */}
      {showIntro && <IntroAnimation onComplete={handleIntroComplete} />}

      {/* Main Content */}
      <AnimatePresence>
        {isLoaded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Navbar />
            <main>
              <HeroSection />
              <FeaturesSection />
              <HowItWorksSection />
              <FeaturedGigsSection />
              <TestimonialsSection />
              <CTASection />
            </main>
            <Footer />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;
