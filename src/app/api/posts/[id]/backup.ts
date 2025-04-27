import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../utils/db"; // Adjust path to your prisma client

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    // First, increment the views
    await prisma.post.update({
      where: { id },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    // Then fetch the updated post
    const post = await prisma.post.findUnique({
      where: {
        id,
      },
      include: {
        user: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            imageUrl: true,
            username: true,
          },
        },
        category: true,
        comments: {
          include: {
            user: {
              select: {
                id: true,
                firstname: true,
                lastname: true,
              },
            },
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}
import { verifyToken } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authHeader = req.headers.get("authorization");
  // const token = authHeader?.split(" ")[1]; // Expect: "Bearer <token>"
  const token = req.cookies.get("token")?.value;
  console.log("Token:", token); // Debugging line

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const decoded = verifyToken(token);
  console.log("Decoded token:", decoded); // Debugging line
  if (!decoded) {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }

  const post = await prisma.post.findUnique({
    where: { id: params.id },
    select: { userId: true },
  });

  if (!post) {
    return NextResponse.json({ message: "Post not found" }, { status: 404 });
  }

  if (post.userId !== decoded.userId) {
    return NextResponse.json(
      { message: "Forbidden: Not your post" },
      { status: 403 }
    );
  }

  const { title, content, imageUrl, categoryId } = await req.json();

  try {
    const updatedPost = await prisma.post.update({
      where: { id: params.id },
      data: {
        title,
        content,
        imageUrl,
        categoryId,
      },
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating post" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    console.log("Post ID:", id);

    if (!id) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    await prisma.post.delete({
      where: { id: id },
    });

    return NextResponse.json(
      { message: "Post deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[POST_DELETE]", error);
    return NextResponse.json(
      { error: "Something went wrong while deleting the post" },
      { status: 500 }
    );
  }
}
