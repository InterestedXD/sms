import prisma from "@/lib/db";
import { createSession } from "@/session";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  return NextResponse.json({ message: "Hello" });
}

export async function POST(req: NextRequest) {
  try {
    const reqBody = await req.json();

    // 🔥 DEBUG 1
    console.log("LOGIN HIT:", reqBody);

    const { uid } = reqBody;

    const parsedUid = parseInt(uid);

    // 🔥 DEBUG 2
    console.log("PARSED UID:", parsedUid);

    if (isNaN(parsedUid)) {
      throw new Error("UID must be number");
    }

    const user = await prisma.user.findUnique({
      where: {
        id: parsedUid,
      },
      select: {
        id: true,
        role: true,
        sex: true,
        status: true,
        lastLogin: true,
      },
    });

    // 🔥 DEBUG 3
    console.log("USER FOUND:", user);

    if (!user) {
      throw new Error("Invalid Credential");
    }

    // 🚀 BYPASS PASSWORD CHECK

    await createSession({
      id: user.id,
      role: user.role,
      _xx_httpoui: user.sex,
      _u_ss_t: user.status,
      _l_l: user.lastLogin,
    });

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        lastLogin: new Date().toISOString(),
      },
    });

    console.log("LOGIN SUCCESS");

    return NextResponse.json({ role: user.role }, { status: 200 });

  } catch (error: any) {
    console.log("LOGIN ERROR:", error.message);

    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}