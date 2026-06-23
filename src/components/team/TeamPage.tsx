'use client'

import Image from "next/image"
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { 
  Users, 
  Shield, 
  Star, 
  Github, 
  Twitter, 
  Linkedin, 
  Globe,
  Mail,
  MapPin,
  Calendar,
  Award,
  Zap,
  Heart,
  Eye,
  Sparkles
} from 'lucide-react'
import { cn } from '@/utils/helpers'

interface TeamMember {
  id: string
  name: string
  username: string
  role: string
  bio: string
  avatar_url: string | null
  location?: string
  website?: string
  joined_date: string
  is_admin: boolean
  is_verified: boolean
  social_links?: {
    github?: string
    twitter?: string
    linkedin?: string
  }
}

export function TeamPage() {
  const [selectedMember, setSelectedMember] = useState<string | null>(null)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  const { data: teamMembers = [], isPending: loading } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const response = await fetch('/api/team')
      if (!response.ok) throw new Error('Failed to fetch team members')
      return response.json() as Promise<TeamMember[]>
    },
    staleTime: 60000,
  })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 12,
        duration: 0.6,
      },
    },
    hover: {
      y: -10,
      scale: 1.02,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 10,
      },
    },
  }

  const floatingVariants = {
    initial: { y: 0 },
    animate: {
      y: [-5, 5, -5],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut" as const,
      },
    },
  }

  const glowVariants = {
    initial: { opacity: 0 },
    hover: {
      opacity: 1,
      transition: {
        duration: 0.3,
      },
    },
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center relative" style={{
        background: 'linear-gradient(to bottom right, hsl(var(--background)), hsl(var(--background) / 0.95), hsl(var(--background)))'
      }}>
        <div className="absolute inset-0 bg-linear-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full relative z-10"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: 'linear-gradient(to bottom right, hsl(var(--background)), hsl(var(--background) / 0.95), hsl(var(--background)))'
    }}>
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-2000" />
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-4000" />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="relative z-10 text-center pt-20 pb-12"
      >
        <motion.div
          variants={floatingVariants}
          initial="initial"
          animate="animate"
          className="inline-block mb-6"
        >
          <div className="relative">
            <Users className="w-16 h-16 text-purple-400 mx-auto" />
            <motion.div
              variants={glowVariants}
              className="absolute inset-0 w-16 h-16 bg-purple-400 rounded-full blur-xl"
            />
          </div>
        </motion.div>
        
        <h1 className="text-6xl font-bold mb-4 bg-clip-text text-transparent bg-linear-to-r from-purple-400 to-pink-400">
          Đội ngũ của CineVerse
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto px-4">
          Gặp gỡ những người đam mê và tài năng đằng sau CineVerse
        </p>
      </motion.div>

      {/* Team Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 container mx-auto px-4 pb-20"
      >
        {teamMembers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <Shield className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-muted-foreground mb-2">
              Chưa có thành viên nào được hiển thị
            </h3>
            <p className="text-muted-foreground">
              Chỉ những quản trị viên đã xác thực mới xuất hiện ở đây
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {teamMembers.map((member) => (
              <motion.div
                key={member.id}
                variants={cardVariants}
                whileHover="hover"
                onHoverStart={() => setHoveredCard(member.id)}
                onHoverEnd={() => setHoveredCard(null)}
                onClick={() => setSelectedMember(selectedMember === member.id ? null : member.id)}
                className="relative"
              >
                {/* Glow Effect */}
                {hoveredCard === member.id && (
                  <motion.div
                    layoutId={`glow-${member.id}`}
                    className="absolute inset-0 bg-linear-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-50"
                  />
                )}
                
                {/* Card */}
                <div className="relative bg-background/80 backdrop-blur-lg rounded-2xl p-6 border border-border/20 cursor-pointer transition-all duration-300 hover:bg-background/90">
                  {/* Verified Badge */}
                  {member.is_verified && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: "spring" }}
                      className="absolute -top-2 -right-2 z-10"
                    >
                      <div className="relative">
                        <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-purple-500 rounded-full blur-md" />
                        <div className="relative bg-linear-to-r from-blue-500 to-purple-500 p-1 rounded-full">
                          <Shield className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Avatar */}
                  <div className="relative mb-4">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400 }}
                      className="relative w-24 h-24 mx-auto"
                    >
                      {member.avatar_url ? (
                        <Image
                          src={member.avatar_url}
                          alt={member.name}
                          width={96}
                          height={96}
                          className="w-full h-full rounded-full object-cover border-3 border-white/30"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-linear-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                          <span className="text-2xl font-bold text-white">
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      
                      {/* Online Indicator */}
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [1, 0.7, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-white"
                      />
                    </motion.div>
                  </div>

                  {/* Info */}
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-white mb-1 flex items-center justify-center gap-2">
                      {member.name}
                      {member.is_admin && (
                        <motion.div
                          initial={{ rotate: -180 }}
                          animate={{ rotate: 0 }}
                          transition={{ delay: 0.5, type: "spring" }}
                        >
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        </motion.div>
                      )}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-2">@{member.username}</p>
                    <p className="text-foreground text-sm mb-4">{member.role}</p>
                    
                    {/* Expanded Info */}
                    {selectedMember === member.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 space-y-3"
                      >
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {member.bio || 'Không có tiểu sử'}
                        </p>
                        
                        {member.location && (
                          <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                            <MapPin className="w-4 h-4" />
                            <span>{member.location}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                          <Calendar className="w-4 h-4" />
                          <span>Tham gia {new Date(member.joined_date).toLocaleDateString('vi-VN')}</span>
                        </div>

                        {/* Social Links */}
                        {member.social_links && (
                          <div className="flex justify-center gap-3 pt-2">
                            {member.social_links.github && (
                              <motion.a
                                href={member.social_links.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.2, rotate: 5 }}
                                whileTap={{ scale: 0.9 }}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <Github className="w-5 h-5" />
                              </motion.a>
                            )}
                            {member.social_links.twitter && (
                              <motion.a
                                href={member.social_links.twitter}
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.2, rotate: -5 }}
                                whileTap={{ scale: 0.9 }}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <Twitter className="w-5 h-5" />
                              </motion.a>
                            )}
                            {member.social_links.linkedin && (
                              <motion.a
                                href={member.social_links.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.2, rotate: 5 }}
                                whileTap={{ scale: 0.9 }}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <Linkedin className="w-5 h-5" />
                              </motion.a>
                            )}
                            {member.website && (
                              <motion.a
                                href={member.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.2, rotate: -5 }}
                                whileTap={{ scale: 0.9 }}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <Globe className="w-5 h-5" />
                              </motion.a>
                            )}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>

                  {/* Hover Effect Overlay */}
                  {hoveredCard === member.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-linear-to-t from-purple-600/20 to-transparent rounded-2xl pointer-events-none"
                    />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Footer Stats */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="relative z-10 pb-12"
      >
        <div className="container mx-auto px-4">
          <div className="bg-background/80 backdrop-blur-lg rounded-2xl p-8 border border-border/10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="space-y-2"
              >
                <div className="flex justify-center">
                  <Users className="w-8 h-8 text-purple-400" />
                </div>
                <h4 className="text-3xl font-bold text-white">{teamMembers.length}</h4>
                <p className="text-muted-foreground">Thành viên</p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="space-y-2"
              >
                <div className="flex justify-center">
                  <Shield className="w-8 h-8 text-blue-400" />
                </div>
                <h4 className="text-3xl font-bold text-white">
                  {teamMembers.filter(m => m.is_verified).length}
                </h4>
                <p className="text-muted-foreground">Đã xác thực</p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="space-y-2"
              >
                <div className="flex justify-center">
                  <Star className="w-8 h-8 text-yellow-400" />
                </div>
                <h4 className="text-3xl font-bold text-white">
                  {teamMembers.filter(m => m.is_admin).length}
                </h4>
                <p className="text-muted-foreground">Quản trị viên</p>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
