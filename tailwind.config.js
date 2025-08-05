/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  safelist: [
    "text-green-600",
    "text-blue-600",
    "text-indigo-600",
    "text-orange-600",
    "text-pink-600",
    "text-yellow-600",
    "text-purple-600",
    "text-cyan-600",
    "text-gray-600",
    "text-emerald-600",
    "text-violet-600"
  ],
  theme: {
  	extend: {
  		animation: {
  			marquee: 'marquee var(--duration) linear infinite',
  			'marquee-vertical': 'marquee-vertical var(--duration) linear infinite',
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		},
  		keyframes: {
  			marquee: {
  				from: {
  					transform: 'translateX(0)'
  				},
  				to: {
  					transform: 'translateX(calc(-100% - var(--gap)))'
  				}
  			},
  			'marquee-vertical': {
  				from: {
  					transform: 'translateY(0)'
  				},
  				to: {
  					transform: 'translateY(calc(-100% - var(--gap)))'
  				}
  			},
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		colors: {
  			'accent-1': '#FAFAFA',
  			'accent-2': '#EAEAEA',
  			'accent-7': '#333',
  			success: '#0070f3',
  			cyan: '#79FFE1',
  			primary: {
  				'50': '#FFF',
  				'100': '#FFB575',
  				'200': '#FFD0A0',
  				'300': '#ff914d',
  				'400': '#E67643',
  				'500': '#C95919',
  				'deep-orange': '#F6734A',
  				'yellow-orange': '#FDAC14',
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				'50': '#FFFFFF',
  				'100': '#29456E',
  				'200': '#537FA1',
  				'300': '#00163d',
  				'400': '#000E27',
  				'500': '#00061A',
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			neutral: {
  				'100': '#f5f5f5',
  				'200': '#FFF',
  				'300': '#e6e2d4'
  			},
  			accent: {
  				'100': '#16704c',
  				'200': '#5f3131',
  				'300': '#ef546b',
  				'400': '#d9cd9c',
  				'500': '#e6e2d4',
  				gradient: 'linear-gradient(to right, #F5F5F5, #E35134, #FF914D, #BE2C1B, #6F0A0D)',
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		backgroundImage: {
  			'hero-gradient': 'linear-gradient(to bottom, rgba(246, 115, 74, 0.75), rgba(253, 172, 20, 0.75))'
  		},
  		spacing: {
  			'28': '7rem'
  		},
  		letterSpacing: {
  			tighter: '-.04em'
  		},
  		lineHeight: {
  			tight: 1.2
  		},
  		fontSize: {
  			'5xl': '2.5rem',
  			'6xl': '2.75rem',
  			'7xl': '4.5rem',
  			'8xl': '6.25rem'
  		},
  		boxShadow: {
  			small: '0 5px 10px rgba(0, 0, 0, 0.12)',
  			medium: '0 8px 30px rgba(0, 0, 0, 0.12)'
  		},
  		scale: {
  			'101': '1.01'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
