import { verifyToken } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {

        const params = await context.params;
        const commentIdStr = params?.id;
        if (!commentIdStr) {
            return NextResponse.json(
                { message: "Comment ID missing", received: params },
                { status: 400 }
            );
        }

        const commentId = parseInt(commentIdStr, 10);
        if (Number.isNaN(commentId)) {
            return NextResponse.json(
                { message: "Invalid comment ID", received: commentIdStr },
                { status: 400 }
            );
        }


        const authHeader = req.headers.get("authorization");
        if (!authHeader) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { userId, role } = verifyToken(authHeader);

        const { comment } = await req.json();
        if (!comment || typeof comment !== "string") {
            return NextResponse.json(
                { message: "Comment text is required" },
                { status: 400 }
            );
        }

        const existingComment = await prisma.ticket_comments.findUnique({
            where: { id: commentId },
            include: { users: true },
        });

        if (!existingComment) {
            return NextResponse.json({ message: "Comment not found" }, { status: 404 });
        }


        if (
            role !== "MANAGER" &&
            role !== "SUPPORT" &&
            existingComment.user_id !== userId
        ) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const updatedComment = await prisma.ticket_comments.update({
            where: { id: commentId },
            data: { comment },
            include: {
                users: {
                    include: { roles: true },
                },
            },
        });

        return NextResponse.json(updatedComment, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}



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

const commentId = parseInt(id, 10);

    if (Number.isNaN(commentId)) {
            return NextResponse.json(
        { message: "Invalid comment ID", received: id },
                { status: 400 }
            );
        }

        const comment = await prisma.ticket_comments.findUnique({

            where: { id: commentId },
        });

        if (!comment) {
            return NextResponse.json(
                { message: "Comment not found" },
                { status: 404 }
            );
        }

        await prisma.ticket_comments.delete({
            where: { id: commentId },
        });

        return NextResponse.json(
            { message: "Comment deleted successfully" },
            { status: 200 }
        );

    } catch (error: any) {
        return NextResponse.json(
            { message: error.message },
            { status: 500 }
        );
    }
}
