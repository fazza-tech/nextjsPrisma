import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MessageCircle ,ArrowRight} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import prisma from "@/lib/db";
export default async function Home() {

  const posts = await prisma.blogPost.findMany({
    orderBy: {
      createdAt: "desc"},
      take: 3, 
  });
  return (
    <main className="min-h-screen ">
      <section className="flex flex-col items-center justify-center py-10 px-4 text-center">
        <h1 className="text-4xl font-bold mb-4">Hi , Welcome To Alogix </h1>
        <p className="text-muted-foreground text-lg mb-6">Here You Can Find All The Latest News And Updates About Alogix</p>
        <div className="flex gap-4">
          <Button>
            <Link href="/blog">Read Blog</Link>
          </Button>
          <Button variant={"outline"}>
            <MessageCircle className="w-4 h-4 mr-2" />
            <Link href="/comments">Comments</Link>
          </Button>
        </div>
      </section>

      {/*About Section*/}
      <section className="py-10 px-4 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">About Us</h2>
        <p className="text-muted-foreground ">We specialize in building web applications that are both functional and aesthetically pleasing.</p>
      </section>

      {/* Recent Posts Section */}
      <section className="py-16 px-4 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Recent Posts</h2>
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post) => (
              <Card key={post.id}>
                <CardHeader>
                  <CardTitle>{post.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{post.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ):(
          <p className="text-muted-foreground">No posts found</p>
        )}
        <Button variant="link" asChild className=" mt-4">
          <Link href="/blog">View All Posts <ArrowRight className="w-4 h-4 ml-2" /></Link>
        </Button>
      </section>
    </main>
  );
}
