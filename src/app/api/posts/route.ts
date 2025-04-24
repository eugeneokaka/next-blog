import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../utils/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, content, imageUrl, username, categoryName } = body;
  console.log("Request body:", body);

  if (!username) {
    return NextResponse.json(
      { error: "Username is required" },
      { status: 400 }
    );
  }

  if (!categoryName) {
    return NextResponse.json(
      { error: "Category name is required" },
      { status: 400 }
    );
  }

  try {
    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find category by name
    const category = await prisma.category.findUnique({
      where: { name: categoryName },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Create post
    const post = await prisma.post.create({
      data: {
        title,
        slug: title.toLowerCase().replace(/\s+/g, "-"),
        content,
        imageUrl,
        userId: user.id,
        categoryId: category.id,
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (err) {
    console.error("Post creation error:", err);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
export async function GET(req: NextRequest) {
  // Use the `get` method to retrieve query parameters from `searchParams`
  const category = req.nextUrl.searchParams.get("category");
  const search = req.nextUrl.searchParams.get("search");
  const startDate = req.nextUrl.searchParams.get("startDate");
  const endDate = req.nextUrl.searchParams.get("endDate");

  try {
    // Build the filter conditions
    const filters: any = {}; // Use 'any' here to bypass type issues with dynamic filters

    // Category filter: Get the category ID from the category name
    if (category) {
      const categoryRecord = await prisma.category.findUnique({
        where: { name: category },
        select: { id: true },
      });

      if (categoryRecord) {
        filters.categoryId = categoryRecord.id; // Use categoryId in the filter
      }
    }

    // Date range filter
    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) filters.createdAt.gte = new Date(startDate);
      if (endDate) filters.createdAt.lte = new Date(endDate);
    }

    // Search filter (searching in title and content)
    if (search) {
      filters.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    // Fetch the posts with the filter conditions
    const posts = await prisma.post.findMany({
      where: filters,
      include: {
        category: true,
        user: true,
      },
      orderBy: { createdAt: "desc" },
    });
    console.log("Fetched posts:", posts);

    return NextResponse.json(posts, { status: 200 });
  } catch (err) {
    console.error("Error fetching posts:", err);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
