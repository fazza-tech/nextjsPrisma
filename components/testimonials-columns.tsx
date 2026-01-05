"use client";
import { motion } from "motion/react";
import React from "react";

export type Testimonial = {
	text: string;
	image: string;
	name: string;
	role: string;
};

const testimonials: Testimonial[] = [
	{
		text: "As a seasoned developer, I've seen many tools, but this platform's commitment to quality and ease of use is unparalleled. It truly transforms the workflow.",
		image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&q=80",
		name: "Alex Rivera",
		role: "@alex_dev",
	},
	{
		text: "The integration with Prisma and Next.js is seamless. It feels like this was built by developers who really understand the pain points of modern web dev.",
		image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&q=80",
		name: "Sarah Chen",
		role: "@sarah_tech",
	},
	{
		text: "Our team's productivity has skyrocketed since we switched. The UI is gorgeous and the performance is just incredible.",
		image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80",
		name: "Jordan Smith",
		role: "@jordan_leads",
	},
	{
		text: "I was skeptical at first, but after using it for a week, I can't imagine going back. It's the standard for modern SaaS applications.",
		image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&q=80",
		name: "Casey Harper",
		role: "@casey_codes",
	},
	{
		text: "The community support and documentation are top-notch. Whenever I had a question, I found the answer within minutes.",
		image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&q=80",
		name: "Michael Brown",
		role: "@mike_b",
	},
	{
		text: "Beautifully designed and extremely robust. It strikes the perfect balance between power and simplicity.",
		image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&q=80",
		name: "Elena Rodriguez",
		role: "@elena_ro",
	},
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(0, 3);

export const TestimonialsColumn = (props: {
	className?: string;
	testimonials: Testimonial[];
	duration?: number;
}) => (
	<div className={props.className}>
		<motion.div
			animate={{
				translateY: "-50%",
			}}
			className="flex flex-col gap-6 pb-6"
			transition={{
				duration: props.duration || 10,
				repeat: Number.POSITIVE_INFINITY,
				ease: "linear",
				repeatType: "loop",
			}}
		>
			{[
				...new Array(2).fill(0).map((_, index) => (
					<React.Fragment key={`column-${index}`}>
						{props.testimonials.map(({ text, image, name, role }) => (
							<div
								className="w-full max-w-xs rounded-3xl border bg-card p-8 shadow-sm dark:bg-card/20 dark:shadow-foreground/5 transition-all hover:shadow-md hover:border-primary/20"
								key={name}
							>
								<div className="text-sm leading-relaxed">{text}</div>
								<div className="mt-5 flex items-center gap-2">
									<img
										alt={name}
										className="h-10 w-10 rounded-full"
										height={40}
										src={image}
										width={40}
									/>
									<div className="flex flex-col">
										<div className="font-semibold text-sm leading-5 tracking-tight">
											{name}
										</div>
										<div className="text-xs leading-5 tracking-tight opacity-60">
											{role}
										</div>
									</div>
								</div>
							</div>
						))}
					</React.Fragment>
				)),
			]}
		</motion.div>
	</div>
);

export const Testimonials = () => {
	return (
		<section className="bg-background py-24">
			<div className="container mx-auto px-4">
				<div className="flex flex-col items-center justify-center text-center mb-12">
					<div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary mb-4">
						Testimonials
					</div>
					<h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
						What Our Community Says
					</h2>
					<p className="max-w-[700px] text-muted-foreground md:text-xl">
						Discover how our platform is empowering developers and teams to build amazing things faster.
					</p>
				</div>
				<div className="mt-10 flex h-[600px] justify-center gap-6 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)]">
					<TestimonialsColumn testimonials={firstColumn} duration={15} />
					<TestimonialsColumn
						className="hidden md:block"
						testimonials={secondColumn}
						duration={19}
					/>
					<TestimonialsColumn
						className="hidden lg:block"
						testimonials={thirdColumn}
						duration={17}
					/>
				</div>
			</div>
		</section>
	);
};
