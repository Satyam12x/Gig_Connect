import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  Rocket, Users2, Zap, ArrowRight, Play, CheckCircle2, Laptop, PenTool, BookOpen,
  Quote, ChevronLeft, ChevronRight, Shield, Clock, Award, MessageCircle, Briefcase,
  GraduationCap, Target, Lightbulb, Globe, Search, Plane, TrendingUp, Heart, Sparkles,
  Star, MousePointer2,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { theme, config } from "../constants";

// ============= UTILITY COMPONENTS =============
const FadeIn = ({ children, delay = 0, direction = "up" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const directions = { up: { y: 40 }, down: { y: -40 }, left: { x: 40 }, right: { x: -40 } };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...directions[direction] }}
      animate={isInView ? { opacity: 1, y: 0, x: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

const AnimatedCounter = ({ value }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isInView) {
      const num = parseInt(value.replace(/[^0-9]/g, ""));
      let current = 0;
      const increment = num / 50;
      const timer = setInterval(() => {
        current += increment;
        if (current >= num) {
          setCount(num);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, 30);
      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return <span ref={ref}>{count.toLocaleString()}{value.includes("+") ? "+" : ""}</span>;
};

const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {Array.from({ length: 15 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-2 h-2 rounded-full"
        style={{
          backgroundColor: [theme.primary, theme.accent, theme.primaryLight][i % 3],
          opacity: 0.15,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{
          y: [0, -30, 0],
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

// ============= INTRO ANIMATION =============
const IntroAnimation = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 2000; // 2 seconds
    const interval = 20;
    const increment = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 200);
          return 100;
        }
        return prev + increment;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {progress < 100 && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8 text-center"
          >
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: theme.primary }}
            >
              <Briefcase className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold" style={{ color: theme.primary }}>
              {config.appName}
            </h1>
            <p className="text-sm mt-1" style={{ color: theme.primaryMedium }}>
              {config.appTagline}
            </p>
          </motion.div>

          {/* Progress Bar */}
          <div className="w-80 max-w-md px-4">
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ backgroundColor: theme.lighter }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ 
                  backgroundColor: theme.primary,
                  width: `${progress}%`,
                }}
                initial={{ width: "0%" }}
              />
            </div>
            <p
              className="text-xs text-center mt-3"
              style={{ color: theme.primaryMedium }}
            >
              Loading your workspace...
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ============= HERO SECTION =============
const HeroSection = () => {
  const stats = [
    { value: "50,000+", label: "Active Users", icon: Users2 },
    { value: "100,000+", label: "Gigs Completed", icon: CheckCircle2 },
    { value: "500+", label: "Universities", icon: GraduationCap },
  ];

  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Diagonal Background Split */}
      <div className="absolute inset-0">
        {/* Top diagonal section - white */}
        <div className="absolute inset-0 bg-white" />
        
        {/* Bottom diagonal section - colored */}
        <motion.div
          className="absolute inset-0 origin-top-left"
          style={{
            background: `linear-gradient(135deg, ${theme.lighter} 0%, ${theme.white} 100%)`,
            clipPath: "polygon(0 40%, 100% 25%, 100% 100%, 0 100%)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        />

        {/* Decorative circles */}
        <motion.div
          className="absolute top-20 right-10 w-64 h-64 rounded-full opacity-30 blur-3xl"
          style={{ backgroundColor: theme.accent }}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 20, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        <motion.div
          className="absolute bottom-32 left-20 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ backgroundColor: theme.primary }}
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -20, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Dotted pattern overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle, ${theme.primary} 1px, transparent 1px)`,
            backgroundSize: "30px 30px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full z-10">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Left Content - Takes 7 columns */}
          <div className="lg:col-span-7 space-y-8">
            {/* Floating badge */}
            <FadeIn delay={0.1}>
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm border"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  borderColor: theme.primary,
                  borderWidth: 1.5,
                }}
                whileHover={{ scale: 1.05, y: -2 }}
              >
                <Star className="w-4 h-4" style={{ color: "#FFD700", fill: "#FFD700" }} />
                <span className="text-sm font-semibold" style={{ color: theme.primary }}>
                  Trusted by 500+ Universities
                </span>
              </motion.div>
            </FadeIn>

            {/* Main heading with creative layout */}
            <FadeIn delay={0.2}>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <motion.div
                    className="w-2 h-16 rounded-full"
                    style={{ background: theme.gradients.primary }}
                    animate={{ height: [60, 80, 60] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight">
                    <span style={{ color: theme.primary }}>Your Campus,</span>
                  </h1>
                </div>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight pl-0 lg:pl-6">
                  <span
                    className="bg-clip-text text-transparent"
                    style={{
                      backgroundImage: theme.gradients.primary,
                    }}
                  >
                    Unlimited Talent
                  </span>
                </h1>
              </div>
            </FadeIn>

            {/* Description with highlight */}
            <FadeIn delay={0.3}>
              <div className="space-y-3 lg:pl-6">
                <p className="text-xl leading-relaxed" style={{ color: theme.primaryLight }}>
                  Connect with <span className="font-bold" style={{ color: theme.primary }}>skilled students</span> for 
                  web development, design, tutoring, and more.
                </p>
                <p className="text-lg" style={{ color: theme.primaryMedium }}>
                  The #1 freelancing platform built exclusively for student talent.
                </p>
              </div>
            </FadeIn>

            {/* Animated stats row */}
            <FadeIn delay={0.4}>
              <div className="flex flex-wrap gap-8 lg:pl-6 pt-4">
                {stats.map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={i}
                      className="flex items-center gap-3"
                      whileHover={{ scale: 1.05, x: 5 }}
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: theme.lighter }}
                      >
                        <Icon className="w-6 h-6" style={{ color: theme.accent }} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold" style={{ color: theme.primary }}>
                          <AnimatedCounter value={stat.value} />
                        </p>
                        <p className="text-xs" style={{ color: theme.primaryMedium }}>
                          {stat.label}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </FadeIn>

            {/* CTA Buttons */}
            <FadeIn delay={0.5}>
              <div className="flex flex-wrap gap-4 lg:pl-6 pt-4">
                <Link to="/signup">
                  <motion.button
                    className="group relative inline-flex items-center gap-2 px-10 py-5 rounded-2xl font-bold text-white text-lg overflow-hidden"
                    style={{ backgroundColor: theme.primary }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="relative z-10">Get Started Free</span>
                    <motion.div
                      className="relative z-10"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                    
                    {/* Shine effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.6 }}
                    />
                  </motion.button>
                </Link>
                
                <motion.button
                  className="inline-flex items-center gap-2 px-10 py-5 rounded-2xl font-bold border-2 text-lg backdrop-blur-sm"
                  style={{
                    color: theme.primary,
                    borderColor: theme.primary,
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                  }}
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 1)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play className="w-5 h-5" />
                  Watch Demo
                </motion.button>
              </div>
            </FadeIn>
          </div>

          {/* Right Content - Takes 5 columns - Image with creative treatment */}
          <FadeIn delay={0.3} direction="left" className="lg:col-span-5 hidden lg:block">
            <div className="relative">
              {/* Main image container with unique shape */}
              <motion.div
                className="relative"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                {/* Decorative elements behind image */}
                <motion.div
                  className="absolute -top-8 -right-8 w-32 h-32 rounded-3xl opacity-30"
                  style={{ backgroundColor: theme.accent }}
                  animate={{ rotate: [0, 90, 0] }}
                  transition={{ duration: 20, repeat: Infinity }}
                />
                
                <motion.div
                  className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full opacity-20"
                  style={{ backgroundColor: theme.primary }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 8, repeat: Infinity }}
                />

                {/* Image with modern border treatment */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                  <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=700&fit=crop"
                    alt="Students collaborating"
                    className="w-full h-[600px] object-cover"
                  />
                  
                  {/* Gradient overlay */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(180deg, transparent 0%, rgba(26, 42, 79, 0.1) 100%)`,
                    }}
                  />
                </div>

                {/* Floating badge on image */}
                <motion.div
                  className="absolute top-6 right-6 px-4 py-3 rounded-2xl shadow-xl backdrop-blur-md"
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.95)" }}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1, type: "spring" }}
                  whileHover={{ scale: 1.1 }}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="w-8 h-8 rounded-full border-2 border-white overflow-hidden"
                        >
                          <img
                            src={`https://i.pravatar.cc/150?img=${i}`}
                            alt="User"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="pl-1">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3" style={{ color: "#FFD700", fill: "#FFD700" }} />
                        <span className="text-sm font-bold" style={{ color: theme.primary }}>
                          4.9
                        </span>
                      </div>
                      <p className="text-xs" style={{ color: theme.primaryMedium }}>
                        50K+ Reviews
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Badge at bottom */}
                <motion.div
                  className="absolute bottom-6 left-6 px-5 py-3 rounded-2xl shadow-xl backdrop-blur-md"
                  style={{ backgroundColor: theme.primary }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-6 h-6 text-white" />
                    <div>
                      <p className="text-sm text-white/80">Trusted by</p>
                      <p className="text-xl font-bold text-white">500+ Colleges</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
};

// ============= FEATURES SECTION =============
const FeaturesSection = () => {
  const features = [
    { icon: Target, title: "Smart Matching", description: "Our intelligent system connects you with the perfect freelancer based on skills and requirements.", color: "#3B82F6" },
    { icon: Shield, title: "Secure Payments", description: "Escrow protection ensures your money is safe until the project is completed to satisfaction.", color: "#10B981" },
    { icon: Clock, title: "Fast Delivery", description: "Get your projects completed quickly with our efficient communication and delivery system.", color: "#F59E0B" },
    { icon: Award, title: "Verified Talent", description: "All freelancers are verified students with portfolios showcasing their best work.", color: "#8B5CF6" },
    { icon: MessageCircle, title: "Real-time Chat", description: "Communicate seamlessly with built-in messaging, file sharing, and collaboration tools.", color: "#EC4899" },
    { icon: Globe, title: "Campus Network", description: "Connect with talented students from universities across the country and beyond.", color: "#06B6D4" },
  ];

  return (
    <section className="py-24 relative" style={{ backgroundColor: theme.lighter }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 bg-white">
              <Zap className="w-4 h-4" style={{ color: theme.primary }} />
              <span className="text-sm font-medium" style={{ color: theme.primary }}>Powerful Features</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4" style={{ color: theme.primary }}>
              Why Choose Gig Connect?
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: theme.primaryMedium }}>
              Everything you need to connect, collaborate, and create amazing projects.
            </p>
          </FadeIn>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <FadeIn key={i} delay={i * 0.1}>
                <motion.div
                  className="p-8 rounded-2xl bg-white hover:shadow-xl transition-all"
                  whileHover={{ y: -8 }}
                >
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: theme.lighter }}>
                    <Icon className="w-8 h-8" style={{ color: feature.color }} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3" style={{ color: theme.primary }}>{feature.title}</h3>
                  <p style={{ color: theme.primaryMedium }}>{feature.description}</p>
                </motion.div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// ============= HOW IT WORKS =============
const HowItWorksSection = () => {
  const steps = [
    { number: "01", title: "Create Your Profile", description: "Sign up and showcase your skills or describe the service you need.", icon: Users2 },
    { number: "02", title: "Find or Get Found", description: "Browse talented students or let clients discover your amazing work.", icon: Search },
    { number: "03", title: "Collaborate & Create", description: "Work together seamlessly with our built-in tools and secure payments.", icon: Briefcase },
    { number: "04", title: "Deliver & Succeed", description: "Complete projects, build your reputation, and grow your network.", icon: CheckCircle2 },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4" style={{ backgroundColor: theme.lighter }}>
              <Lightbulb className="w-4 h-4" style={{ color: theme.primary }} />
              <span className="text-sm font-medium" style={{ color: theme.primary }}>Simple Process</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4" style={{ color: theme.primary }}>How It Works</h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: theme.primaryMedium }}>
              Get started in minutes with our simple four-step process.
            </p>
          </FadeIn>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="text-center">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 relative" style={{ backgroundColor: theme.lighter }}>
                    <Icon className="w-8 h-8" style={{ color: theme.primary }} />
                    <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: theme.primary }}>
                      {step.number}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: theme.primary }}>{step.title}</h3>
                  <p className="text-sm" style={{ color: theme.primaryMedium }}>{step.description}</p>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// ============= CTA SECTION =============
const CTASection = () => {
  return (
    <section className="py-24 relative overflow-hidden" style={{ backgroundColor: theme.primary }}>
      <div className="absolute inset-0 opacity-10">
        <FloatingParticles />
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <FadeIn>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
            <Rocket className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">Start Your Journey</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">Ready to Get Started?</h2>
          <p className="text-lg mb-10 max-w-2xl mx-auto text-white/90">
            Join thousands of students and clients already transforming their ideas into reality on Gig Connect.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <motion.button
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold"
                style={{ backgroundColor: theme.white, color: theme.primary }}
                whileHover={{ scale: 1.05 }}
              >
                Start Hiring
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
            <Link to="/signup">
              <motion.button
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold border-2 border-white text-white"
                whileHover={{ backgroundColor: "rgba(255,255,255,0.1)" }}
              >
                Start Earning
              </motion.button>
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

// ============= MAIN COMPONENT =============
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
    <div className="font-sans antialiased" style={{ backgroundColor: theme.white }}>
      {showIntro && <IntroAnimation onComplete={handleIntroComplete} />}
      
      <AnimatePresence>
        {isLoaded && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <Navbar />
            <main>
              <HeroSection />
              <FeaturesSection />
              <HowItWorksSection />
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
