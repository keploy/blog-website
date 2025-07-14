import { FeaturedCardIcons } from "../components/navbar/icons";

import {
  BookOpen,
  Code,
  Terminal,
  Building,
  Server,
  Webhook,
  Puzzle,
  RefreshCcw,
  GanttChart,
  Database,
  FileCode2,
  GitBranch,
  Github,
  MessageSquare,
  Users,
  Zap,
  Trophy,
  BookMarked,
  Newspaper,
  PlayCircle,
  Library,
  GitFork,
} from "lucide-react";

import IntegrationTest from "../public/images/nav/integration-test.webp";
import UnitTest from "../public/images/nav/unit-test.webp";
import APITest from "../public/images/nav/api-test.webp";
import DocsImg from "../public/images/nav/doc.webp";
import BlogImg from "../public/images/nav/blogs.webp";
import CodeCoverage from "../public/images/nav/code-coverages.webp";
import DeveloperProductivity from "../public/images/nav/developer-productivity.webp";
import Cicd from "../public/images/nav/ci-cd.webp";
import AboutUs from "../public/images/nav/about-us.webp";
import Events from "../public/images/nav/events.webp";
import PartnerWithUs from "../public/images/nav/partner-with-us.webp";
import ContactUs from "../public/images/nav/resource-1.webp";
import CommunityBg from "../public/images/nav/resource-2.webp";
import circleArrow from "../public/images/nav/circle-arrow.webp";
import heart from "../public/images/nav/heart.webp";
import books from "../public/images/nav/book.webp";
import MigrationGuide from "../public/images/nav/user-manual.webp"

export const productsNav = {
  mainColumns: [
    {
      title: "Core Products",
      isClickable: true,
      href: "/products",
      items: [
        {
          title: "Open Source Testing",
          href: "https://github.com/keploy/keploy",
          description: "Free self-hosted testing solution",
          icon: Terminal,
          iconColor: "text-green-600",
        },
        {
          title: "Enterprise Solution",
          href: "https://app.keploy.io",
          description: "Advanced features for teams",
          icon: Building,
          iconColor: "text-blue-600",
        },
      ],
    },
    {
      title: "Key Features",
      isClickable: true,
      href: "/features",
      items: [
        {
          title: "API Recording & Replay",
          href: "https://keploy.io/docs/concepts/what-is-keploy/#step-1--record-unique-network-interactions-as-test-case",
          description: "Record and replay API calls",
          icon: Webhook,
          iconColor: "text-indigo-600",
        },
        {
          title: "Automatic Mocking",
          href: "https://keploy.io/docs/concepts/reference/glossary/mocks/#overcoming-the-challenges",
          description: "Smart dependency mocking",
          icon: Puzzle,
          iconColor: "text-orange-600",
        },
        {
          title: "CI/CD Integration",
          href: "https://keploy.io/docs/concepts/what-are-keploy-features/#-combined-test-coverage-in-cicd",
          description: "Seamless pipeline integration",
          icon: RefreshCcw,
          iconColor: "text-cyan-600",
        },
        {
          title: "Multi Purpose Mocks",
          href: "https://keploy.io/docs/concepts/what-are-keploy-features/#%EF%B8%8F-multi-purpose-mocks",
          description: "Flexible mock generation",
          icon: GanttChart,
          iconColor: "text-pink-600",
        },
      ],
    },
  ],
  featuredContent: {
    title: "Customer Stories",
    isClickable: true,
    href: "#0",
    quickLinksTitle: "Quick Resources",
    featuredCard: {
      title: "Maruti Suzuki: How Test Automation Reduced Release Cycles by 70%",
      logo: FeaturedCardIcons.client01,
      logoBg: "bg-blue-50",
      href: "https://www.g2.com/products/keploy/",
      target: "_blank",
    },
    links: [
      // {
      //   title: "Compare Plans",
      //   href: "#pricing",
      //   icon: Trophy,
      //   iconColor: "text-yellow-600",
      // },
      {
        title: "Read Tech Blogs",
        href: "/blog",
        icon: BookMarked,
        iconColor: "text-emerald-600",
      },
      {
        title: "Schedule Demo",
        href: "https://calendar.app.google/cXVaj6hbMUjvmrnt9",
        icon: PlayCircle,
        iconColor: "text-red-600",
      },
    ],
  },
  cardContent: [
    {
      title: "Unit Testing",
      description: "Generate unit tests with mocks in seconds",
      href: "https://keploy.io/unit-test-generator",
      image: UnitTest,
      fontColor: "text-primary/80",
    },
    {
      title: "API Testing",
      description: "Automatically record, replay, and validate APIs",
      href: "https://keploy.io/api-testing",
      image: APITest,
      fontColor: "text-primary/80",
    },
    {
      title: "Integration Testing",
      description: "Open-source testing infrastructure for devs",
      href: "https://github.com/keploy/",
      image: IntegrationTest,
      fontColor: "text-primary/80",
    },
  ],
};
// changed 'keploy.io/test-data-generator' to '/test-data-generator'
export const solutionsNav = {
  mainColumns: [
    {
      title: "Testing Types",
      isClickable: true,
      href: "/solutions",
      items: [
        {
          title: "Test Data Generation",
          href: "/test-data-generator",
          description: "Generate realistic test data",
          icon: Database,
          iconColor: "text-blue-600",
        },
        {
          title: "Test Case Generation",
          href: "/test-case-generator",
          description: "Auto-generate test cases",
          icon: FileCode2,
          iconColor: "text-purple-600",
        },
        {
          title: "Unit Testing",
          href: "/unit-test-generator",
          description: "Automated unit tests",
          icon: Code,
          iconColor: "text-green-600",
        },
        {
          title: "Code Coverage",
          href: "/code-coverage",
          description: "Comprehensive coverage analysis",
          icon: Server,
          iconColor: "text-indigo-600",
        },
      ],
    },
    {
      title: "Testing Methods",
      isClickable: true,
      href: "/methods",
      items: [
        {
          title: "CI Testing",
          href: "/continuous-integration-testing",
          description: "Continuous integration testing",
          icon: RefreshCcw,
          iconColor: "text-cyan-600",
        },
        {
          title: "Regression Testing",
          href: "/regression-testing",
          description: "Automated regression tests",
          icon: GitBranch,
          iconColor: "text-orange-600",
        },
        {
          title: "API Testing",
          href: "/api-testing",
          description: "End-to-end API testing",
          icon: Webhook,
          iconColor: "text-pink-600",
        },
        {
          title: "Contract Testing",
          href: "/contract-testing",
          description: "API contract validation",
          icon: FileCode2,
          iconColor: "text-yellow-600",
        },
      ],
    },
  ],
  featuredContent: {
    title: "Success Stories",
    quickLinksTitle: "Integration Resources",
    isClickable: true,
    href: "https://www.g2.com/products/keploy/",
    target: "_blank",
    featuredCard: {
      title: "Maruti Suzuki",
      subtitle: "Achieving 87% API Test Coverage with Keploy",
      logo: FeaturedCardIcons.client01,
      logoBg: "bg-indigo-50",
      href: "https://www.g2.com/products/keploy/",
      target: "_blank",
    },
    links: [
      {
        title: "View All Integrations",
        href: "/docs/ci-cd/github/",
        icon: Puzzle,
        iconColor: "text-violet-600",
      },
      // {
      //   title: "Integration Docs",
      //   href: "https://keploy.io/docs/ci-cd/github/",
      //   icon: BookOpen,
      //   iconColor: "text-emerald-600",
      // },
      // {
      //   title: "Request Integration",
      //   href: "/integrations/request",
      //   icon: MessageSquare,
      //   iconColor: "text-blue-600",
      // },
    ],
  },
  cardContent: [
    {
      title: "Code Coverage",
      href: "https://keploy.io/code-coverage",
      image: CodeCoverage,
    },
    {
      title: "Developer Productivity",
      href: "/developer-productivity",
      image: DeveloperProductivity,
    },
    {
      title: "CI Pipelines",
      href: "https://keploy.io/docs/ci-cd/github/",
      image: Cicd,
    },
  ],
};

export const developersNav = {
  mainColumns: [
    {
      title: "Documentation",
      isClickable: true,
      href: "/docs",
      items: [
        {
          title: "Getting Started",
          href: "/docs",
          description: "Quick setup guide",
          icon: Zap,
          iconColor: "text-yellow-600",
        },
        {
          title: "API Reference",
          href: "/docs/running-keploy/cli-commands/",
          description: "Detailed API documentation",
          icon: Code,
          iconColor: "text-purple-600",
        },
        {
          title: "Tutorials",
          href: "https://youtube.com/playlist?list=PLuImHQnqnB_bhIBFe24-rOd_khRJtdGAW&si=KrydihzyHmZUH_ZE",
          description: "Step-by-step guides",
          icon: BookOpen,
          iconColor: "text-blue-600",
        },
        {
          title: "FAQs",
          href: "/docs/keploy-explained/faq/",
          description: "Testing guidelines",
          icon: Trophy,
          iconColor: "text-green-600",
        },
      ],
    },
    {
      title: "Developer Resources",
      isClickable: true,
      href: "/resources",
      items: [
        // {
        //   title: "Integration Guides",
        //   href: "/docs/ci-cd/github/",
        //   description: "Setup instructions",
        //   icon: Puzzle,
        //   iconColor: "text-indigo-600",
        // },
        {
          title: "Community Articles",
          href: "/blog/community",
          description: "Developer stories",
          icon: Newspaper,
          iconColor: "text-orange-600",
        },
        {
          title: "Technical Blog",
          href: "https://keploy.io/blog/technology",
          description: "Deep dive articles",
          icon: BookMarked,
          iconColor: "text-pink-600",
        },
        {
          title: "GitHub",
          href: "https://github.com/keploy/keploy",
          description: "Open source code",
          icon: Github,
          iconColor: "text-gray-600",
        },
      ],
    },
  ],
  featuredContent: {
    title: "Featured Story",
    quickLinksTitle: "Community Links",
    isClickable: true,
    href: "/case-studies",
    featuredCard: {
      title: "Finneva: How Automated Testing Enabled 3x Faster Development",
      logo: FeaturedCardIcons.client04,
      logoBg: "bg-gray-50",
      href: "https://www.g2.com/products/keploy/",
      target: "_blank",
    },
    links: [
      {
        title: "Slack",
        href: "https://join.slack.com/t/keploy/shared_invite/zt-357qqm9b5-PbZRVu3Yt2rJIa6ofrwWNg",
        icon: MessageSquare,
        iconColor: "text-indigo-600",
      },
      {
        title: "Twitter",
        href: "https://twitter.com/keployio",
        icon: Library,
        iconColor: "text-violet-600",
      },
      {
        title: "Youtube",
        href: "https://youtube.com/playlist?list=PLuImHQnqnB_bhIBFe24-rOd_khRJtdGAW&si=KrydihzyHmZUH_ZE",
        icon: MessageSquare,
        iconColor: "text-indigo-600",
      },
      {
        title: "Contribute",
        href: "https://keploy.io/docs/keploy-explained/contribution-guide/",
        icon: GitFork,
        iconColor: "text-emerald-600",
      },
    ],
  },
  cardContent: [
    {
      title: "Docs",
      href: "https://keploy.io/docs",
      image: DocsImg,
      minHeight: "min-h-[200px]",
    },
    {
      title: "Technical Blog",
      href: "https://keploy.io/blog",
      image: BlogImg,
      minHeight: "min-h-[180px]",
    },
  ],
  developerStackedCards: [
    {
      title: "Community Stories",
      subtitle: "Insights and Stories",
      href: "https://www.g2.com/products/keploy/reviews",
      icon: heart,
      badge: "Badge",
    },
    {
      title: "Tutorials",
      subtitle: "Learning by Doing",
      href: "https://www.youtube.com/playlist?list=PLuImHQnqnB_b3MbF1_873XeMhXkaZPpwV",
      icon: books,
      badge: "Badge",
    },
    {
      title: "Migration Guide",
      subtitle: "Upgrade With Confidence",
      href: "https://keploy.io/blog/technology/migration-guide-from-restassured-to-keploy",
      icon: MigrationGuide,
      badge: "Badge",
    },
  ],
};

export const resourcesNav = {
  mainColumns: [
    {
      title: "Company",
      isClickable: true,
      href: "/company",
      items: [
        {
          title: "About Us",
          href: "/about",
          description: "Our story and mission",
          icon: Users,
          iconColor: "text-blue-600",
        },
        // {
        //   title: "Contact",
        //   href: "/contact",
        //   description: "Get in touch",
        //   icon: MessageSquare,
        //   iconColor: "text-green-600",
        // },
        {
          title: "Careers",
          href: "/about/#careers",
          description: "Join our team",
          icon: Building,
          iconColor: "text-purple-600",
        },
        // {
        //   title: "Pricing",
        //   href: "#pricing",
        //   description: "Plans and packages",
        //   icon: Database,
        //   iconColor: "text-indigo-600",
        // },
      ],
    },
    {
      title: "Learning Center",
      isClickable: true,
      href: "/learn",
      items: [
        // {
        //   title: "Case Studies",
        //   href: "/case-studies",
        //   description: "Customer success stories",
        //   icon: BookMarked,
        //   iconColor: "text-pink-600",
        // },
        {
          title: "Blog",
          href: "https://keploy.io/blog",
          description: "News and updates",
          icon: Newspaper,
          iconColor: "text-orange-600",
        },
        {
          title: "Events",
          href: "https://lu.ma/keploy",
          description: "Join us at events",
          icon: PlayCircle,
          iconColor: "text-red-600",
        },
        // {
        //   title: "Newsletter",
        //   href: "/newsletter",
        //   description: "Stay updated",
        //   icon: Coffee,
        //   iconColor: "text-yellow-600",
        // },
      ],
    },
  ],
  featuredContent: {
    title: "Featured Content",
    quickLinksTitle: "Popular Resources",
    isClickable: true,
    href: "https://keploy.io/blog/technology/migration-guide-from-restassured-to-keploy",
    featuredCard: {
      title: "Migrating from RestAssured to Keploy",
      logo: FeaturedCardIcons.client02,
      href: "https://keploy.io/blog/technology/migration-guide-from-restassured-to-keploy",
      logoBg: "bg-gray-50",
    },
    links: [
      {
        title: "Latest Articles",
        href: "/blog",
        icon: Newspaper,
        iconColor: "text-cyan-600",
      },
      {
        title: "Upcoming Events",
        href: "https://lu.ma/keploy",
        icon: PlayCircle,
        iconColor: "text-purple-600",
      },
      // {
      //   title: "Community",
      //   href: "/community",
      //   icon: Users,
      //   iconColor: "text-green-600",
      // },
    ],
  },
  cardContent: [
    {
      title: "About Us",
      href: "https://keploy.io/about",
      image: AboutUs,
      minHeight: "min-h-[200px]",
      fontColor: "text-white",
    },
    {
      title: "Partner With Us",
      href: "https://calendar.app.google/cXVaj6hbMUjvmrnt9",
      image: PartnerWithUs,
      minHeight: "min-h-[180px]",
      fontColor: "text-white",
    },
    {
      title: "Events",
      href: "https://calendar.app.google/cXVaj6hbMUjvmrnt9",
      image: Events,
      minHeight: "min-h-[180px]",
      fontColor: "text-white",
    },
  ],
  resourceStackedCards: [
    {
      title: "Contact Us",
      subtitle: "",
      href: "https://calendar.app.google/cXVaj6hbMUjvmrnt9",
      icon: circleArrow,
      backgroundImage: ContactUs,
      // badge: "Optional Badge",
    },
    {
      title: "Community Forum",
      subtitle: "",
      href: "https://github.com/keploy",
      icon: circleArrow,
      backgroundImage: CommunityBg,
      // badge: "Optional Badge",
    },
  ],
};

export const footerLinks = {
  solutions: [
    { title: "Test Generation", href: "/test-case-generation" },
    { title: "API Testing", href: "/api-testing" },
    { title: "Mock Generation", href: "/test-data-generator" },
    { title: "CI/CD Integration", href: "/docs/ci-cd/github" },
  ],
  support: [
    { title: "Documentation", href: "https://keploy.io/docs" },
    {
      title: "Help Center",
      href: "https://join.slack.com/t/keploy/shared_invite/zt-357qqm9b5-PbZRVu3Yt2rJIa6ofrwWNg",
    },
    // { title: "Status", href: "/status" },
    // { title: "Contact", href: "/contact" },
  ],
  company: [
    { title: "About", href: "/about" },
    { title: "Blog", href: "https://keploy.io/blog" },
    { title: "Careers", href: "/about#careers" },
    // { title: "Press", href: "/press" },
  ],
  legal: [
    { title: "Privacy", href: "https://keploy.io/privacy-policy" },
    // { title: "Terms", href: "/terms" },
    // { title: "Security", href: "/security" },
  ],
};
