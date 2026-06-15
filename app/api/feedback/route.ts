import { getServerSession } from "next-auth";
import { authOptions } from "@/app/auth";
import { createFeedback, getAllFeedback } from "@/lib/repositories/feedbackRepository";
import { normalizeEmail, isBetaAllowed, isAdmin } from "@/lib/auth/allowlist";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check beta allowlist
    if (!isBetaAllowed(session.user.email)) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { resultContext, note } = body;

    if (!resultContext && !note) {
      return NextResponse.json(
        { error: "resultContext or note is required" },
        { status: 400 }
      );
    }

    const feedback = await createFeedback({
      userId: (session.user as any).id as string | undefined, // populated by session callback
      email: normalizeEmail(session.user.email),
      resultContext,
      note,
    });

    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    console.error("Error creating feedback:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!isAdmin(session.user.email)) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const records = await getAllFeedback();
    return NextResponse.json(records);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
