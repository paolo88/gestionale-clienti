
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // Using Anon key for client-side like access, or service role if needed.
// Wait, for backend usually we use service key or just createClient from utils if available.
// But this is a standalone script. I'll assume env vars are present or try to read them.
// Actually, `src/lib/server-supabase` uses next/headers which won't work in script.
// Use direct env vars.

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    const { data, error } = await supabase
        .from("revenues")
        .select("period, amount");

    if (error) {
        console.error("Error fetching revenues:", error);
        return;
    }

    const distribution: Record<string, number> = {};
    let totalAmount = 0;

    data.forEach((row: any) => {
        const year = new Date(row.period).getFullYear();
        const month = new Date(row.period).getMonth() + 1;
        const key = `${year}-${month}`;

        distribution[year] = (distribution[year] || 0) + 1;
        totalAmount += Number(row.amount);
    });

    console.log("Total Records:", data.length);
    console.log("Total Amount:", totalAmount);
    console.log("Distribution by Year:", distribution);

    // Check specifically for 2025
    const revenues2025 = data.filter((row: any) => new Date(row.period).getFullYear() === 2025);
    console.log("2025 Records:", revenues2025.length);
    if (revenues2025.length > 0) {
        console.log("Sample 2025 date:", revenues2025[0].period);
    }
}

checkData();
