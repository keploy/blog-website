import Link from "next/link";
import Image from "next/image";
import Date from "./date";
import { getExcerpt } from "../utils/excerpt";

type BlogHeroProps = {
	latestPost?: {
		title: string;
		excerpt?: string;
		slug: string;
		date?: string;
		featuredImage?: { node?: { sourceUrl?: string } } | null;
		ppmaAuthorName?: string;
	};
	tags: string[];
};

export default function BlogHero({ latestPost, tags }: BlogHeroProps) {
	const tagColors = [
		"text-orange-700 border-orange-200 hover:bg-orange-50",
		"text-emerald-700 border-emerald-200 hover:bg-emerald-50",
		"text-sky-700 border-sky-200 hover:bg-sky-50",
		"text-violet-700 border-violet-200 hover:bg-violet-50",
		"text-fuchsia-700 border-fuchsia-200 hover:bg-fuchsia-50",
		"text-rose-700 border-rose-200 hover:bg-rose-50",
		"text-amber-700 border-amber-200 hover:bg-amber-50",
		"text-cyan-700 border-cyan-200 hover:bg-cyan-50",
	];

	// Prefer relevant tags if available
	const preferredTags = [
		"API",
		"Testing",
		"Automation",
		"Mocking",
		"Engineering",
		"Python",
		"Community",
		"Open Source",
		"Kubernetes",
		"Golang",
		"DevOps",
		"CI/CD",
		"Microservices",
		"Java",
		"Node.js",
	];
	const tagsLower = new Set(tags.map((t) => t.toLowerCase()));
	const filteredPreferred = preferredTags.filter((t) => tagsLower.has(t.toLowerCase()));
	const displayTags = (filteredPreferred.length ? filteredPreferred : tags).slice(0, 10);

		return (
			<div className="relative overflow-hidden bg-transparent min-h-[calc(100vh-8rem)] md:min-h-[calc(100vh-10rem)] flex flex-col p-3 md:p-6">
			<div aria-hidden className="absolute inset-0 -z-10 pointer-events-none">
				{/* <div className="absolute inset-0 bg-gradient-to-br from-orange-50/80 via-white/0 to-pink-50/60" />
				<div className="absolute inset-0 bg-[radial-gradient(70%_70%_at_50%_-8%,rgba(251,146,60,0.16),transparent_60%)]" />
				<div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_120%,rgba(0,0,0,0.05),transparent_40%)]" /> */}
				<div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(255,237,213,0.25)_25%,rgba(255,237,213,0.25)_75%,transparent_100%)]" />
				<div className="absolute inset-0 bg-[radial-gradient(80%_70%_at_50%_45%,rgba(251,146,60,0.12),rgba(255,182,193,0.06),transparent_80%)]" />
				<div className="absolute inset-0 bg-[radial-gradient(60%_100%_at_0%_50%,rgba(255,228,200,0.15),transparent_70%),radial-gradient(60%_100%_at_100%_50%,rgba(255,228,200,0.15),transparent_70%)]" /> 
				<div className="absolute inset-0 bg-[linear-gradient(to_br,rgba(255,240,230,0.25),rgba(255,245,240,0.15),transparent_80%)]" />
				{/* --grid-- */}
				<div className="absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,rgba(251,146,60,0.14)_1px,transparent_0)] [background-size:18px_18px] opacity-30 [mask-image:linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,1)_10%,rgba(0,0,0,1)_90%,transparent_100%)] [mask-size:100%_100%]" />
				<div className="absolute inset-0 [background-image:linear-gradient(to_right,rgba(0,0,0,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.035)_1px,transparent_1px)] [background-size:28px_28px] opacity-35 [mask-image:linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,1)_10%,rgba(0,0,0,1)_90%,transparent_100%)] [mask-size:100%_100%]" />
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(251,146,60,0.08),transparent_60%)]" />
			</div>
			<div aria-hidden className="pointer-events-none absolute inset-0">
				<div className="absolute inset-0" />
				<div className="absolute inset-0" />
				<div className="absolute inset-0" />
				<div className="absolute inset-0" />
				<div className="absolute right-8 -bottom-6 hidden md:block opacity-15">
					<Image src="/blog/images/blog-bunny.png" alt="" width={200} height={200} />
				</div>
			</div>

			<div className="relative mx-auto max-w-4xl text-center mb-1 animate-fadeUp">
				{/* <h1 className="heading1 font-bold text-5xl bg-clip-text text-transparent bg-gradient-to-r from-orange-600 via-orange-500 to-pink-500">
					Keploy Blog
				</h1> */}
				<h1 className="hero-heading-font text-7xl py-1 md:text-7xl bg-clip-text text-transparent bg-[linear-gradient(90deg,#ff7a3d_0%,#ff9a57_48%,#ffbf80_100%)] drop-shadow-[0_2px_6px_rgba(255,140,80,0.22)]">
					Keploy Blog
				</h1>
				<p className="content-body body text-base md:text-2xl py-1 mb-3 text-neutral-600/95 tracking-[0.01em] leading-relaxed">
					Empowering your tech journey with expert insights, tools, and stories.
				</p>
			</div>

			<div className="relative mx-auto max-w-4xl grid gap-4 md:grid-cols-2 items-stretch">
				<Link
					href={latestPost?.slug ? `/community/${latestPost.slug}` : "/community"}
					className="group relative overflow-hidden rounded-xl border border-neutral-200 bg-white backdrop-blur-sm filter ring-1 ring-black/5 shadow-[0_6px_18px_rgba(0,0,0,0.10)] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(0,0,0,0.16)] hover:drop-shadow-[0_6px_14px_rgba(251,146,60,0.18)] hover:border-orange-100 hover:bg-white hover:z-10 md:min-h-[320px]"
					aria-label={latestPost?.title ? `Latest Blog: ${latestPost.title}` : "Latest Blog"}
				>
					<div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-70 transition-opacity duration-300 bg-gradient-to-br from-orange-50/60 via-transparent to-pink-50/50" />
					<div className="absolute top-0 right-0 transform rotate-45 translate-x-[22%] translate-y-[85%] bg-orange-200 text-orange-800 text-[10px] font-bold py-0.5 w-[100px] flex justify-center items-center shadow-md z-10">
						Latest Blog
					</div>
						{latestPost?.featuredImage?.node?.sourceUrl && (
							<div className="relative h-44 w-full md:h-56 overflow-hidden">
								<Image
									src={latestPost.featuredImage.node.sourceUrl}
									alt={latestPost.title}
									fill
								className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
									priority
								/>
							</div>
						)}
						<div className="p-4 md:p-5 min-h-[110px]">
							<h3 className="text-lg md:text-xl font-semibold leading-snug group-hover:text-orange-500">
								{latestPost?.title || "Explore community insights"}
							</h3>
							<div className="mt-1.5 flex items-center gap-2 text-sm text-neutral-600">
								{latestPost?.ppmaAuthorName && <span>{latestPost.ppmaAuthorName}</span>}
								{latestPost?.date && <>
									<span className="text-neutral-300">•</span>
									<span><Date dateString={latestPost.date} /></span>
								</>}
							</div>
							{latestPost?.excerpt && (
								<div
									className="mt-2 text-neutral-700 line-clamp-4 leading-6 min-h-[2.5rem]"
									dangerouslySetInnerHTML={{ __html: getExcerpt(latestPost.excerpt, 36) }}
								/>
							)}
						</div>
				</Link>

				<div className="grid gap-3">
								<div className="rounded-xl border border-neutral-100 bg-white/90 backdrop-blur-sm filter ring-1 ring-black/5 p-4 md:p-5 shadow-[0_6px_18px_rgba(0,0,0,0.10)] transition-all duration-300 ease-in-out">
									<h4 className="mb-2.5 text-base md:text-lg font-semibold text-neutral-700">Popular Tags</h4>
									<div className="flex flex-wrap gap-1.5">
										{displayTags.map((tag, idx) => (
											<Link key={`${tag}-${idx}`} href={`/tag/${encodeURIComponent(tag)}`} aria-label={`View posts tagged ${tag}`}>
											<span className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-sm bg-white transition-colors hover:opacity-95 ${tagColors[idx % tagColors.length]}`}>
													{tag}
												</span>
											</Link>
										))}
									</div>
								</div>
								<div className="grid grid-cols-3 gap-2.5">
						<Link
							href="/technology"
					className="group col-span-2 relative overflow-hidden rounded-xl border border-orange-400/60 bg-white p-4 md:p-5 filter ring-1 ring-black/5 shadow-[0_6px_18px_rgba(0,0,0,0.10)] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(0,0,0,0.16)] hover:drop-shadow-[0_6px_14px_rgba(251,146,60,0.18)] hover:border-orange-100 hover:bg-white hover:z-10"
							aria-label="Technology Blogs"
						>
					<div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-70 transition-opacity duration-300 bg-gradient-to-br from-orange-50/60 via-transparent to-pink-50/50" />
						<div className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-400 rounded-full opacity-85 group-hover:opacity-100 transition-opacity duration-300" />
							<div className="relative z-10">
							<h5 className="text-base md:text-lg font-semibold transition-colors duration-200 group-hover:text-orange-600">Technology</h5>
								<p className="mt-1 text-xs text-neutral-600">Engineering deep-dives and best practices</p>
							<div className="mt-1.5 h-px bg-neutral-200/70" />
							</div>
						</Link>
						<a
							href="https://github.com/keploy/keploy"
							target="_blank"
							rel="noopener noreferrer"
						className="group relative overflow-hidden rounded-xl border border-neutral-200 bg-white p-4 md:p-5 filter ring-1 ring-black/5 shadow-[0_6px_18px_rgba(0,0,0,0.10)] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(0,0,0,0.16)] hover:drop-shadow-[0_6px_14px_rgba(251,146,60,0.18)] hover:border-orange-100 hover:bg-white hover:z-10"
							aria-label="Keploy on GitHub"
						>
									<div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-70 transition-opacity duration-300 bg-gradient-to-br from-orange-50/60 via-transparent to-pink-50/50" />
									<div className="relative z-10">
									<div className="flex items-center gap-2">
										<svg className="w-7 h-7 text-neutral-600 group-hover:text-orange-500 transition-colors duration-200" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
											<path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
											</svg>
											<h5 className="text-base md:text-lg font-semibold transition-colors duration-200 group-hover:text-orange-600">GitHub</h5>
										</div>
											<p className="mt-1 text-xs text-neutral-600">Star our repo and report issues</p>
											<div className="mt-1.5 h-px bg-neutral-200/70" />
										</div>
						</a>
						<a
							href="https://keploy.io/slack"
							target="_blank"
							rel="noopener noreferrer"
						className="group relative overflow-hidden rounded-xl border border-neutral-200 bg-white p-4 md:p-5 filter ring-1 ring-black/5 shadow-[0_6px_18px_rgba(0,0,0,0.10)] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(0,0,0,0.16)] hover:drop-shadow-[0_6px_14px_rgba(251,146,60,0.18)] hover:border-orange-100 hover:bg-white hover:z-10"
							aria-label="Keploy on Slack"
						>
									<div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-70 transition-opacity duration-300 bg-gradient-to-br from-orange-50/60 via-transparent to-pink-50/50" />
									<div className="relative z-10">
									<div className="flex items-center gap-2">
										<svg className="w-5 h-5 text-neutral-600 group-hover:text-orange-500 transition-colors duration-200" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
											<path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
											</svg>
											<h5 className="text-base md:text-lg font-semibold transition-colors duration-200 group-hover:text-orange-600">Slack</h5>
										</div>
											<p className="mt-1 text-xs text-neutral-600">Connect with our community</p>
											<div className="mt-1.5 h-px bg-neutral-200/70" />
										</div>
						</a>
						<Link
							href="/community"
					className="group col-span-2 relative overflow-hidden rounded-xl border border-orange-400/60 bg-white p-4 md:p-5 filter ring-1 ring-black/5 shadow-[0_6px_18px_rgba(0,0,0,0.10)] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(0,0,0,0.16)] hover:drop-shadow-[0_6px_14px_rgba(251,146,60,0.18)] hover:border-orange-100 hover:bg-white hover:z-10"
							aria-label="Community Blogs"
						>
					<div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-70 transition-opacity duration-300 bg-gradient-to-br from-orange-50/60 via-transparent to-pink-50/50" />
						<div className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-400 rounded-full opacity-85 group-hover:opacity-100 transition-opacity duration-300" />
							<div className="relative z-10">
							<h5 className="text-base md:text-lg font-semibold transition-colors duration-200 group-hover:text-orange-600">Community</h5>
								<p className="mt-1 text-xs text-neutral-600">Open source, product updates, and stories</p>
							<div className="mt-1.5 h-px bg-neutral-200/70" />
							</div>
						</Link>
					</div>
				</div>
			</div>

			<style jsx>{`
				@keyframes fadeUp { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: translateY(0) } }
				.animate-fadeUp { animation: fadeUp .5s ease-out both }
			`}</style>
		</div>
	);
}


