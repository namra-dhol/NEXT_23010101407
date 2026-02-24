import { prisma } from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";


export async function GET() {
  try {
    const managers = await prisma.users.findMany({
      where: {
        roles: {
          name: "MANAGER",
        },
      },
      include: {
        roles: true,
      },
    });

    return NextResponse.json(managers, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch managers",
        error: error.message,
      },
      { status: 500 }
    );
  }
}


export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();


    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Name, email, and password are required." },
        { status: 400 }
      );
    }

   
    const userExists = await prisma.users.findUnique({
      where: { email },
    });

    if (userExists) {
      return NextResponse.json(
        { success: false, message: "This email is already in use." },
        { status: 409 }
      );
    }

    
    const encryptedPassword = await bcrypt.hash(password, 12);

    const managerRole = await prisma.roles.findUnique({
      where: { name: "MANAGER" },
    });

    if (!managerRole) {
      return NextResponse.json(
        { success: false, message: "Manager role does not exist." },
        { status: 404 }
      );
    }

    const newUser = await prisma.users.create({
      data: {
        name,
        email,
        password: encryptedPassword,
        role_id: managerRole.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Manager account created successfully.",
        data: newUser,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}