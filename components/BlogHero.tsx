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
		"bg-orange-50 text-orange-700 border-orange-200",
		"bg-emerald-50 text-emerald-700 border-emerald-200",
		"bg-sky-50 text-sky-700 border-sky-200",
		"bg-violet-50 text-violet-700 border-violet-200",
		"bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
		"bg-rose-50 text-rose-700 border-rose-200",
		"bg-amber-50 text-amber-700 border-amber-200",
		"bg-cyan-50 text-cyan-700 border-cyan-200",
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
		<div className="relative overflow-hidden rounded-2xl border border-white/20 bg-transparent pt-0 p-3 md:p-6 max-h-[85vh]">
			<div aria-hidden className="fixed left-0 right-0 top-16 md:top-20 h-[calc(100svh-4rem)] md:h-[calc(100svh-5rem)] -z-10 pointer-events-none">
				<div className="absolute inset-0 bg-gradient-to-br from-orange-50/80 via-white/0 to-pink-50/60" />
				<div className="absolute inset-0 bg-[radial-gradient(70%_70%_at_50%_-8%,rgba(251,146,60,0.16),transparent_60%)]" />
				<div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_120%,rgba(0,0,0,0.05),transparent_40%)]" />
				<div className="absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,rgba(251,146,60,0.14)_1px,transparent_0)] [background-size:18px_18px] opacity-30" />
				<div className="absolute inset-0 [background-image:linear-gradient(to_right,rgba(0,0,0,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.035)_1px,transparent_1px)] [background-size:28px_28px] opacity-35" />
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(251,146,60,0.08),transparent_60%)]" />
			</div>
			<div aria-hidden className="pointer-events-none absolute inset-0">
				<div className="absolute inset-0" />
				<div className="absolute inset-0" />
				<div className="absolute inset-0" />
				<div className="absolute inset-0" />
				<div className="absolute -right-12 -bottom-6 hidden md:block opacity-15">
					<Image src="/blog/images/blog-bunny.png" alt="" width={200} height={200} />
				</div>
			</div>

			<div className="relative mx-auto max-w-4xl text-center mb-1 animate-fadeUp">
				<h1 className="heading1 font-bold text-4xl md:text-5xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-orange-400 to-pink-400">
					Keploy Blog
				</h1>
				<p className="content-body body text-base md:text-lg my-3 text-neutral-600/95 tracking-[0.01em] leading-relaxed">
					Empowering your tech journey with expert insights, tools, and stories.
				</p>
			</div>

			<div className="relative mt-2 mx-auto max-w-[56rem] grid gap-4 md:grid-cols-2 items-stretch">
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
						<div className="relative h-36 w-full md:h-44 overflow-hidden">
							<Image
								src={latestPost.featuredImage.node.sourceUrl}
								alt={latestPost.title}
								fill
							className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
								priority
							/>
						</div>
					)}
					<div className="p-4 md:p-5 min-h-[140px]">
						<h3 className="text-lg md:text-xl font-semibold leading-snug group-hover:text-orange-500">
							{latestPost?.title || "Explore community insights"}
						</h3>
						<div className="mt-2 flex items-center gap-2 text-sm text-neutral-600">
							{latestPost?.ppmaAuthorName && <span>{latestPost.ppmaAuthorName}</span>}
							{latestPost?.date && <>
								<span className="text-neutral-300">•</span>
								<span><Date dateString={latestPost.date} /></span>
							</>}
						</div>
						{latestPost?.excerpt && (
							<div
								className="mt-3 text-neutral-700 line-clamp-4 leading-6 min-h-[6rem]"
								dangerouslySetInnerHTML={{ __html: getExcerpt(latestPost.excerpt, 30) }}
							/>
						)}
						{latestPost?.slug && (
							<Link href={`/community/${latestPost.slug}`} className="mt-2.5 inline-flex items-center text-orange-600 font-medium hover:text-orange-700">
								Read More →
							</Link>
						)}
					</div>
				</Link>

				<div className="grid gap-3">
					<div className="rounded-xl border border-neutral-100 bg-white/90 backdrop-blur-sm filter ring-1 ring-black/5 p-4 md:p-5 shadow-[0_6px_18px_rgba(0,0,0,0.10)] hover:shadow-[0_10px_28px_rgba(0,0,0,0.16)] hover:drop-shadow-[0_6px_14px_rgba(251,146,60,0.18)] transition-all duration-300 ease-in-out">
						<h4 className="mb-2 text-sm md:text-[0.95rem] font-semibold text-neutral-700">Popular Tags</h4>
						<div className="flex flex-wrap gap-2">
							{displayTags.map((tag, idx) => (
								<Link key={`${tag}-${idx}`} href={`/tag/${encodeURIComponent(tag)}`} aria-label={`View posts tagged ${tag}`}>
									<span className={`inline-flex items-center rounded-lg border px-3 py-1 text-sm transition-all hover:opacity-95 hover:bg-white/60 ${tagColors[idx % tagColors.length]} shadow-md hover:shadow-lg hover:shadow-orange-200/30`}>
										{tag}
									</span>
								</Link>
							))}
						</div>
					</div>
					<div className="grid grid-cols-3 gap-3">
						<Link
							href="/technology"
						className="group col-span-2 relative overflow-hidden rounded-xl border border-neutral-200 bg-white p-4 md:p-5 filter ring-1 ring-black/5 shadow-[0_6px_18px_rgba(0,0,0,0.10)] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(0,0,0,0.16)] hover:drop-shadow-[0_6px_14px_rgba(251,146,60,0.18)] hover:border-orange-100 hover:bg-white hover:z-10"
							aria-label="Technology Blogs"
						>
							<div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-70 transition-opacity duration-300 bg-gradient-to-br from-orange-50/60 via-transparent to-pink-50/50" />
							<div className="relative z-10">
								<h5 className="text-[0.95rem] md:text-base font-semibold transition-colors duration-200 group-hover:text-orange-600">Technology</h5>
								<p className="mt-1 text-xs text-neutral-600">Engineering deep-dives and best practices</p>
								<div className="mt-2 h-px bg-neutral-200/70" />
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
								<h5 className="text-[0.95rem] md:text-base font-semibold transition-colors duration-200 group-hover:text-orange-600">GitHub</h5>
								<p className="mt-1 text-xs text-neutral-600">Star our repo, report issues</p>
								<div className="mt-2 h-px bg-neutral-200/70" />
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
								<h5 className="text-[0.95rem] md:text-base font-semibold transition-colors duration-200 group-hover:text-orange-600">Slack</h5>
								<p className="mt-1 text-xs text-neutral-600">Connect with community</p>
								<div className="mt-2 h-px bg-neutral-200/70" />
							</div>
						</a>
						<Link
							href="/community"
						className="group col-span-2 relative overflow-hidden rounded-xl border border-neutral-200 bg-white p-4 md:p-5 filter ring-1 ring-black/5 shadow-[0_6px_18px_rgba(0,0,0,0.10)] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(0,0,0,0.16)] hover:drop-shadow-[0_6px_14px_rgba(251,146,60,0.18)] hover:border-orange-100 hover:bg-white hover:z-10"
							aria-label="Community Blogs"
						>
							<div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-70 transition-opacity duration-300 bg-gradient-to-br from-orange-50/60 via-transparent to-pink-50/50" />
							<div className="relative z-10">
								<h5 className="text-[0.95rem] md:text-base font-semibold transition-colors duration-200 group-hover:text-orange-600">Community</h5>
								<p className="mt-1 text-xs text-neutral-600">Open source, product updates, and stories</p>
								<div className="mt-2 h-px bg-neutral-200/70" />
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


