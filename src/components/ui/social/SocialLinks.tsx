"use client";

import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import { Link } from "@heroui/react";

interface SocialLink {
  name: string;
  icon: React.ReactNode;
  url: string;
  color: string;
}

const SocialLinks: React.FC = () => {
  const socialLinks: SocialLink[] = [
    {
      name: "Facebook",
      icon: <Facebook size={20} />,
      url: "https://facebook.com/cineverse",
      color: "hover:text-blue-600",
    },
    {
      name: "Instagram",
      icon: <Instagram size={20} />,
      url: "https://instagram.com/cineverse",
      color: "hover:text-pink-500",
    },
    {
      name: "LinkedIn",
      icon: <Linkedin size={20} />,
      url: "https://linkedin.com/company/cineverse",
      color: "hover:text-blue-700",
    },
    {
      name: "YouTube",
      icon: <Youtube size={20} />,
      url: "https://youtube.com/@cineverse",
      color: "hover:text-red-500",
    },
  ];

  return (
    <div className="flex items-center space-x-4">
      {socialLinks.map((social) => (
        <Link
          key={social.name}
          href={social.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-gray-500 dark:text-gray-400 transition-colors duration-200 ${social.color}`}
          aria-label={social.name}
          title={social.name}
        >
          {social.icon}
        </Link>
      ))}
    </div>
  );
};

export default SocialLinks;
