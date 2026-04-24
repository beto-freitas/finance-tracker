import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useInView } from "framer-motion";
import {
	ArrowRight,
	BarChart3,
	DollarSign,
	PiggyBank,
	Shield,
	TrendingUp,
	Wallet,
	Zap,
} from "lucide-react";
import { type ReactNode, useRef } from "react";
import { Button } from "#/components/ui/button";

export const Route = createFileRoute("/")({ component: LandingPage });

const fadeUp = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0 },
};

const stagger = {
	visible: {
		transition: { staggerChildren: 0.1 },
	},
};

const features = [
	{
		icon: Wallet,
		title: "Track Expenses",
		description:
			"Log every purchase with categories, dates, and notes. See exactly where your money goes.",
		accent: "bg-chart-1/15 text-chart-1",
	},
	{
		icon: TrendingUp,
		title: "Manage Earnings",
		description:
			"Keep tabs on all income sources in one place. Understand your full financial picture.",
		accent: "bg-chart-3/15 text-chart-3",
	},
	{
		icon: PiggyBank,
		title: "Set Budgets",
		description:
			"Define spending limits per category. Get clear signals when you're close to the edge.",
		accent: "bg-chart-4/20 text-chart-4",
	},
	{
		icon: BarChart3,
		title: "Visual Dashboard",
		description:
			"Charts and breakdowns that make sense at a glance. No spreadsheet headaches.",
		accent: "bg-chart-5/15 text-chart-5",
	},
];

const stats = [
	{ icon: DollarSign, label: "100% Free", detail: "No hidden fees, ever" },
	{
		icon: Shield,
		label: "Private by Design",
		detail: "Your data stays yours",
	},
	{
		icon: Zap,
		label: "Real-time Insights",
		detail: "Always up to date",
	},
];

function AnimatedSection({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true, margin: "-80px" });

	return (
		<motion.section
			ref={ref}
			initial="hidden"
			animate={isInView ? "visible" : "hidden"}
			variants={stagger}
			className={className}
		>
			{children}
		</motion.section>
	);
}

function Topbar() {
	return (
		<motion.header
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.4 }}
			className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg"
		>
			<div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
				<Link to="/" className="text-base font-semibold tracking-tight">
					Finance Tracker
				</Link>
				<div className="flex items-center gap-2">
					<Button variant="ghost" size="sm" asChild>
						<Link to="/login">Login</Link>
					</Button>
					<Button size="sm" asChild>
						<Link to="/signup">
							Get Started
							<ArrowRight className="size-3.5" />
						</Link>
					</Button>
				</div>
			</div>
		</motion.header>
	);
}

function Hero() {
	return (
		<motion.section
			initial="hidden"
			animate="visible"
			variants={stagger}
			className="relative mx-auto flex max-w-3xl flex-col items-center px-6 pt-32 pb-24 text-center"
		>
			<div
				aria-hidden
				className="pointer-events-none absolute inset-x-0 -top-24 -z-10 mx-auto h-[420px] max-w-4xl bg-[radial-gradient(ellipse_at_top,var(--color-primary)/18%,transparent_70%)] blur-2xl"
			/>
			<motion.div
				variants={fadeUp}
				transition={{ duration: 0.5 }}
				className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
			>
				<span className="size-1.5 rounded-full bg-primary" />
				Simple personal finance tracking
			</motion.div>
			<motion.h1
				variants={fadeUp}
				transition={{ duration: 0.5 }}
				className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
			>
				Your money,
				<br />
				finally{" "}
				<span className="bg-gradient-to-r from-primary to-chart-3 bg-clip-text text-transparent">
					organized
				</span>
				.
			</motion.h1>
			<motion.p
				variants={fadeUp}
				transition={{ duration: 0.5 }}
				className="mt-6 max-w-xl text-lg text-muted-foreground"
			>
				Track expenses, manage earnings, and set budgets — all in one clean
				interface. No noise, no clutter, just clarity.
			</motion.p>
			<motion.div
				variants={fadeUp}
				transition={{ duration: 0.5 }}
				className="mt-10 flex items-center gap-3"
			>
				<Button size="lg" asChild>
					<Link to="/signup">
						Get Started — it's free
						<ArrowRight className="size-4" />
					</Link>
				</Button>
				<Button variant="outline" size="lg" asChild>
					<a href="#features">Learn More</a>
				</Button>
			</motion.div>
		</motion.section>
	);
}

function Features() {
	return (
		<AnimatedSection className="mx-auto max-w-6xl px-6 py-24">
			<motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
				<h2 className="text-center text-sm font-semibold uppercase tracking-widest text-muted-foreground">
					Features
				</h2>
				<p className="mt-2 text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
					Everything you need, nothing you don't.
				</p>
			</motion.div>
			<div className="mt-16 grid gap-6 sm:grid-cols-2">
				{features.map((feature) => (
					<motion.div
						key={feature.title}
						variants={fadeUp}
						transition={{ duration: 0.4 }}
						className="group rounded-xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
					>
						<div
							className={`mb-4 flex size-10 items-center justify-center rounded-lg ${feature.accent}`}
						>
							<feature.icon className="size-5" />
						</div>
						<h3 className="text-base font-semibold text-foreground">
							{feature.title}
						</h3>
						<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
							{feature.description}
						</p>
					</motion.div>
				))}
			</div>
		</AnimatedSection>
	);
}

function Stats() {
	return (
		<AnimatedSection className="border-y border-border bg-gradient-to-b from-muted/30 via-primary/5 to-muted/30 py-20">
			<div className="mx-auto grid max-w-4xl gap-10 px-6 sm:grid-cols-3">
				{stats.map((stat) => (
					<motion.div
						key={stat.label}
						variants={fadeUp}
						transition={{ duration: 0.4 }}
						className="flex flex-col items-center text-center"
					>
						<div className="mb-3 flex size-10 items-center justify-center rounded-full bg-primary/15 ring-1 ring-primary/20">
							<stat.icon className="size-5 text-primary" />
						</div>
						<span className="text-lg font-semibold text-foreground">
							{stat.label}
						</span>
						<span className="mt-1 text-sm text-muted-foreground">
							{stat.detail}
						</span>
					</motion.div>
				))}
			</div>
		</AnimatedSection>
	);
}

function ClosingCta() {
	return (
		<AnimatedSection className="mx-auto flex max-w-2xl flex-col items-center px-6 py-32 text-center">
			<motion.h2
				variants={fadeUp}
				transition={{ duration: 0.5 }}
				className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
			>
				Ready to take control?
			</motion.h2>
			<motion.p
				variants={fadeUp}
				transition={{ duration: 0.5 }}
				className="mt-4 max-w-md text-muted-foreground"
			>
				Join and start tracking your finances in under a minute. Free forever,
				no credit card required.
			</motion.p>
			<motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
				<Button size="lg" className="mt-8" asChild>
					<Link to="/signup">
						Get Started
						<ArrowRight className="size-4" />
					</Link>
				</Button>
			</motion.div>
		</AnimatedSection>
	);
}

function Footer() {
	return (
		<footer className="border-t border-border py-8">
			<p className="text-center text-xs text-muted-foreground">
				&copy; {new Date().getFullYear()} Finance Tracker. All rights reserved.
			</p>
		</footer>
	);
}

function LandingPage() {
	return (
		<div className="min-h-screen bg-background">
			<Topbar />
			<main>
				<Hero />
				<div id="features">
					<Features />
				</div>
				<Stats />
				<ClosingCta />
			</main>
			<Footer />
		</div>
	);
}
