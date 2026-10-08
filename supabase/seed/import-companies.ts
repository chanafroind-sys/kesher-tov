import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import type { CompanyCategory } from "@/types/database";



interface ParsedCompanyRow {
  name_he: string;
  name_en: string | null;
  aliases: string[];
  website_domain: string | null;
  category: CompanyCategory;
  parent_name_he: string | null;
}

function parseCsv(content: string): ParsedCompanyRow[] {
  const lines = content.split("\n").filter((l) => l.trim().length > 0);
  if (lines.length <= 1) return [];

  const rows: ParsedCompanyRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const fields: string[] = [];
    let current = "";
    let insideQuotes = false;

    for (let charIndex = 0; charIndex < line.length; charIndex++) {
      const char = line[charIndex];
      if (char === '"') {
        if (insideQuotes && line[charIndex + 1] === '"') {
          current += '"';
          charIndex++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === "," && !insideQuotes) {
        fields.push(current);
        current = "";
      } else {
        current += char;
      }
    }
    fields.push(current);

    const [name_he, name_en, aliasesRaw, website_domain, categoryRaw, parent_name_he] = fields.map((f) =>
      f ? f.trim() : ""
    );

    if (!name_he) continue;

    const aliases = aliasesRaw
      ? aliasesRaw
          .split("|")
          .map((a) => a.trim())
          .filter(Boolean)
      : [];

    const validCategories: CompanyCategory[] = [
      "hitech",
      "government",
      "banking",
      "health",
      "education",
      "other",
    ];

    const category = validCategories.includes(categoryRaw as CompanyCategory)
      ? (categoryRaw as CompanyCategory)
      : "other";

    rows.push({
      name_he,
      name_en: name_en || null,
      aliases,
      website_domain: website_domain || null,
      category,
      parent_name_he: parent_name_he || null,
    });
  }

  return rows;
}

export async function importCompanies() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "http://127.0.0.1:54321";
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "dummy-service-key";

  console.log(`Connecting to Supabase at: ${supabaseUrl}`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient(supabaseUrl, serviceRoleKey) as any;

  const csvPath = path.resolve(process.cwd(), "supabase/seed/companies.csv");
  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV file not found at ${csvPath}`);
  }

  const csvContent = fs.readFileSync(csvPath, "utf8");
  const parsedRows = parseCsv(csvContent);
  console.log(`Loaded ${parsedRows.length} companies from CSV`);

  // Step 1: Upsert main companies without parent references first (idempotent by name_he)
  // Retrieve existing companies to match by name_he
  const { data: existingCompanies, error: fetchErr } = await supabase
    .from("companies")
    .select("id, name_he");

  if (fetchErr) {
    console.error("Warning: could not fetch existing companies from DB:", fetchErr.message);
  }

  const nameToIdMap = new Map<string, string>();
  if (existingCompanies) {
    for (const c of existingCompanies) {
      nameToIdMap.set(c.name_he, c.id);
    }
  }

  let insertedCount = 0;
  let updatedCount = 0;

  for (const row of parsedRows) {
    const existingId = nameToIdMap.get(row.name_he);

    if (existingId) {
      // Update
      const { error: updErr } = await supabase
        .from("companies")
        .update({
          name_en: row.name_en,
          website_domain: row.website_domain,
          category: row.category,
        })
        .eq("id", existingId);

      if (updErr) {
        console.error(`Error updating company ${row.name_he}:`, updErr.message);
      } else {
        updatedCount++;
      }
    } else {
      // Insert
      const { data: insData, error: insErr } = await supabase
        .from("companies")
        .insert({
          name_he: row.name_he,
          name_en: row.name_en,
          website_domain: row.website_domain,
          category: row.category,
        })
        .select("id")
        .single();

      if (insErr) {
        console.error(`Error inserting company ${row.name_he}:`, insErr.message);
      } else if (insData) {
        nameToIdMap.set(row.name_he, insData.id);
        insertedCount++;
      }
    }
  }

  console.log(`Phase 1 complete: ${insertedCount} inserted, ${updatedCount} updated.`);

  // Step 2: Resolve parent companies
  let linkedParentsCount = 0;
  for (const row of parsedRows) {
    if (row.parent_name_he) {
      const childId = nameToIdMap.get(row.name_he);
      const parentId = nameToIdMap.get(row.parent_name_he);

      if (childId && parentId) {
        const { error: linkErr } = await supabase
          .from("companies")
          .update({ parent_company_id: parentId })
          .eq("id", childId);

        if (!linkErr) linkedParentsCount++;
      }
    }
  }
  console.log(`Phase 2 complete: linked ${linkedParentsCount} parent companies.`);

  // Step 3: Upsert company aliases (idempotent using DB UNIQUE(company_id, alias))
  let aliasCount = 0;
  for (const row of parsedRows) {
    const companyId = nameToIdMap.get(row.name_he);
    if (!companyId || row.aliases.length === 0) continue;

    for (const alias of row.aliases) {
      // Try insert or ignore duplicate
      const { error: aliasErr } = await supabase
        .from("company_aliases")
        .upsert(
          {
            company_id: companyId,
            alias,
          },
          { onConflict: "company_id,alias", ignoreDuplicates: true }
        );

      if (!aliasErr) {
        aliasCount++;
      }
    }
  }

  console.log(`Phase 3 complete: processed ${aliasCount} aliases.`);
  console.log("Import completed successfully!");
}

// Run directly when executed
if (require.main === module || process.argv[1]?.includes("import-companies")) {
  importCompanies().catch((err) => {
    console.error("Import failed:", err);
    process.exit(1);
  });
}
