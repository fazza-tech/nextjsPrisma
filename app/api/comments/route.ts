import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content } = await req.json();

    if (!content || typeof content !== "string" || content.trim().length === 0) {
        return NextResponse.json({ error: "Invalid content" }, { status: 400 });
    }

    const comment = await prisma.comment.create({
        data: {
            content: content.trim(),
            userId: session.user.id,
        },
    });

    return NextResponse.json(comment);
}