'use client';

import {
  X, Home, Folder, Settings, LogOut,
  Bell, BarChart2, FileText, ChevronDown, ChevronUp, Users
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import clsx from 'clsx';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const pathname = usePathname();
  const [expandSettings, setExpandSettings] = useState(false);

  const navSections = [
    {
      title: 'Main',
      items: [
        { label: 'Dashboard', icon: <Home size={20} />, href: '/' },
        { label: 'Team', icon: <Users size={20} />, href: '#' },
        { label: 'Projects', icon: <Folder size={20} />, href: '#' },
      ],
    },
    {
      title: 'Management',
      items: [
        { label: 'Reports', icon: <FileText size={20} />, href: '#' },
        { label: 'Analytics', icon: <BarChart2 size={20} />, href: '#' },
        { label: 'Notifications', icon: <Bell size={20} />, href: '#' },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { label: 'Settings', icon: <Settings size={20} />, href: '#' },
      ],
    },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={clsx(
          'fixed z-50 md:relative bg-gradient-to-b from-gray-800 via-gray-700 to-gray-800 text-white w-64 h-screen flex-col justify-between md:flex transition-transform duration-300 shadow-xl',
          {
            'translate-x-0': isOpen,
            '-translate-x-full': !isOpen,
            'md:translate-x-0': true,
          }
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-600">
            <span className="text-xl font-bold tracking-wide">Control Panel</span>
            <button className="md:hidden" onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {/* Navigation Sections */}
          <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-6">
            {navSections.map((section, idx) => (
              <div key={idx}>
                <h4 className="text-xs uppercase text-gray-400 px-4 mb-2">{section.title}</h4>
                <div className="space-y-1">
                  {section.items.map((item, index) => (
                    <Link key={index} href={item.href}>
                      <div
                        className={clsx(
                          'flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-700 transition cursor-pointer',
                          pathname === item.href && 'bg-gray-700'
                        )}
                      >
                        {item.icon}
                        <span className="text-sm">{item.label}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-600">
            <button
              onClick={() => setExpandSettings(!expandSettings)}
              className="flex items-center justify-between w-full text-sm text-white hover:bg-gray-700 px-1 py-2 rounded-lg transition cursor-pointer"
            >
              <span className="flex items-center gap-2 mx-2">
                <Settings size={18} /> Advanced
              </span>
              {expandSettings ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {expandSettings && (
              <div className="mt-3 text-sm text-gray-400 space-y-2 pl-6">
                <p className="cursor-pointer hover:text-white">Theme Mode</p>
                <p className="cursor-pointer hover:text-white">Keyboard Shortcuts</p>
                <p className="cursor-pointer hover:text-white">Language Settings</p>
              </div>
            )}

            <div className="mt-4 hover:bg-gray-700 py-2 rounded-lg cursor-pointer">
              <button className="flex items-center gap-2 px-3 text-red-500 transition text-md">
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
