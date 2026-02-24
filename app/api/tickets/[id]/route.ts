import { prisma } from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/app/lib/auth";

export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {

        const params = await context.params;

        console.log("PARAMS:", params);

        const id = params?.id;

        if (!id) {
            return NextResponse.json(
                { message: "Ticket ID missing", received: params },
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

        const ticket = await prisma.tickets.findUnique({
            where: { id: ticketId },
        });

        if (!ticket) {
            return NextResponse.json(
                { message: "Ticket not found" },
                { status: 404 }
            );
        }

        await prisma.tickets.delete({
            where: { id: ticketId },
        });

        return NextResponse.json(
            { message: "Ticket deleted successfully" },
            { status: 200 }
        );

    } catch (error: any) {
        return NextResponse.json(
            { message: error.message },
            { status: 500 }
        );
    }
}




