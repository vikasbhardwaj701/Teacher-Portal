'use client';

import {
  Menu,
  Upload,
  UserCircle,
  Trash2,
  X,
} from 'lucide-react';
import React, { useRef, useState } from 'react';

interface HeaderProps {
  toggleSidebar: () => void;
}

const avatarOptions = Array.from({ length: 6 }, (_, i) => `https://i.pravatar.cc/100?img=${i + 10}`);

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAvatars, setShowAvatars] = useState(false);
  const [profileUrl, setProfileUrl] = useState<string | null>("https://i.pravatar.cc/40?img=3");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newUrl = URL.createObjectURL(file);
      setProfileUrl(newUrl);
      setDropdownOpen(false);
    }
  };

  const handleChooseAvatar = (url: string) => {
    setProfileUrl(url);
    setShowAvatars(false);
    setDropdownOpen(false);
  };

  const handleRemove = () => {
    setProfileUrl(null);
    setDropdownOpen(false);
    setShowAvatars(false);
  };

  return (
    <header className="sticky top-1 z-50 bg-red-400 rounded shadow mx-1 px-4 py-1.5 flex justify-between items-center border-b">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button className="md:hidden" onClick={toggleSidebar} aria-label="Toggle Sidebar">
          <Menu size={24} />
        </button>
        <h1 className="text-2xl font-bold text-primary">Teacher Portal</h1>
      </div>

      {/* Right side */}
      <div className="relative flex items-center space-x-4">
        <span className="text-md text-gray-700 hidden sm:block font-medium">Vikas</span>

        {profileUrl ? (
          <img
            src={profileUrl}
            alt="Profile"
            className="w-10 h-10 rounded-full cursor-pointer border-1 border-gray-200 hover:opacity-90 "
            onClick={() => setDropdownOpen(!dropdownOpen)}
          />
        ) : (
          <UserCircle
            className="w-10 h-10 text-gray-600 cursor-pointer hover:text-gray-800"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          />
        )}

        {/* Dropdown */}
        {dropdownOpen && (
          <div className="absolute right-0 top-12 bg-white shadow-lg rounded-lg w-56 py-2 z-50 ">
            <button
              className="flex items-center w-full px-4 py-2 hover:bg-gray-100 text-sm cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" /> Upload New
            </button>

            <button
              className="flex items-center w-full px-4 py-2 hover:bg-gray-100 text-sm cursor-pointer"
              onClick={() => setShowAvatars(true)}
            >
              <UserCircle className="w-4 h-4 mr-2" /> Choose Avatar
            </button>

            <button
              className="flex items-center w-full px-4 py-2 hover:bg-gray-100 text-sm text-red-500 cursor-pointer"
              onClick={handleRemove}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Remove Picture
            </button>
          </div>
        )}

        {/* Avatar Selector */}
        {showAvatars && (
          <div className="absolute right-0 top-20 bg-white shadow-xl border border-gray-200 rounded-lg p-4 z-50 w-72">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-gray-700">Choose an Avatar</h3>
              <X size={18} className="cursor-pointer" onClick={() => setShowAvatars(false)} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {avatarOptions.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`avatar-${idx}`}
                  className="w-16 h-16 rounded-full cursor-pointer hover:scale-105 transition"
                  onClick={() => handleChooseAvatar(url)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </header>
  );
};

export default Header;
