import { type NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"
import * as XLSX from "xlsx"
import PDFDocument from "pdfkit"

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "costa_voyage",
  password: "mohamedrt133",
  port: 5432,
})

export async function GET(request: NextRequest, { params }: { params: { type: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get("format") || "excel"
    const type = params.type

    const client = await pool.connect()
    let data: any[] = []
    let filename = ""

    switch (type) {
      case "bookings":
        const bookingsResult = await client.query(`
          SELECT 
            id,
            agency,
            hotel,
            city,
            check_in as "checkIn",
            check_out as "checkOut",
            rooms,
            guests,
            status,
            notes,
            created_at as "createdAt"
          FROM bookings 
          ORDER BY created_at DESC
        `)
        data = bookingsResult.rows
        filename = "bookings_export"
        break

      case "hotels":
        const hotelsResult = await client.query(`
          SELECT 
            id,
            name,
            city,
            rating,
            phone,
            address,
            amenities,
            description,
            created_at as "createdAt"
          FROM hotels 
          ORDER BY created_at DESC
        `)
        data = hotelsResult.rows.map((hotel) => ({
          ...hotel,
          amenities: Array.isArray(hotel.amenities) ? hotel.amenities.join(", ") : hotel.amenities,
        }))
        filename = "hotels_export"
        break

      case "cities":
        const citiesResult = await client.query(`
          SELECT 
            id,
            name,
            country,
            description,
            is_active as "isActive",
            created_at as "createdAt"
          FROM cities 
          ORDER BY created_at DESC
        `)
        data = citiesResult.rows.map((city) => ({
          ...city,
          isActive: city.isActive ? "Active" : "Inactive",
        }))
        filename = "cities_export"
        break

      default:
        client.release()
        return NextResponse.json({ error: "Invalid export type" }, { status: 400 })
    }

    client.release()

    if (format === "excel") {
      // Create Excel file
      const worksheet = XLSX.utils.json_to_sheet(data)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, type)

      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })

      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${filename}.xlsx"`,
        },
      })
    } else if (format === "pdf") {
      // Create PDF file
      const doc = new PDFDocument()
      const chunks: Buffer[] = []

      doc.on("data", (chunk) => chunks.push(chunk))

      return new Promise((resolve) => {
        doc.on("end", () => {
          const buffer = Buffer.concat(chunks)
          resolve(
            new NextResponse(buffer, {
              headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${filename}.pdf"`,
              },
            }),
          )
        })

        // Add content to PDF
        doc.fontSize(20).text(`${type.charAt(0).toUpperCase() + type.slice(1)} Export`, 50, 50)
        doc.moveDown()

        if (data.length > 0) {
          const keys = Object.keys(data[0])
          let yPosition = 120

          // Add headers
          doc.fontSize(12).font("Helvetica-Bold")
          keys.forEach((key, index) => {
            doc.text(key, 50 + index * 80, yPosition, { width: 75 })
          })

          yPosition += 20
          doc.font("Helvetica")

          // Add data rows
          data.forEach((row, rowIndex) => {
            if (yPosition > 700) {
              doc.addPage()
              yPosition = 50
            }

            keys.forEach((key, index) => {
              const value = row[key]?.toString() || ""
              doc.text(value.substring(0, 15), 50 + index * 80, yPosition, { width: 75 })
            })
            yPosition += 15
          })
        } else {
          doc.text("No data available", 50, 120)
        }

        doc.end()
      })
    } else if (format === "csv") {
      const headers = Object.keys(data[0] || {})
      const csvContent = [
        headers.join(","),
        ...data.map((row) => headers.map((header) => `"${row[header] || ""}"`).join(",")),
      ].join("\n")

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${filename}.csv"`,
        },
      })
    }

    return NextResponse.json({ error: "Invalid format" }, { status: 400 })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Export failed" }, { status: 500 })
  }
}
