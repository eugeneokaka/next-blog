import { NextResponse } from "next/server";
import { prisma } from "../../../../utils/db"; // Adjust the import path as necessary
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, postId, content } = body;

    // Basic validation
    if (!userId || !postId || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        userId,
        postId,
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
