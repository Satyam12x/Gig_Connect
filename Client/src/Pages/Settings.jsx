import React, { useState } from "react";
import { 
  User, 
  Lock, 
  Bell, 
  CreditCard, 
  Shield, 
  Mail, 
  Smartphone, 
  LogOut,
  ChevronRight,
  Save
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);

  // Mock user data - normally fetched from API
  const [formData, setFormData] = useState({
    fullName: "Satyam Pandey",
    email: "satyam@example.com",
    bio: "Full Stack Developer looking for exciting gigs.",
    phone: "+91 98765 43210",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    emailNotifications: true,
    marketingEmails: false,
    publicProfile: true
  });

  const handleSave = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => setLoading(false), 1500);
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "account", label: "Account", icon: CreditCard },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-10">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Settings</h1>
          <p className="text-gray-500 mt-2">Manage your account preferences and personal details.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-28">
              <div className="p-2 space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
                        isActive 
                          ? "bg-blue-50 text-blue-600" 
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={18} className={isActive ? "text-blue-600" : "text-gray-400"} />
                        <span>{tab.label}</span>
                      </div>
                      {isActive && <ChevronRight size={16} />}
                    </button>
                  );
                })}
              </div>
              <div className="p-2 border-t border-gray-100 mt-2">
                <button className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors text-sm font-medium">
                  <LogOut size={18} />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 min-h-[500px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  
                  {activeTab === "profile" && (
                    <form onSubmit={handleSave} className="space-y-6">
                      <div className="pb-4 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
                        <p className="text-sm text-gray-500 mt-1">Update your public profile details.</p>
                      </div>

                      <div className="flex flex-col md:flex-row gap-6 items-start">
                        <div className="w-full md:w-auto flex flex-col items-center gap-4">
                          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-3xl font-bold text-gray-400 overflow-hidden border-4 border-white shadow-md">
                            {/* Placeholder for avatar */}
                            SP
                          </div>
                          <button type="button" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                            Change Avatar
                          </button>
                        </div>

                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Full Name</label>
                            <div className="relative">
                              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                              <input 
                                type="text" 
                                value={formData.fullName} 
                                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Email Address</label>
                            <div className="relative">
                              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                              <input 
                                type="email" 
                                value={formData.email} 
                                disabled
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed outline-none"
                              />
                            </div>
                          </div>

                          <div className="col-span-full space-y-2">
                            <label className="text-sm font-medium text-gray-700">Bio</label>
                            <textarea 
                              rows="4" 
                              value={formData.bio} 
                              onChange={(e) => setFormData({...formData, bio: e.target.value})}
                              className="w-full p-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-6 flex justify-end">
                        <button 
                          type="submit" 
                          disabled={loading}
                          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
                          Save Changes
                        </button>
                      </div>
                    </form>
                  )}

                  {activeTab === "account" && (
                     <div className="space-y-6">
                       <div className="pb-4 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900">Account Settings</h2>
                        <p className="text-sm text-gray-500 mt-1">Manage your payment methods and account preferences.</p>
                      </div>
                      
                      <div className="p-6 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-4">
                         <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                            <CreditCard size={24} />
                         </div>
                         <div>
                            <h3 className="font-bold text-gray-900">Payment Methods</h3>
                            <p className="text-sm text-gray-600 mt-1 mb-3">You have not added any payment methods yet.</p>
                            <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                              + Add Payment Method
                            </button>
                         </div>
                      </div>

                      <div className="space-y-4 pt-4">
                          <h3 className="font-bold text-gray-900">Account Control</h3>
                          <div className="flex items-center justify-between p-4 rounded-xl border border-red-100 bg-red-50/30">
                             <div>
                               <p className="font-semibold text-gray-900">Delete Account</p>
                               <p className="text-sm text-gray-500">Permanently remove your account and all data.</p>
                             </div>
                             <button className="text-red-600 border border-red-200 bg-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors">
                               Delete
                             </button>
                          </div>
                      </div>
                     </div>
                  )}

                  {activeTab === "security" && (
                    <form onSubmit={handleSave} className="space-y-6">
                      <div className="pb-4 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900">Security</h2>
                        <p className="text-sm text-gray-500 mt-1">Update your password and enhance account security.</p>
                      </div>

                      <div className="space-y-4 max-w-lg">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Current Password</label>
                            <div className="relative">
                              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                              <input 
                                type="password" 
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                placeholder="••••••••"
                              />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">New Password</label>
                            <div className="relative">
                              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                              <input 
                                type="password" 
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                placeholder="••••••••"
                              />
                            </div>
                        </div>
                         <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
                            <div className="relative">
                              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                              <input 
                                type="password" 
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                placeholder="••••••••"
                              />
                            </div>
                        </div>
                      </div>

                      <div className="pt-4 flex justify-end">
                        <button className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-md">
                          Update Password
                        </button>
                      </div>
                    </form>
                  )}

                  {activeTab === "notifications" && (
                    <div className="space-y-6">
                       <div className="pb-4 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
                        <p className="text-sm text-gray-500 mt-1">Choose how you want to be notified.</p>
                      </div>

                      <div className="space-y-4">
                        {[
                          { id: 'emailNotifications', label: 'Email Notifications', desc: 'Receive emails about your account activity.' },
                          { id: 'marketingEmails', label: 'Marketing Emails', desc: 'Receive emails about new features and special offers.' }
                        ].map((setting) => (
                           <label key={setting.id} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer">
                             <div className="relative flex items-center">
                               <input 
                                  type="checkbox" 
                                  checked={formData[setting.id]} 
                                  onChange={(e) => setFormData({...formData, [setting.id]: e.target.checked})}
                                  className="peer sr-only"
                               />
                               <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                             </div>
                             <div>
                               <p className="font-semibold text-gray-900">{setting.label}</p>
                               <p className="text-sm text-gray-500">{setting.desc}</p>
                             </div>
                           </label>
                        ))}
                      </div>
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Settings;
