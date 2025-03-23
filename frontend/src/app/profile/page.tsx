"use client";

import Profile from "@/types/profile";
import { useState, useEffect, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { getAuthCookie } from "@/lib/auth";
import { getProfile, updateProfile } from "@/lib/api";
import { User, X } from "lucide-react";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Profile>>({});
  const [changedFields, setChangedFields] = useState<Partial<Profile>>({});
  const [newInterest, setNewInterest] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = getAuthCookie();
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const profileData = await getProfile();
        setProfile(profileData);
        setFormData(profileData);
        setChangedFields({});
      } catch (error) {
        setError(error instanceof Error ? error.message : "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSuccessMessage(null);

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (value !== profile?.[name as keyof Profile]) {
      setChangedFields((prev) => ({ ...prev, [name]: value }));
    } else {
      setChangedFields((prev) => {
        const updated = { ...prev };
        delete updated[name as keyof Profile];
        return updated;
      });
    }
  };

  const updateInterests = (updatedInterests: string[]) => {
    setFormData((prev) => ({ ...prev, interests: updatedInterests }));

    const originalInterests = profile?.interests || [];
    const areInterestsDifferent =
      JSON.stringify([...updatedInterests].sort()) !==
      JSON.stringify([...originalInterests].sort());

    if (areInterestsDifferent) {
      setChangedFields((prev) => ({ ...prev, interests: updatedInterests }));
    } else {
      setChangedFields((prev) => {
        const updated = { ...prev };
        delete updated.interests;
        return updated;
      });
    }
  };

  const addInterest = () => {
    if (newInterest.trim() === "") return;

    const currentInterests = formData.interests || [];
    if (currentInterests.includes(newInterest.trim())) {
      setNewInterest("");
      return;
    }

    updateInterests([...currentInterests, newInterest.trim()]);
    setNewInterest("");
    setSuccessMessage(null);
  };

  const removeInterest = (indexToRemove: number) => {
    const currentInterests = formData.interests || [];
    const updatedInterests = currentInterests.filter((_, index) => index !== indexToRemove);

    updateInterests(updatedInterests);
    setSuccessMessage(null);
  };

  const handleInterestKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addInterest();
    } else if (e.key === "Backspace" && newInterest === "") {
      const currentInterests = formData.interests || [];
      if (currentInterests.length > 0) {
        removeInterest(currentInterests.length - 1);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(changedFields).length === 0) return;

    setError(null);
    setSuccessMessage(null);

    try {
      const updatedProfile = await updateProfile(changedFields);
      setProfile(updatedProfile);
      setChangedFields({});
      setSuccessMessage("Successfully updated profile");
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unexpected error occurred");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-purple-50">
        <p className="text-gray-600">Loading profile information...</p>
      </div>
    );
  }

  return (
    <div className="bg-purple-50 min-h-screen">
      <div className="bg-gradient-purple-normal text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8">My Profile</h1>
          <p className="text-xl mb-8 text-purple-100">Manage your personal information</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-200 text-red-700 p-4 mb-6 rounded-lg">
            <p>{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-200 rounded-lg text-green-700 p-4 mb-6">
            <p>{successMessage}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-8 max-w-3xl mx-auto">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Account Information</h3>

          <div className="flex items-center mb-8">
            <div className="bg-purple-100 rounded-full p-5 mr-4">
              <User size={40} className="text-purple-700" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {profile?.firstName || profile?.surname
                  ? `${profile?.firstName || ""} ${profile?.surname || ""}`
                  : "Name not set"}
              </h2>
              <p className="text-gray-600">{profile?.email || "Email not set"}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName || ""}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300"
                  placeholder="Your first name"
                />
              </div>
              <div>
                <label htmlFor="surname" className="block text-sm font-medium text-gray-700 mb-1">
                  Surname
                </label>
                <input
                  type="text"
                  id="surname"
                  name="surname"
                  value={formData.surname || ""}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300"
                  placeholder="Your surname"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300"
                  placeholder="Your email address"
                />
              </div>
              <div>
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber || ""}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300"
                  placeholder="Your phone number"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location || ""}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300"
                  placeholder="Your location"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-1">
                  Interests
                </label>
                <div className="flex items-center flex-wrap p-2 border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-purple-300 bg-white">
                  {(formData.interests || []).map((interest, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-purple-100 text-purple-800 px-3 py-1 rounded-full m-1"
                    >
                      <span className="text-sm">{interest}</span>
                      <button
                        type="button"
                        onClick={() => removeInterest(index)}
                        className="ml-1 text-purple-800 hover:text-purple-900 focus:outline-none"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <input
                    type="text"
                    id="newInterest"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyDown={handleInterestKeyDown}
                    className="flex-grow min-w-20 p-2 border-none focus:outline-none focus:ring-0"
                    placeholder={formData.interests?.length ? "" : "Add interests"}
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">Press Enter to add a new interest</p>
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button
                type="submit"
                className={`font-medium px-6 py-3 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-purple-300 transition-colors duration-200 flex items-center ${
                  Object.keys(changedFields).length === 0
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-purple-600 text-white hover:bg-purple-700"
                }`}
                disabled={Object.keys(changedFields).length === 0}
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
