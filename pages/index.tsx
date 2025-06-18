import Head from "next/head";
import { GetStaticProps } from "next";
import Container from "../components/container";
import Layout from "../components/layout";
import { getAllPostsForCommunity, getAllPostsForTechnology } from "../lib/api";
import Header from "../components/header";
import Link from "next/link";
import { HOME_OG_IMAGE_URL } from "../lib/constants";
import TopBlogs from "../components/topBlogs";
import Testimonials from "../components/testimonials";
import Image from "next/image";
import { motion } from "framer-motion";
import { useSpring, animated } from "@react-spring/web";
import { useState, useEffect } from "react";
import { FiArrowRight, FiTrendingUp, FiUsers, FiBookOpen, FiStar } from "react-icons/fi";
import OpenSourceVectorPng from "../public/images/open-source-vector.png";

// Floating Elements Component
const FloatingElements = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-orange-400/20 rounded-full"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            left: `${20 + i * 15}%`,
            top: `${30 + i * 10}%`,
          }}
        />
      ))}
    </div>
  );
};

// Animated Stats Component
const AnimatedStats = () => {
  const stats = [
    { icon: FiTrendingUp, value: "500+", label: "Articles Published" },
    { icon: FiUsers, value: "10K+", label: "Community Members" },
    { icon: FiBookOpen, value: "50+", label: "Expert Authors" },
    { icon: FiStar, value: "4.9", label: "Average Rating" },
  ];

  return (
    <motion.div 
      className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 mb-8"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          className="relative group"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="bg-white/80 backdrop-blur-sm border border-orange-200/50 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 group-hover:border-orange-400/50">
            <div className="flex justify-center mb-3">
              <div className="p-3 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl text-white">
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

// Interactive Gradient Background
const GradientBackground = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
        style={{
          background: `radial-gradient(circle, rgba(251, 146, 60, 0.3) 0%, rgba(251, 146, 60, 0.1) 50%, transparent 100%)`,
          left: mousePosition.x - 250,
          top: mousePosition.y - 250,
          transition: "all 0.1s ease-out",
        }}
      />
    </div>
  );
};

// Enhanced Hero Section
const EnhancedHero = () => {
  return (
    <div className="relative min-h-screen flex items-start justify-center overflow-hidden">
      <GradientBackground />
      <FloatingElements />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1 
              className="text-6xl md:text-8xl font-bold mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
                Keploy Blog
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Empowering your tech journey with expert advice, cutting-edge insights, and community-driven knowledge
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Link href="/technology">
                <motion.button
                  className="group relative px-8 py-4 bg-gradient-to-r from-orange-400 to-orange-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Explore Technology
                    <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.button>
              </Link>
              
              <Link href="/community">
                <motion.button
                  className="group relative px-8 py-4 border-2 border-orange-400 text-orange-600 font-semibold rounded-2xl hover:bg-orange-400 hover:text-white transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Join Community
                    <FiUsers className="w-5 h-5" />
                  </span>
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Animated Blog Bunny */}
      <motion.div 
        className="absolute right-10 top-1/5 transform -translate-y-1/2 hidden lg:block"
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 0.8 }}
      >
        <motion.div
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src="/blog/images/blog-bunny.png"
            alt="Blog Bunny"
            width={400}
            height={400}
            className="drop-shadow-2xl"
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

// Feature Cards Component
const FeatureCards = () => {
  const features = [
    {
      title: "Expert Insights",
      description: "Learn from industry experts and thought leaders in software testing and automation",
      icon: "🧠",
      gradient: "from-blue-400 to-blue-600"
    },
    {
      title: "Community Driven",
      description: "Join a vibrant community of developers sharing knowledge and experiences",
      icon: "🤝",
      gradient: "from-green-400 to-green-600"
    },
    {
      title: "Latest Trends",
      description: "Stay updated with the latest technologies and best practices in the industry",
      icon: "🚀",
      gradient: "from-purple-400 to-purple-600"
    }
  ];

  return (
    <motion.section 
      className="py-20 relative"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2 
          className="text-4xl md:text-5xl font-bold text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          Why Choose <span className="text-orange-500">Keploy Blog</span>?
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="group relative"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
            >
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:border-orange-300">
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default function Index({ communityPosts, technologyPosts, preview }) {
  return (
    <Layout
      preview={preview}
      featuredImage={HOME_OG_IMAGE_URL}
      Title={`Blog - Keploy`}
      Description={"The Keploy Blog offers in-depth articles and expert insights on software testing, automation, and quality assurance, empowering developers to enhance their testing strategies and deliver robust applications."}>
      <Head>
        <title>{`Engineering | Keploy Blog`}</title>
      </Head>
      
      <Header />
      
      {/* Enhanced Hero Section */}
      <EnhancedHero />
      
      {/* Animated Stats */}
      <Container>
        <AnimatedStats />
      </Container>
      
      {/* Feature Cards */}
      <FeatureCards />
      
      {/* Existing Content */}
      <Container>
        <TopBlogs
          communityPosts={communityPosts}
          technologyPosts={technologyPosts}
        />
        <Testimonials />
      </Container>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ preview = false }) => {
  const allCommunityPosts = await getAllPostsForCommunity(preview);
  const allTehcnologyPosts = await getAllPostsForTechnology(preview);

  return {
    props: {
      communityPosts:
        allCommunityPosts?.edges?.length > 3
          ? allCommunityPosts?.edges?.slice(0, 3)
          : allCommunityPosts?.edges,
      technologyPosts:
        allTehcnologyPosts?.edges?.length > 3
          ? allTehcnologyPosts?.edges?.slice(0, 3)
          : allTehcnologyPosts.edges,
      preview,
    },
    revalidate: 10,
  };
};