import { NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma"; // adjust to where your Prisma client is
const prisma = new PrismaClient();
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
