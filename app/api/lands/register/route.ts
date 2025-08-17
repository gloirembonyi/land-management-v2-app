import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const userId = body.userId || body.owner_id

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    console.log("[v0] Land registration attempt for user ID:", userId)

    const { title, description, location_address, latitude, longitude, area_size, price, documents } = body

    // Validate required fields
    if (!title || !location_address || !area_size) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    try {
      const userExists = await DatabaseService.getUserById(userId)
      if (!userExists) {
        console.log("[v0] User not found in database:", userId)
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }
      console.log("[v0] User verified:", userExists.full_name || userExists.name)
    } catch (userError) {
      console.error("[v0] Error verifying user:", userError)
      return NextResponse.json({ error: "Failed to verify user" }, { status: 500 })
    }

    // Create the land record
    const landData = {
      owner_id: String(userId),
      title,
      description,
      location_address,
      latitude,
      longitude,
      area_size,
      price,
    }

    console.log("[v0] Creating land record:", landData)
    const newLand = await DatabaseService.createLand(landData)
    console.log("[v0] Land created successfully:", newLand.id)

    // Add documents if provided
    if (documents && documents.length > 0) {
      console.log("[v0] Adding", documents.length, "documents")
      for (const doc of documents) {
        await DatabaseService.addDocument({
          land_id: newLand.id,
          document_type: doc.document_type,
          file_name: doc.file_name,
          file_url: doc.file_url,
          file_size: doc.file_size,
          mime_type: doc.mime_type,
          uploaded_by: String(userId),
        })
      }
    }

    // Create admin notification
    await DatabaseService.createAdminNotification({
      type: "land_registration",
      title: "New Land Registration",
      message: `${title} has been submitted for approval by user ${String(userId)}`,
      related_land_id: newLand.id,
    })

    console.log("[v0] Land registration completed successfully")
    return NextResponse.json({
      success: true,
      land: newLand,
      message: "Land registration submitted successfully",
    })
  } catch (error) {
    console.error("[v0] Land registration error:", error)
    return NextResponse.json({ error: "Failed to register land" }, { status: 500 })
  }
}
