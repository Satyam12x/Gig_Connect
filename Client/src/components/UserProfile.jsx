import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { User, Briefcase, Link as LinkIcon } from "lucide-react";

const API_BASE = "http://localhost:5000/api";

const UserProfile = () => {
  const params = useParams();
  const { id } = params;
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log("useParams output:", params); // Debug route params
        if (!id || typeof id !== "string" || id === "[object Object]") {
          console.error("Invalid user ID:", id);
          setError("Invalid user ID");
          toast.error("Invalid user ID");
          navigate("/gigs");
          return;
        }

        console.log("Fetching user profile with ID:", id);
        const response = await axios.get(`${API_BASE}/users/${id}`);
        if (!response.data) {
          throw new Error("No user data returned");
        }
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        const errorMessage =
          error.response?.status === 404
            ? "User not found"
            : error.response?.data?.error || "Failed to load user profile";
        setError(errorMessage);
        toast.error(errorMessage);
        navigate("/gigs");
      }
    };

    fetchUser();
  }, [id, navigate, params]);

  if (error) {
    return (
      <div className="container mx-auto p-4 text-red-500 text-center">
        {error}
      </div>
    );
  }

  if (!user) {
    return <div className="container mx-auto p-4 text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">{user.fullName}'s Profile</h1>
      <div className="border rounded-lg p-6 shadow-md">
        <div className="flex items-center mb-4">
          {user.profilePicture && (
            <img
              src={user.profilePicture}
              alt={user.fullName}
              className="w-24 h-24 rounded-full mr-4"
            />
          )}
          <div>
            <h2 className="text-xl font-semibold flex items-center">
              <User className="h-5 w-5 mr-2" />
              {user.fullName}
            </h2>
            <p className="text-gray-600">
              {user.college || "No college specified"}
            </p>
            <p className="text-gray-600">{user.role}</p>
          </div>
        </div>
        <p className="text-gray-600 mb-4">{user.bio || "No bio provided."}</p>
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Skills</h3>
          {user.skills && user.skills.length > 0 ? (
            <ul className="list-disc pl-5">
              {user.skills.map((skill, index) => (
                <li key={index}>
                  {skill.name} ({skill.endorsements} endorsements)
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No skills listed.</p>
          )}
        </div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Certifications</h3>
          {user.certifications && user.certifications.length > 0 ? (
            <ul className="list-disc pl-5">
              {user.certifications.map((cert, index) => (
                <li key={index}>
                  {cert.name} - {cert.issuer}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No certifications listed.</p>
          )}
        </div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Social Links</h3>
          {user.socialLinks &&
          (user.socialLinks.linkedin ||
            user.socialLinks.github ||
            user.socialLinks.instagram) ? (
            <div className="flex gap-4">
              {user.socialLinks.linkedin && (
                <a
                  href={user.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline flex items-center"
                >
                  <LinkIcon className="h-4 w-4 mr-1" />
                  LinkedIn
                </a>
              )}
              {user.socialLinks.github && (
                <a
                  href={user.socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline flex items-center"
                >
                  <LinkIcon className="h-4 w-4 mr-1" />
                  GitHub
                </a>
              )}
              {user.socialLinks.instagram && (
                <a
                  href={user.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline flex items-center"
                >
                  <LinkIcon className="h-4 w-4 mr-1" />
                  Instagram
                </a>
              )}
            </div>
          ) : (
            <p className="text-gray-500">No social links provided.</p>
          )}
        </div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Stats</h3>
          <p className="text-gray-600">
            Gigs Completed: {user.gigsCompleted || 0}
          </p>
          <p className="text-gray-600">Total Gigs: {user.totalGigs || 0}</p>
          <p className="text-gray-600">
            Completion Rate: {(user.completionRate || 0).toFixed(2)}%
          </p>
        </div>
        <button
          onClick={() => navigate("/gigs")}
          className="text-blue-500 hover:underline"
        >
          Back to Gigs
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
