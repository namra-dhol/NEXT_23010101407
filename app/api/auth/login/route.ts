import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { createToken } from "@/app/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const account = await prisma.users.findUnique({
      where: { email },
      include: { roles: true },
    });

    if (!account) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const validPassword = await bcrypt.compare(password, account.password);

    if (!validPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = createToken({
      userId: account.id,
      role: account.roles.name,
    });

    return NextResponse.json({ token }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}