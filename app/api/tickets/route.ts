import { prisma } from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/app/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { userId, role } = verifyToken(authHeader);

    // Extract page and pageSize from query parameters
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10); // Default to page 1
    const pageSize = parseInt(url.searchParams.get("pageSize") || "10", 10); // Default to 10 items per page

    let where: any = {};

    // Apply role-based filtering
    if (role === "MANAGER") {
      where = {};
    } else if (role === "SUPPORT") {
      where = { assigned_to: userId };
    } else if (role === "USER") {
      where = { created_by: userId };
    } else {
      return NextResponse.json({ message: "Invalid role" }, { status: 403 });
    }

    // Get total count of tickets for pagination
    const totalTickets = await prisma.tickets.count({ where });

    // Fetch the tickets with pagination
    const tickets = await prisma.tickets.findMany({
      where,
      include: {
        users: {
          include: {
            roles: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
      skip: (page - 1) * pageSize,  
      take: pageSize,
    });

    
    const totalPages = Math.ceil(totalTickets / pageSize);

    return NextResponse.json({
      tickets,
      pagination: {
        totalTickets,
        totalPages,
        currentPage: page,
        pageSize,
      }
    }, { status: 200 });

  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { userId, role } = verifyToken(authHeader);

    if (role !== "MANAGER") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    if (!body.title || !body.description || !body.priority) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const ticket = await prisma.tickets.create({
      data: {
        title: body.title,
        description: body.description,
        priority: body.priority,
        status: "OPEN",
        created_by: Number(userId),
      },
      include: { users: { include: { roles: true } } },
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}