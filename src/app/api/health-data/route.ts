export const revalidate = 0;
export const dynamic = "force-dynamic";

import { writeHealthData } from "./nillionOrgConfig";
import { NextRequest, NextResponse } from "next/server";
import { toString } from 'uint8arrays';

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

    const i = new Uint8Array([123,34,105,97,116,34,58,49,55,53,50,52,50,53,53,55,57,44,34,101,120,112,34,58,49,55,53,50,52,50,57,49,55,57,44,34,105,115,115,34,58,34,100,105,100,58,110,105,108,58,116,101,115,116,110,101,116,58,110,105,108,108,105,111,110,49,110,109,99,51,108,101,100,100,101,50,102,51,102,110,54,103,51,118,51,106,51,117,101,118,121,117,99,119,106,108,119,101,97,53,119,109,104,97,34,44,34,97,117,100,34,58,34,100,105,100,58,110,105,108,58,116,101,115,116,110,101,116,58,110,105,108,108,105,111,110,49,57,116,48,103,101,102,109,55,112,114,54,120,106,107,113,50,115,106,52,48,102,48,114,115,55,119,122,110,108,100,103,102,103,52,103,117,117,101,34,125]);
    console.log("[uint8arrays************] toString RESULT *****", toString(i, 'base64url'));

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
