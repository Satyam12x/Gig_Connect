import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  Rocket,
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
  Shield,
  Clock,
  Award,
  MessageCircle,
  Briefcase,
  GraduationCap,
  Target,
  Lightbulb,
  Globe,
  Search,
  Plane,
  TrendingUp,
  Heart,
  Sparkles,
  Star,
  MousePointer2,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { theme, config } from "../constants";

// Animation Components
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

const AnimatedCounter = ({ value, suffix = "" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isInView) {
      const numericValue = parseInt(value.replace(/[^0-9]/g, ""));
      let current = 0;
      const increment = numericValue / 50;
      const timer = setInterval(() => {
        current += increment;
        if (current >= numericValue) {
          setCount(numericValue);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, 30);
      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

// Floating Particles Background
const FloatingParticles = () => {
  const particles = Array.from({ length: 20 });
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: i % 3 === 0 ? theme.primary : i % 3 === 1 ? theme.accent : theme.primaryLight,
            opacity: 0.1,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
};

// Intro Animation
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
          style={{ background: theme.gradients.primary }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Animated Background Gradient */}
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                theme.gradients.primary,
                `linear-gradient(135deg, ${theme.primary} 0%, ${theme.accent} 100%)`,
                theme.gradients.primary,
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />

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
            <motion.div
              animate={{ rotate: [0, -5, 0, 5, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <Plane className="w-20 h-20 text-white" strokeWidth={1.5} />
            </motion.div>
          </motion.div>

          {/* Center Content */}
          {phase >= 1 && phase < 2 && (
            <motion.div
              className="text-center z-10"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-6"
              >
                <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto shadow-2xl bg-white/20 backdrop-blur-md">
                  <Briefcase className="w-12 h-12 text-white" />
                </div>
              </motion.div>

              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-5xl md:text-6xl font-bold mb-3 text-white"
              >
                {config.appName}
              </motion.h1>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-white/90"
              >
                {config.appTagline}
              </motion.p>
            </motion.div>
          )}

          {/* Loading Progress */}
          <motion.div
            className="absolute bottom-16 left-1/2 -translate-x-1/2 w-64"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="h-1 rounded-full overflow-hidden bg-white/20">
              <motion.div
                className="h-full rounded-full bg-white"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.5, ease: "easeInOut" }}
              />
            </div>
            <motion.p
              className="text-sm text-center mt-3 text-white/80"
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

// Enhanced Hero Section
const HeroSection = () => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);

  const stats = [
    { value: "50,000+", label: "Active Users", icon: Users2 },
    { value: "100,000+", label: "Gigs Completed", icon: CheckCircle2 },
    { value: "500+", label: "Universities", icon: GraduationCap },
  ];

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${theme.white} 0%, ${theme.lighter} 50%, ${theme.white} 100%)`,
          }}
        />
        <FloatingParticles />
        
        {/* Gradient Orbs */}
        <motion.div
          className="absolute top-20 right-10 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: theme.gradients.primary }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 left-10 w-80 h-80 rounded-full opacity-15 blur-3xl"
          style={{ background: theme.gradients.accent }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{ duration: 6, repeat: Infinity, delay: 1 }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div className="space-y-8 text-center lg:text-left z-10">
            {/* Badge with Animation */}
            <FadeIn delay={0.1}>
              <motion.div
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-opacity-20"
                style={{
                  background: `linear-gradient(135deg, ${theme.white} 0%, ${theme.lighter} 100%)`,
                  borderColor: theme.primary,
                }}
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: theme.primary }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <Sparkles className="w-4 h-4" style={{ color: theme.primary }} />
                <span
                  className="text-sm font-semibold"
                  style={{ color: theme.primary }}
                >
                  #1 Student Freelancing Platform
                </span>
              </motion.div>
            </FadeIn>

            {/* Heading with Gradient */}
            <div>
              <FadeIn delay={0.2}>
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight mb-4">
                  <span style={{ color: theme.primary }}>Connect With</span>
                  <br />
                  <motion.span
                    className="inline-block bg-clip-text text-transparent"
                    style={{
                      backgroundImage: theme.gradients.primary,
                    }}
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{ duration: 5, repeat: Infinity }}
                  >
                    Student Talent
                  </motion.span>
                </h1>
              </FadeIn>
            </div>

            {/* Description */}
            <FadeIn delay={0.3}>
              <p
                className="text-lg md:text-xl leading-relaxed max-w-xl mx-auto lg:mx-0"
                style={{ color: theme.primaryLight }}
              >
                {config.appDescription}
              </p>
            </FadeIn>

            {/* CTA Buttons */}
            <FadeIn delay={0.4}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/signup">
                  <motion.button
                    className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-white text-lg shadow-lg"
                    style={{ backgroundColor: theme.primary }}
                    whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(26, 42, 79, 0.3)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Get Started Free
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  </motion.button>
                </Link>
                <motion.button
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold border-2 text-lg"
                  style={{
                    color: theme.primary,
                    borderColor: theme.primary,
                    backgroundColor: theme.white,
                  }}
                  whileHover={{ scale: 1.05, backgroundColor: theme.lighter }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play className="w-5 h-5" />
                  Watch Demo
                </motion.button>
              </div>
            </FadeIn>

            {/* Animated Stats */}
            <FadeIn delay={0.5}>
              <div className="grid grid-cols-3 gap-6 pt-8">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={index}
                      className="text-center lg:text-left"
                      whileHover={{ y: -5 }}
                    >
                      <div className="flex items-center justify-center lg:justify-start gap-2 mb-1">
                        <Icon className="w-5 h-5" style={{ color: theme.accent }} />
                        <p
                          className="text-2xl md:text-3xl font-bold"
                          style={{ color: theme.primary }}
                        >
                          <AnimatedCounter value={stat.value} />
                        </p>
                      </div>
                      <p
                        className="text-xs md:text-sm"
                        style={{ color: theme.primaryMedium }}
                      >
                        {stat.label}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </FadeIn>
          </div>

          {/* Right Content - Illustration */}
          <FadeIn delay={0.3} direction="left" className="hidden lg:block">
            <div className="relative">
              {/* Main Image with 3D Tilt Effect */}
              <motion.div
                className="relative"
                style={{ y }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                {/* Decorative Background */}
                <div
                  className="absolute -inset-8 rounded-[3rem] opacity-30 blur-2xl"
                  style={{ background: theme.gradients.primary }}
                />

                {/* Main Image Container */}
                <div
                  className="relative overflow-hidden rounded-3xl shadow-2xl"
                  style={{ backgroundColor: theme.white }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop"
                    alt="Students collaborating"
                    className="w-full h-[500px] object-cover"
                  />
                  <div
                    className="absolute inset-0 opacity-10"
                    style={{ background: theme.gradients.overlay }}
                  />
                </div>

                {/* Floating Cards */}
                <motion.div
                  className="absolute -bottom-6 -left-6 p-5 rounded-2xl shadow-2xl backdrop-blur-md"
                  style={{ backgroundColor: theme.white }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center"
                      style={{ background: theme.gradients.primary }}
                    >
                      <GraduationCap className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: theme.primaryMedium }}>
                        Trusted by
                      </p>
                      <p className="text-2xl font-bold" style={{ color: theme.primary }}>
                        500+ Colleges
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute -top-6 -right-6 p-4 rounded-2xl shadow-2xl backdrop-blur-md"
                  style={{ backgroundColor: theme.white }}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-3">
                      {[1, 2, 3].map((i) => (
                        <motion.div
                          key={i}
                          className="w-10 h-10 rounded-full border-2 overflow-hidden"
                          style={{ borderColor: theme.white }}
                          whileHover={{ scale: 1.1, zIndex: 10 }}
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
                        </motion.div>
                      ))}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4" style={{ color: "#FFD700", fill: "#FFD700" }} />
                        <span className="text-sm font-bold" style={{ color: theme.primary }}>
                          4.9
                        </span>
                      </div>
                      <p className="text-xs" style={{ color: theme.primaryMedium }}>
                        +50K Active
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </FadeIn>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-sm" style={{ color: theme.primaryMedium }}>
            Scroll to explore
          </span>
          <MousePointer2 className="w-5 h-5" style={{ color: theme.primaryMedium }} />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
