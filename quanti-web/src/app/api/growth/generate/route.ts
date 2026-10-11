import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { generateWeeklyPosts } from "@/lib/growth/content-generator";
import { saveWeeklyPosts } from "@/lib/growth/save-posts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function jsonError(message: string, status = 500) {
  return NextResponse.json({ success: false, error: message }, { status });
}

function secretsEqual(provided: string, expected: string) {
  const left = Buffer.from(provided);
  const right = Buffer.from(expected);
  if (left.length !== right.length) {
    return false;
  }
  return timingSafeEqual(left, right);
}

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return true;
  }

  const authorization = request.headers.get("authorization")?.trim() || "";
  const bearer = authorization.match(/^Bearer\s+(.+)$/i)?.[1]?.trim() || "";
  const headerSecret =
    request.headers.get("x-vercel-cron-secret")?.trim() ||
    request.headers.get("x-cron-secret")?.trim() ||
    "";

  return secretsEqual(bearer, secret) || secretsEqual(headerSecret, secret);
}

async function handleGenerate(request: Request) {
  if (!isAuthorized(request)) {
    return jsonError("Unauthorized", 401);
  }

  try {
    const drafts = await generateWeeklyPosts();
    const posts = await saveWeeklyPosts(drafts);
    return NextResponse.json({
      success: true,
      count: posts.length,
      posts,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to generate growth posts.";
    console.error("Growth generate error", error);
    return jsonError(message, 500);
  }
}

export async function GET(request: Request) {
  return handleGenerate(request);
}

export async function POST(request: Request) {
  return handleGenerate(request);
}
