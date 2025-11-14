import {
	FiCpu, FiCode, FiDatabase, FiCloud, FiSmartphone, FiLock, FiGlobe, FiPackage,
	FiServer, FiSettings, FiGithub, FiTerminal, FiZap, FiBox, FiActivity, FiAperture,
	FiBarChart2, FiBell, FiBluetooth, FiBook, FiBookmark, FiChrome, FiCompass,
	FiGitBranch, FiGitCommit, FiGitMerge, FiTool, FiLayers, FiHardDrive, FiMonitor,
	FiImage, FiTrendingUp, FiShield, FiKey, FiSliders, FiWifi, FiCheckCircle
} from 'react-icons/fi';
import { IconType } from 'react-icons';

// Rich, technology-focused categories with regex synonyms
const categories: { name: string; patterns: RegExp[]; icons: IconType[] }[] = [
	{ name: 'ai-ml', patterns: [/\b(ai|ml|machine learning|deep learning|llm|gpt|nlp|cv)\b/i], icons: [FiCpu, FiActivity, FiTrendingUp] },
	{ name: 'languages', patterns: [/\b(js|javascript|ts|typescript|python|go|golang|java|rust|ruby|php|c\+\+|c#|csharp)\b/i], icons: [FiCode, FiTerminal, FiTool] },
	{ name: 'frameworks', patterns: [/\b(react|next|vue|nuxt|svelte|angular|nest|django|flask|spring|rails|laravel)\b/i], icons: [FiLayers, FiPackage, FiCode] },
	{ name: 'web', patterns: [/\b(html|css|tailwind|frontend|ui|ux|accessibility|seo)\b/i], icons: [FiGlobe, FiChrome, FiAperture] },
	{ name: 'backend', patterns: [/\b(backend|api|graphql|rest|microservice|grpc|server)\b/i], icons: [FiServer, FiSettings, FiSliders] },
	{ name: 'database', patterns: [/\b(db|database|sql|postgres|mysql|mariadb|sqlite|mongo|redis|elasticsearch|kafka)\b/i], icons: [FiDatabase, FiHardDrive, FiLayers] },
	{ name: 'cloud', patterns: [/\b(cloud|aws|gcp|azure|serverless|s3|lambda|ec2|iam)\b/i], icons: [FiCloud, FiGlobe, FiSliders] },
	{ name: 'devops', patterns: [/\b(devops|ci|cd|pipeline|terraform|ansible|helm|k8s|kubernetes|docker|container)\b/i], icons: [FiSettings, FiPackage, FiSliders] },
	{ name: 'security', patterns: [/\b(security|auth|jwt|oauth|sso|iam|encryption|hash|tls|ssl|secret|key)\b/i], icons: [FiLock, FiShield, FiKey] },
	{ name: 'mobile', patterns: [/\b(mobile|android|ios|flutter|react native|pwa)\b/i], icons: [FiSmartphone, FiWifi, FiCompass] },
	{ name: 'data-analytics', patterns: [/\b(analytics|bi|etl|spark|hadoop|warehouse|lake|lakehouse|parquet)\b/i], icons: [FiBarChart2, FiTrendingUp, FiDatabase] },
	{ name: 'testing', patterns: [/\b(test|testing|unit|integration|e2e|coverage|jest|cypress|playwright)\b/i], icons: [FiCheckCircle, FiActivity, FiBook] },
	{ name: 'performance', patterns: [/\b(performance|optimi[sz]e|latency|throughput|profiling|benchmark)\b/i], icons: [FiZap, FiActivity, FiTrendingUp] },
	{ name: 'networking', patterns: [/\b(network|http|tcp|udp|dns|cdn|proxy)\b/i], icons: [FiWifi, FiGlobe, FiServer] },
	{ name: 'tooling', patterns: [/\b(build|bundle|webpack|vite|rollup|esbuild|lint|prettier)\b/i], icons: [FiTool, FiPackage, FiCode] },
	{ name: 'version-control', patterns: [/\b(git|github|gitlab|bitbucket|branch|merge|commit|pr|pull request)\b/i], icons: [FiGithub, FiGitBranch, FiGitMerge] },
	{ name: 'docs', patterns: [/\b(doc|docs|documentation|readme|guide|manual|tutorial)\b/i], icons: [FiBook, FiBookmark, FiAperture] },
	{ name: 'design', patterns: [/\b(design|figma|ux|ui|accessibility|a11y|image|svg|icon)\b/i], icons: [FiAperture, FiImage, FiCompass] },
	{ name: 'monitoring', patterns: [/\b(monitoring|observability|apm|logging|metrics|tracing|prometheus|grafana)\b/i], icons: [FiMonitor, FiActivity, FiBarChart2] },
	{ name: 'messaging', patterns: [/\b(message|messaging|queue|pubsub|pub-sub|mq|kafka|rabbitmq|sqs|sns)\b/i], icons: [FiBell, FiPackage, FiServer] },
	{ name: 'browser', patterns: [/\b(browser|chrome|firefox|safari|edge|webextension|extension)\b/i], icons: [FiChrome, FiGlobe, FiAperture] },
];

// Large fallback bank for dispersion
export const iconBank: IconType[] = [
	FiCpu, FiCode, FiDatabase, FiCloud, FiSmartphone, FiLock, FiGlobe, FiPackage,
	FiServer, FiSettings, FiGithub, FiTerminal, FiZap, FiBox, FiActivity, FiAperture,
	FiBarChart2, FiBell, FiBluetooth, FiBook, FiBookmark, FiChrome, FiCompass,
	FiGitBranch, FiGitCommit, FiGitMerge, FiTool, FiLayers, FiHardDrive, FiMonitor,
	FiImage, FiTrendingUp, FiShield, FiKey, FiSliders, FiWifi
];

function hashString(input: string): number {
	let hash = 0;
	for (let i = 0; i < input.length; i++) hash = (hash << 5) - hash + input.charCodeAt(i);
	return Math.abs(hash);
}

export function getIconComponentForTag(name: string, prevIconName?: string): IconType {
	const n = (name || '').toLowerCase().trim();
	// 1) Try category match with per-category dispersion
	for (const cat of categories) {
		if (cat.patterns.some((re) => re.test(n))) {
			const idx = hashString(n) % cat.icons.length;
			let IconComp = cat.icons[idx];
			if (prevIconName && IconComp.name === prevIconName) {
				IconComp = cat.icons[(idx + 1) % cat.icons.length];
			}
			return IconComp;
		}
	}
	// 2) Fallback to global bank
	const idx = hashString(n) % iconBank.length;
	let IconComp = iconBank[idx];
	if (prevIconName && IconComp.name === prevIconName) {
		IconComp = iconBank[(idx + 1) % iconBank.length];
	}
	return IconComp;
}
