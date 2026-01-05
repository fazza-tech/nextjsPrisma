import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MessageCircle, ArrowRight, Zap, Shield, Globe, Rocket } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import prisma from "@/lib/db";
import { FontWeightText } from "@/components/ui/font-weight-text"
import { ModeToggle } from "@/components/dark-mode-button";
import AuthButton from "@/components/auth-button";
import { Cobe } from "./ui/cobe-globe";
import { Testimonials } from "./testimonials-columns";

export async function HomeContent() {
    const posts = await prisma.blogPost.findMany({
        orderBy: {
            createdAt: "desc",
        },
        take: 3,
    });

    const features = [
        {
            title: "Lightning Fast",
            description: "Built on Next.js 15 for peak performance and speed.",
            icon: Zap,
        },
        {
            title: "Secure by Design",
            description: "Advanced authentication and data protection built-in.",
            icon: Shield,
        },
        {
            title: "Global Scale",
            description: "Deploy worldwide with edge computing capabilities.",
            icon: Globe,
        },
        {
            title: "Rapid Deployment",
            description: "Go from idea to production in record time.",
            icon: Rocket,
        },
    ];

    return (
        <main className="min-h-screen bg-background">
            {/* Header / Navbar area */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                        <div className="h-8 w-8 rounded-lg bg-primary" />
                        Alogix
                    </div>
                    <div className="flex items-center gap-4">
                        <ModeToggle />
                        <AuthButton />
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative overflow-hidden pt-20 pb-24 lg:pt-32 lg:pb-40">
                <div className="container relative z-10 mx-auto px-4 text-center">
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary mb-6">
                            New: Platform V2.0 is now live
                        </div>
                        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl mb-6 bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-transparent">
                            Digital Experiences <br />
                            <span className="text-primary italic font-serif">Perfected</span>
                        </h1>
                        <p className="mx-auto max-w-[800px] text-muted-foreground text-lg sm:text-xl mb-10 leading-relaxed">
                            Alogix empowers creators and enterprises to build high-performance web applications
                            with a seamless development experience and world-class design standards.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Button size="lg" className="rounded-full px-8 h-12 text-base font-semibold transition-transform hover:scale-105" asChild>
                                <Link href="/blog" prefetch={true}>
                                    Get Started Free
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-base font-semibold transition-transform hover:scale-105" asChild>
                                <Link href="/comments" prefetch={true} className="flex items-center gap-2">
                                    <MessageCircle className="w-4 h-4" />
                                    Join Discussion
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
                {/* Background decoration */}
                <div className="absolute top-1/2 left-1/2 -z-10 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 opacity-[0.03] dark:opacity-[0.05]">
                    <Cobe />
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, i) => (
                            <Card key={i} className="border-none bg-background shadow-sm hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <feature.icon className="h-6 w-6" />
                                    </div>
                                    <CardTitle>{feature.title}</CardTitle>
                                    <CardDescription>{feature.description}</CardDescription>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Recent Posts Section */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                        <div className="max-w-2xl">
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Latest Insights</h2>
                            <p className="text-muted-foreground text-lg">
                                Stay updated with the newest trends and technical deep-dives from the Alogix engineering team.
                            </p>
                        </div>
                        <Button variant="ghost" asChild className="group">
                            <Link href="/blog" className="flex items-center gap-2">
                                View Research <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Button>
                    </div>
                    {posts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {posts.map((post) => (
                                <Card key={post.id} className="overflow-hidden group cursor-pointer hover:border-primary/20 transition-colors">
                                    <div className="h-48 bg-muted relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                                    </div>
                                    <CardHeader>
                                        <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground line-clamp-3 mb-4">{post.content}</p>
                                        <div className="flex items-center text-sm font-medium text-primary">
                                            Read article <ArrowRight className="ml-2 h-4 w-4" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 border rounded-2xl border-dashed">
                            <p className="text-muted-foreground">No posts found</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Testimonials */}
            <Testimonials />

            {/* CTA Section */}
            <section className="py-24 container mx-auto px-4">
                <div className="bg-primary rounded-[2rem] p-8 md:p-16 text-primary-foreground text-center overflow-hidden relative">
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to start building?</h2>
                        <p className="text-primary-foreground/80 text-lg md:text-xl max-w-2xl mx-auto mb-10">
                            Join thousands of developers and teams who trust Alogix to power their web experiences.
                        </p>
                        <Button size="lg" variant="secondary" className="rounded-full px-8 h-12 text-base font-semibold" asChild>
                            <Link href="/login">Get Started for Free</Link>
                        </Button>
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-black/10 rounded-full blur-3xl" />
                </div>
            </section>

            <footer className="py-12 border-t text-center text-muted-foreground">
                <div className="container mx-auto px-4">
                    <p>&copy; {new Date().getFullYear()} Alogix Inc. All rights reserved.</p>
                </div>
            </footer>
        </main>
    );
}
