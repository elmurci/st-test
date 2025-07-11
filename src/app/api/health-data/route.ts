export const revalidate = 0;
export const dynamic = "force-dynamic";

import { writeHealthData } from "./nillionOrgConfig";
import { NextRequest, NextResponse } from "next/server";

function convertBigIntToString(obj: any) {
  return JSON.parse(
    JSON.stringify(obj, (key, value) => {
      if (typeof value === "bigint") {
        return value.toString();
      }
      return value;
    })
  );
}

export async function POST(request: NextRequest) {
  try {
    const { data } = await request.json();

    const schemaId = "c95e1c7c-7eec-4492-85b2-1c223de669f5"; //process.env.NILLION_SCHEMA_ID;

    // console.log("[SCHEMA ID]", schemaId);

    // console.log("[DATA]", data);

    // Transform the data while preserving all original fields except 'id'
    const transformedData = data.map((item: any) => {
      const { id, date, ...rest } = item;

      // Validate and parse the date
      let isoDate;
      try {
        // First check if we already have a valid ISO string
        if (typeof date === "string" && !isNaN(Date.parse(date))) {
          isoDate = new Date(date).toISOString();
        } else if (date instanceof Date) {
          isoDate = date.toISOString();
        } else {
          throw new Error(`Invalid date value: ${date}`);
        }
      } catch (error) {
        console.error(`Error parsing date: ${date}`, error);
        // Fallback to current timestamp if date is invalid
        isoDate = new Date().toISOString();
      }

      // Prepare the transformed item with sensitive data encrypted using %allot
      const transformedItem = {
        _id: id,
        date: isoDate,
        ...rest, // Spread the remaining fields
      };

      // Apply encryption to rawData if it exists
      if (transformedItem.rawData) {
        transformedItem.rawData = {
          "%allot": JSON.stringify(transformedItem.rawData),
        };
      }

      return transformedItem;
    });

    if (!schemaId) throw new Error("Schema ID is required");

    const result = await writeHealthData(schemaId, transformedData);

    // console.log("[RESULT]", result);

    if (
      result.status === 400 ||
      result.status === 401 ||
      result.status === 500
    ) {
      throw new Error(result.statusText);
    }

    return NextResponse.json({
      success: true,
      data: convertBigIntToString(result),
    });
  } catch (error: any) {
    console.error("Error writing health data:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
