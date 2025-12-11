import { syncHistory } from "@/actions/histories";
import { VidlinkEventData } from "@/hooks/useVidlinkPlayer";
import { NextResponse } from "next/server";

type ResponseBody = VidlinkEventData["data"] & { completed?: boolean };

export const POST = async (request: Request) => {
  try {
    const body = (await request.json()) as ResponseBody;

    const res = await syncHistory(body, body.completed);

    return NextResponse.json(res);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Đã xảy ra lỗi không mong muốn",
      },
      { status: 500 },
    );
  }
};
