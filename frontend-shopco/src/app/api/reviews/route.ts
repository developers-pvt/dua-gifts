import { NextRequest, NextResponse } from "next/server";
import { reviewsData } from "@/lib/reviews-data";

export const dynamic = "force-dynamic";

let dynamicReviews = [...reviewsData];

export async function GET() {
  return NextResponse.json({
    success: true,
    reviews: dynamicReviews,
    total: dynamicReviews.length,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user, content, rating } = body;

    if (!user || !content) {
      return NextResponse.json(
        { success: false, error: "Name and review content are required" },
        { status: 400 }
      );
    }

    const newReview = {
      id: dynamicReviews.length + 1,
      user,
      content,
      rating: Number(rating) || 5,
      date: new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    };

    dynamicReviews.unshift(newReview);

    return NextResponse.json({ success: true, review: newReview }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit review" },
      { status: 500 }
    );
  }
}
