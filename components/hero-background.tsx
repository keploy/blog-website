import React from "react";
import { Terminal, GitBranch, Network, Database, Activity } from "lucide-react";

const HeroBackground = () => (
  <div className="absolute inset-0 pointer-events-none">
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/5 via-blue-900/3 to-orange-900/5"></div>

      <div className="absolute inset-0">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-gradient-to-br from-blue-900/8 to-slate-800/6 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute top-1/3 -right-32 w-80 h-80 bg-gradient-to-br from-orange-500/10 to-amber-400/8 rounded-full blur-2xl animate-float-delayed"></div>
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-gradient-to-br from-slate-700/6 to-blue-800/8 rounded-full blur-3xl animate-pulse-slow"></div>

        <div className="absolute top-20 right-1/3 w-48 h-48 bg-gradient-to-br from-orange-400/12 to-amber-300/10 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-32 right-20 w-56 h-56 bg-gradient-to-br from-blue-800/8 to-slate-700/6 rounded-full blur-2xl animate-bounce-slow"></div>
      </div>

      <div className="absolute inset-0 opacity-20">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1200 800"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <linearGradient
              id="lineGradient1"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#FF7849" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0B1120" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient
              id="lineGradient2"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#0B1120" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#FF9B6A" stopOpacity="0.15" />
            </linearGradient>
          </defs>
          <path
            d="M100,200 Q300,100 500,200 T900,150"
            stroke="url(#lineGradient1)"
            strokeWidth="2"
            fill="none"
            className="animate-pulse-slow"
          />
          <path
            d="M200,400 Q400,300 600,400 T1000,350"
            stroke="url(#lineGradient2)"
            strokeWidth="1.5"
            fill="none"
            className="animate-float"
          />
          <path
            d="M50,600 Q250,500 450,600 T750,550"
            stroke="url(#lineGradient1)"
            strokeWidth="1"
            fill="none"
            className="animate-bounce-slow"
          />
          <circle
            cx="100"
            cy="200"
            r="4"
            fill="#FF7849"
            opacity="0.6"
            className="animate-pulse"
          />
          <circle
            cx="500"
            cy="200"
            r="3"
            fill="#0B1120"
            opacity="0.4"
            className="animate-float"
          />
          <circle
            cx="900"
            cy="150"
            r="5"
            fill="#FF9B6A"
            opacity="0.5"
            className="animate-bounce-slow"
          />
          <circle
            cx="200"
            cy="400"
            r="3"
            fill="#FF7849"
            opacity="0.7"
            className="animate-pulse-slow"
          />
          <circle
            cx="600"
            cy="400"
            r="4"
            fill="#0B1120"
            opacity="0.3"
            className="animate-float-delayed"
          />
          <circle
            cx="1000"
            cy="350"
            r="3"
            fill="#FF9B6A"
            opacity="0.6"
            className="animate-pulse"
          />
        </svg>
      </div>

      <div className="absolute inset-0">
        <div className="absolute top-24 left-16 w-16 h-10 bg-gradient-to-r from-orange-500/15 to-amber-400/10 rounded-md rotate-12 animate-float border border-orange-200/20"></div>
        <div className="absolute top-40 right-32 w-20 h-8 bg-gradient-to-r from-slate-700/10 to-blue-800/8 rounded-lg -rotate-6 animate-float-delayed border border-slate-300/15"></div>
        <div className="absolute bottom-48 left-1/3 w-14 h-12 bg-gradient-to-r from-orange-400/12 to-orange-600/8 rounded-md rotate-45 animate-bounce-slow border border-orange-300/20"></div>
        <div className="absolute top-1/2 right-1/4 w-18 h-6 bg-gradient-to-r from-blue-700/8 to-slate-800/6 rounded-full rotate-12 animate-pulse-slow border border-blue-200/15"></div>
        <div className="absolute bottom-32 right-16 w-12 h-14 bg-gradient-to-r from-amber-500/10 to-orange-500/12 rounded-lg -rotate-12 animate-float border border-amber-200/20"></div>

        <div className="absolute top-32 left-1/2 w-8 h-8 bg-gradient-to-br from-orange-400/20 to-amber-300/15 rounded-full animate-pulse border border-orange-300/25"></div>
        <div className="absolute bottom-40 left-20 w-6 h-6 bg-gradient-to-br from-slate-600/15 to-blue-700/10 rounded-full animate-float-delayed border border-slate-300/20"></div>
        <div className="absolute top-1/3 right-12 w-10 h-10 bg-gradient-to-br from-orange-500/18 to-orange-700/12 rounded-full animate-bounce-slow border border-orange-400/25"></div>
      </div>

      <div className="absolute inset-0 opacity-15">
        <div className="absolute top-28 left-1/4 animate-float-delayed">
          <Network className="w-5 h-5 text-orange-600" />
        </div>
        <div className="absolute bottom-36 right-1/3 animate-bounce-slow">
          <Database className="w-4 h-4 text-slate-700" />
        </div>
        <div className="absolute top-1/2 left-16 animate-pulse-slow">
          <Activity className="w-6 h-6 text-orange-500" />
        </div>
        <div className="absolute top-20 right-20 animate-float">
          <Terminal className="w-4 h-4 text-slate-600" />
        </div>
        <div className="absolute bottom-20 left-1/2 animate-float-delayed">
          <GitBranch className="w-5 h-5 text-orange-400" />
        </div>
      </div>

      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(11, 17, 32, 0.4) 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      ></div>

      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
    </div>
  </div>
);

export default HeroBackground;
