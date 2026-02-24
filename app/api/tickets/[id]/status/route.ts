import { prisma } from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/app/lib/auth";

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {

        const { id } = await context.params;

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

        const { role } = verifyToken(authHeader);

        if (role !== "MANAGER" && role !== "SUPPORT") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }


        const body = await req.json();
        const { status } = body;

        const allowedStatuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

        if (!status || !allowedStatuses.includes(status)) {
            return NextResponse.json(
                { message: "Invalid status" },
                { status: 400 }
            );
        }


        const ticket = await prisma.tickets.findUnique({
            where: { id: ticketId },
        });

        if (!ticket) {
            return NextResponse.json(
                { message: "Ticket not found" },
                { status: 404 }
            );
        }

        const updatedTicket = await prisma.tickets.update({
            where: { id: ticketId },
            data: { status },
        });

        return NextResponse.json(updatedTicket, { status: 200 });

    } catch (error: any) {
        return NextResponse.json(
            { message: error.message },
            { status: 500 }
        );
    }
}