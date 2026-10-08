import fs from "fs";
import path from "path";
import * as React from "react";
import { render } from "@react-email/components";
import { SampleEmail } from "./sample";

export async function generateEmailPreview() {
  const html = await render(React.createElement(SampleEmail));
  const docsPath = path.resolve(process.cwd(), "docs/email-preview.html");
  fs.writeFileSync(docsPath, html, "utf8");
  console.log(`Rendered email preview successfully to ${docsPath}`);
}

generateEmailPreview().catch((err) => {
  console.error("Failed to render email preview:", err);
  process.exit(1);
});
