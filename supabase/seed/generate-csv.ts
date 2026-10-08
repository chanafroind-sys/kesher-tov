import fs from "fs";
import path from "path";
import { ALL_COMPANIES } from "./all-companies";

function escapeCsvField(val: string | null | undefined): string {
  if (!val) return "";
  if (val.includes(",") || val.includes('"') || val.includes("\n") || val.includes("|")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

export function generateSeedFiles() {
  const csvHeaders = ["name_he", "name_en", "aliases", "website_domain", "category", "parent_name_he"];
  const csvRows: string[] = [csvHeaders.join(",")];
  const toVerifyRows: Array<{ name_he: string; category: string; reason: string }> = [];

  for (const item of ALL_COMPANIES) {
    const nameHe = item.name_he;
    const nameEn = item.name_en || "";
    const aliases = (item.aliases || []).join("|");
    const domain = item.website_domain || "";
    const category = item.category || "other";
    const parent = item.parent_name_he || "";

    if (item.uncertain_domain || !domain) {
      toVerifyRows.push({
        name_he: nameHe,
        category,
        reason: "דומיין אתר לא אותר בוודאות גבוהה / חברה ללא אתר רשמי עצמאי",
      });
    }

    csvRows.push([
      escapeCsvField(nameHe),
      escapeCsvField(nameEn),
      escapeCsvField(aliases),
      escapeCsvField(domain),
      escapeCsvField(category),
      escapeCsvField(parent),
    ].join(","));
  }

  const csvPath = path.resolve(process.cwd(), "supabase/seed/companies.csv");
  fs.writeFileSync(csvPath, csvRows.join("\n") + "\n", "utf8");
  console.log(`Wrote ${csvRows.length - 1} companies to ${csvPath}`);

  // Generate docs/companies-to-verify.md
  let mdContent = `# חברות לאימות (Companies to Verify)\n\n`;
  mdContent += `דוח זה מרכז חברות מתוך \`docs/companies-input.txt\` שכתובת האתר שלהן לא אותרה בוודאות מלאה או שאין להן אתר עצמאי רשמי, בהתאם לכלל: *"never invent a website - if you are not sure, leave it empty and add the row to docs/companies-to-verify.md"*.\n\n`;
  mdContent += `| שם בעברית | קטגוריה | סיבת אימות |\n`;
  mdContent += `| :--- | :--- | :--- |\n`;

  for (const v of toVerifyRows) {
    mdContent += `| ${v.name_he} | ${v.category} | ${v.reason} |\n`;
  }

  mdContent += `\n**סה"כ חברות לאימות:** ${toVerifyRows.length} מתוך ${ALL_COMPANIES.length}\n`;

  const mdPath = path.resolve(process.cwd(), "docs/companies-to-verify.md");
  fs.writeFileSync(mdPath, mdContent, "utf8");
  console.log(`Wrote verification report to ${mdPath}`);
}

generateSeedFiles();
