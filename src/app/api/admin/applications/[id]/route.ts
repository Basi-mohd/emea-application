import { createClient } from "../../../../../../supabase/server";
import { NextRequest, NextResponse } from "next/server";

const ADMIN_EMAIL = "admin@emeahss.edu";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.email !== ADMIN_EMAIL) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { error } = await supabase
      .from("applications")
      .delete()
      .eq("id", params.id);

    if (error) {
      console.error("Error deleting application:", error);
      return NextResponse.json(
        { error: "Failed to delete application" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting application:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
