import { prisma } from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/app/lib/auth";

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {

        const { id } = await context.params;

        if (!id) {
            return NextResponse.json(
                { message: "Ticket ID missing" },
                { status: 400 }
            );
        }

        const ticketId = parseInt(id, 10);

        if (Number.isNaN(ticketId)) {
            return NextResponse.json(
                { message: "Invalid ticket ID", received: id },
                { status: 400 }
            );
        }


        const authHeader = req.headers.get("authorization");
        if (!authHeader) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        verifyToken(authHeader); 

        
        const comments = await prisma.ticket_comments.findMany({
            where: { ticket_id: ticketId },
            include: {
                users: {
                    include: {
                        roles: true,
                    },
                },
            },
            orderBy: {
                created_at: "asc",
            },
        });

        return NextResponse.json(comments, { status: 200 });

    } catch (error: any) {
        return NextResponse.json(
            { message: error.message },
            { status: 500 }
        );
    }
}
export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {

        const params = await context.params;
        console.log("PARAMS:", params);

        const ticketIdStr = params?.id;
        if (!ticketIdStr) {
            return NextResponse.json(
                { message: "Ticket ID missing", received: params },
                { status: 400 }
            );
        }

        const ticketId = parseInt(ticketIdStr, 10);
        if (Number.isNaN(ticketId)) {
            return NextResponse.json(
                { message: "Invalid ticket ID", received: ticketIdStr },
                { status: 400 }
            );
        }


        const authHeader = req.headers.get("authorization");
        if (!authHeader)
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const { userId, role } = verifyToken(authHeader);


        const { comment } = await req.json();
        if (!comment || typeof comment !== "string") {
            return NextResponse.json(
                { message: "Comment is required" },
                { status: 400 }
            );
        }


        const ticket = await prisma.tickets.findUnique({
            where: { id: ticketId },
        });

        if (!ticket) {
            return NextResponse.json({ message: "Ticket not found" }, { status: 404 });
        }

        const newComment = await prisma.ticket_comments.create({
            data: {
                comment,
                ticket_id: ticketId,
                user_id: userId,
            },
            include: {
                users: {
                    include: {
                        roles: true,
                    },
                },
            },
        });

        return NextResponse.json(newComment, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}