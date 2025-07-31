import { Terminal, Brackets, GitBranch } from "lucide-react";

const HeroBackground = () => (
  <div className="absolute inset-0 pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-br from-orange-100/30 via-amber-50/20 to-transparent"></div>

    <div className="absolute top-20 left-8 w-16 h-16 bg-gradient-to-br from-orange-200/20 to-amber-200/20 rounded-lg rotate-12 animate-float z-20"></div>

    <div className="absolute top-24 left-20 animate-float-delayed opacity-20">
      <Terminal className="w-8 h-8 text-orange-400 drop-shadow-lg" />
    </div>

    <div className="absolute top-6 right-10 w-20 h-20 bg-gradient-to-br from-amber-200/15 to-orange-200/15 rounded-full animate-pulse z-20"></div>

    <div className="absolute top-44 right-24 animate-bounce-slower opacity-20 z-40">
      <Brackets className="w-7 h-7 text-amber-500 drop-shadow-md" />
    </div>

    <div className="absolute bottom-32 left-[10%] w-24 h-24 bg-gradient-to-br from-orange-100/25 to-amber-100/25 rounded-xl rotate-45 animate-float-delayed"></div>
    <div className="absolute bottom-32 right-0 w-24 h-24 bg-gradient-to-br from-orange-200/20 to-yellow-200/20 rounded-lg -rotate-12 animate-float z-20"></div>

    <div className="absolute bottom-10 right-10 animate-pulse-slow opacity-30 z-40">
      <GitBranch className="w-6 h-6 text-orange-500 drop-shadow-md" />
    </div>

    <div className="absolute top-4 right-1/4 w-32 h-32 bg-gradient-to-br from-orange-100/10 to-amber-100/10 rounded-full blur-sm animate-pulse-slow"></div>
    <div className="absolute bottom-4 left-1/3 w-40 h-40 bg-gradient-to-br from-amber-100/8 to-orange-100/8 rounded-full blur-lg animate-float-slow"></div>

    <div
      className="absolute inset-0 opacity-[0.02]"
      style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(251, 146, 60, 0.3) 1px, transparent 0)`,
        backgroundSize: "24px 24px",
      }}
    ></div>
  </div>
);

export default HeroBackground;
