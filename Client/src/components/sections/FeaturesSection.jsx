import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Target,
  Shield,
  Clock,
  Award,
  MessageCircle,
  Globe,
  Zap,
} from "lucide-react";
import { theme } from "../../constants";
import { Card } from "../common";

const FadeIn = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  );
};

const FeaturesSection = () => {
  const features = [
    {
      icon: Target,
      title: "Smart Matching",
      description:
        "Our intelligent system connects you with the perfect freelancer based on skills and requirements.",
      color: "#3B82F6",
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description:
        "Escrow protection ensures your money is safe until the project is completed to satisfaction.",
      color: "#10B981",
    },
    {
      icon: Clock,
      title: "Fast Delivery",
      description:
        "Get your projects completed quickly with our efficient communication and delivery system.",
      color: "#F59E0B",
    },
    {
      icon: Award,
      title: "Verified Talent",
      description:
        "All freelancers are verified students with portfolios showcasing their best work.",
      color: "#8B5CF6",
    },
    {
      icon: MessageCircle,
      title: "Real-time Chat",
      description:
        "Communicate seamlessly with built-in messaging, file sharing, and collaboration tools.",
      color: "#EC4899",
    },
    {
      icon: Globe,
      title: "Campus Network",
      description:
        "Connect with talented students from universities across the country and beyond.",
      color: "#06B6D4",
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden" style={{ backgroundColor: theme.lighter }}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute top-0 left-0 w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, ${theme.primary} 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          <FadeIn>
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
              style={{ backgroundColor: theme.white }}
            >
              <Zap className="w-4 h-4" style={{ color: theme.primary }} />
              <span className="text-sm font-medium" style={{ color: theme.primary }}>
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
            <p className="text-lg max-w-2xl mx-auto" style={{ color: theme.primaryMedium }}>
              Everything you need to connect, collaborate, and create amazing projects.
            </p>
          </FadeIn>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <FadeIn key={index} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card padding="lg" className="h-full relative overflow-hidden group">
                    {/* Gradient Accent on Hover */}
                    <motion.div
                      className="absolute top-0 left-0 w-full h-1 origin-left"
                      style={{ backgroundColor: feature.color }}
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.3 }}
                    />

                    {/* Icon Container */}
                    <motion.div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 relative overflow-hidden"
                      style={{ backgroundColor: theme.lighter }}
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <Icon className="w-8 h-8 relative z-10" style={{ color: feature.color }} />
                      
                      {/* Animated Background */}
                      <motion.div
                        className="absolute inset-0 opacity-0 group-hover:opacity-20"
                        style={{ backgroundColor: feature.color }}
                        transition={{ duration: 0.3 }}
                      />
                    </motion.div>

                    {/* Content */}
                    <h3 className="text-xl font-semibold mb-3" style={{ color: theme.primary }}>
                      {feature.title}
                    </h3>
                    <p className="leading-relaxed" style={{ color: theme.primaryMedium }}>
                      {feature.description}
                    </p>

                    {/* Decorative Elements */}
                    <motion.div
                      className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full opacity-0 group-hover:opacity-10 blur-2xl"
                      style={{ backgroundColor: feature.color }}
                      transition={{ duration: 0.3 }}
                    />
                  </Card>
                </motion.div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
