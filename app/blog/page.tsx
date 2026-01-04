import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader ,CardTitle} from "@/components/ui/card";
import prisma from "@/lib/db";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function Blog() {

    const posts = await prisma.blogPost.findMany({
        orderBy: {
          createdAt: "desc"},
          take: 3, 
      });

    return (
        <main className="max-h-screen py-16 px-4">
            <div className="max-w-3xl mx-auto">
                <Button className="mb-8" asChild variant="ghost">
                    <Link href="/"><ArrowLeft className="w-4 h-4 ml-2" /> Back to Home </Link>
                </Button>
                <h1 className="text-3xl font-bold mb-8">Blog</h1>

                
            {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post) => (
              <Card key={post.id}>
                <Link href={`/blog/${post.slug}`}>
                <CardHeader>
                  <CardTitle>{post.title}</CardTitle>
                </CardHeader>
                {/* <CardContent>
                  <p>{post.content}</p>
                </CardContent> */}
                <CardContent>
                  <p>{post.createdAt.toLocaleDateString()}</p>
                </CardContent>
                </Link>
                
              </Card>
            ))}
          </div>
        ):(
          <p className="text-muted-foreground">No posts found</p>
        )}
            </div>

        </main>
    )
}