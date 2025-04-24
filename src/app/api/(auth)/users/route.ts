// app/api/users/route.ts

import { NextResponse } from "next/server";
import { prisma } from "../../../../../utils/db";
// import { prisma } from "@/utils/db";
// import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstname, lastname, username, email, password, bio, imageUrl } =
      body;

    // Basic validation
    if (!firstname || !lastname || !username || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if email or username already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const user = await prisma.user.create({
      data: {
        firstname,
        lastname,
        username,
        email,
        password: hashedPassword,
        bio,
        imageUrl,
      },
    });

    // Don’t return password in response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("User creation error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
