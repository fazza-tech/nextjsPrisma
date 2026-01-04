import MarkdownRenderer from "@/components/markdown_renderer";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/db";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async  function BlogPostPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params;

    const posts = await prisma.blogPost.findUnique({
        where: { slug },
      });
    return (
        <main className="min-h-screen py-16 px-4">
            <article className="max-w-3xl mx-auto">
                <Button className="mb-8"  variant="ghost">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    <Link href="/blog">Back to Blog</Link>
                </Button>
                <h1 className="text-3xl font-bold mb-4">{posts?.title}</h1>
                <p className="text-muted-foreground mb-4">{new Date(posts?.createdAt || "").toLocaleDateString()}</p>

                <div>
                    <MarkdownRenderer content={posts?.content || ""} />
                </div>
            </article>
        </main>
    )
}