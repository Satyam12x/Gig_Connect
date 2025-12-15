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
  return (
    <section className="relative pt-24 pb-12 overflow-hidden bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          
          {/* Hero Content */}
          <div className="flex-1 w-full flex flex-col gap-8">
            <div className="flex flex-col gap-4 text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-gray-900" style={{ fontFamily: '"Spline Sans", sans-serif' }}>
                Work with the best, <br />
                <span style={{ color: theme.primary }}>anywhere.</span>
              </h1>
              <p className="text-lg text-gray-600 font-medium leading-relaxed max-w-lg">
                Connect with top-tier student freelancers for your next project in minutes.
              </p>
            </div>

            {/* Dual CTA */}
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
              <Link to="/search" className="flex-1">
                <button 
                  className="w-full flex cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-8 text-white text-lg font-bold tracking-wide shadow-lg transition-transform active:scale-95 hover:opacity-90"
                  style={{ backgroundColor: theme.primary, boxShadow: `0 10px 20px -5px ${theme.primary}50` }}
                >
                  Find Talent
                </button>
              </Link>
              <Link to="/apply" className="flex-1">
                <button 
                  className="w-full flex cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-8 bg-white border text-lg font-bold tracking-wide transition-colors hover:bg-gray-50 active:scale-95"
                  style={{ color: theme.primary, borderColor: "#e5e7eb" }}
                >
                  Apply to Work
                </button>
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm w-full max-w-lg">
              <div className="flex items-center -space-x-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="relative z-10 w-12 h-12 rounded-full border-2 border-white overflow-hidden">
                    <img 
                      alt={`User ${i}`} 
                      className="w-full h-full object-cover" 
                      src={`https://i.pravatar.cc/150?img=${i + 10}`} 
                    />
                  </div>
                ))}
                <div className="relative z-0 w-12 h-12 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                  +5k
                </div>
              </div>
              <div className="flex flex-col items-center sm:items-start">
                <p className="text-sm font-bold text-gray-900">Trusted by 10,000+ businesses</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
              </div>
            </div>
            
            {/* Popular Categories */}
            <div className="w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: '"Spline Sans", sans-serif' }}>Popular Services</h3>
                <Link to="/services" className="text-sm font-bold hover:underline" style={{ color: theme.primary }}>See all</Link>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                {[
                  { icon: "palette", label: "Design", active: true },
                  { icon: "code", label: "Development", active: false },
                  { icon: "edit_note", label: "Writing", active: false },
                  { icon: "campaign", label: "Marketing", active: false },
                  { icon: "video_camera_back", label: "Video", active: false },
                ].map((cat, idx) => (
                  <button
                    key={idx}
                    className={`flex h-12 shrink-0 cursor-pointer items-center justify-center gap-x-2 rounded-full px-6 transition-all active:scale-95 border ${
                      cat.active 
                        ? 'text-white border-transparent' 
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                    style={cat.active ? { backgroundColor: theme.primary } : {}}
                  >
                    <span className="material-symbols-outlined text-[20px]">{cat.icon}</span>
                    <span className="text-sm font-bold">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Hero Image / Featured Card */}
          <div className="flex-1 w-full max-w-lg lg:max-w-none">
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop" 
                alt="Freelancers collaborating" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/10"></div>
              
              {/* Featured Freelancer Floating Card */}
              <div className="absolute bottom-6 left-6 right-6 sm:left-auto sm:right-6 sm:w-80 bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/20">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                    <img src="https://i.pravatar.cc/150?img=32" alt="Sarah Jensen" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-gray-900 truncate">Sarah Jensen</h4>
                        <p className="text-sm text-gray-500 truncate">UI/UX Designer</p>
                      </div>
                      <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                        <Star className="w-3 h-3 text-yellow-600 fill-yellow-600" />
                        <span className="text-xs font-bold text-gray-900">4.9</span>
                      </div>
                    </div>
                    <div className="mt-2 flex gap-2">
                       <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">Figma</span>
                       <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">Web</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};


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
