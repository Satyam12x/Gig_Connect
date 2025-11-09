"use client";

import { useState } from "react";
import {
  ArrowRight,
  Star,
  Zap,
  Users,
  Briefcase,
  MessageSquare,
  CheckCircle,
  Code,
  Palette,
  BookOpen,
} from "lucide-react";

const LandingPage = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

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
        "The platform's focus on local campus talent made collaboration seamless and trustworthy.",
      author: "Priya Gupta",
      role: "Marketing Coordinator",
    },
  ];

  const features = [
    {
      icon: Users,
      title: "Verified Campus Talent",
      desc: "Find trusted student experts across your college network.",
    },
    {
      icon: Briefcase,
      title: "Real Projects",
      desc: "Post jobs or showcase your skills to thousands of creators.",
    },
    {
      icon: Zap,
      title: "Fast & Reliable",
      desc: "Get started in minutes with instant messaging and payments.",
    },
  ];

  const gigs = [
    {
      icon: Code,
      title: "Web Development",
      provider: "Satyam Pandey",
      price: "Starting at $500",
    },
    {
      icon: Palette,
      title: "UI/UX Design",
      provider: "Apoorva Sharma",
      price: "Starting at $300",
    },
    {
      icon: BookOpen,
      title: "Tutoring",
      provider: "Rohan Mehta",
      price: "Starting at $25/hr",
    },
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-gray-900">GigConnect</div>
          <div className="hidden md:flex gap-8 items-center text-sm">
            <a href="#features" className="text-gray-600 hover:text-gray-900">
              Features
            </a>
            <a href="#gigs" className="text-gray-600 hover:text-gray-900">
              Explore
            </a>
            <a href="#how" className="text-gray-600 hover:text-gray-900">
              How it works
            </a>
            <button className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition">
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-20 pb-20 px-6 md:pt-32 md:pb-40">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            ✨ Where Campus Talent Thrives
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Hire Brilliant Student Minds
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Connect with verified campus creators — designers, coders, tutors —
            ready to bring your ideas to life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button className="group flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition transform hover:scale-105">
              Start Hiring Now
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition"
              />
            </button>
            <button className="px-8 py-4 bg-gray-100 text-gray-900 font-semibold rounded-lg hover:bg-gray-200 transition">
              Explore Talent
            </button>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-3 gap-6 md:gap-12 mt-16">
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-gray-900">
                5K+
              </p>
              <p className="text-sm md:text-base text-gray-600 mt-2">
                Active Creators
              </p>
            </div>
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-gray-900">
                10K+
              </p>
              <p className="text-sm md:text-base text-gray-600 mt-2">
                Projects Done
              </p>
            </div>
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-gray-900">
                4.9★
              </p>
              <p className="text-sm md:text-base text-gray-600 mt-2">
                Client Rating
              </p>
            </div>
          </div>
        </div>

        {/* HERO IMAGE */}
        <div className="mt-20 max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 md:p-12 aspect-video flex items-center justify-center">
            <img
              src="/students-working-together-on-laptop.jpg"
              alt="Campus talent working"
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose GigConnect?
            </h2>
            <p className="text-lg text-gray-600">
              Real talent. Real results. Right on campus.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition"
              >
                <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                  <f.icon className="text-blue-600" size={28} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {f.title}
                </h3>
                <p className="text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GIGS SECTION */}
      <section id="gigs" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Top Campus Gigs
            </h2>
            <p className="text-lg text-gray-600">
              Handpicked talent ready to work
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {gigs.map((g, i) => (
              <div
                key={i}
                className="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                  <g.icon className="text-gray-900" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {g.title}
                </h3>
                <p className="text-gray-600 mb-1">By {g.provider}</p>
                <p className="text-sm text-gray-500 mb-6">{g.price}</p>
                <button className="w-full py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition">
                  Hire Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              From idea to delivery in 4 simple steps
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Users, title: "Browse", desc: "Find perfect talent" },
              { icon: Briefcase, title: "Hire", desc: "Post your project" },
              {
                icon: MessageSquare,
                title: "Collaborate",
                desc: "Work together",
              },
              { icon: CheckCircle, title: "Done", desc: "Payment & review" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <s.icon className="text-blue-600" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {s.title}
                </h3>
                <p className="text-gray-600 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-16 text-center">
            Loved by Thousands
          </h2>

          <div className="bg-white border border-gray-200 rounded-2xl p-8 md:p-12">
            <div className="flex gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  className="fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>

            <p className="text-xl text-gray-700 mb-8 italic">
              "{testimonials[currentTestimonial].quote}"
            </p>

            <div className="border-t border-gray-200 pt-6">
              <p className="font-semibold text-gray-900">
                {testimonials[currentTestimonial].author}
              </p>
              <p className="text-sm text-gray-600">
                {testimonials[currentTestimonial].role}
              </p>
            </div>

            <div className="flex gap-2 mt-8 justify-center">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentTestimonial(i)}
                  className={`w-2.5 h-2.5 rounded-full transition ${
                    i === currentTestimonial ? "bg-gray-900" : "bg-gray-300"
                  }`}
                  aria-label={`Testimonial ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 px-6 bg-gray-900 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Unlock Campus Talent?
          </h2>
          <p className="text-lg text-gray-300 mb-10">
            Join 10,000+ students and clients already growing together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="group flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition transform hover:scale-105">
              Launch Your Gig Now
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition"
              />
            </button>
            <button className="px-8 py-4 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 transition border border-gray-700">
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-950 text-gray-400 py-12 px-6">
        <div className="max-w-6xl mx-auto text-center text-sm">
          <p>&copy; 2025 GigConnect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
