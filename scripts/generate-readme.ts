import fs from "fs";
import {
  fetchAllPrompts,
  sortPrompts,
  fetchPromptCategories,
  fetchOfficialCases,
} from "./utils/cms-client.js";
import {
  generateMarkdown,
  SUPPORTED_LANGUAGES,
} from "./utils/markdown-generator.js";

async function main() {
  try {
    // Loop through all supported languages
    for (const lang of SUPPORTED_LANGUAGES) {
      console.log(`\n🌐 Processing language: ${lang.name} (${lang.code})...`);

      console.log("  📥 Loading categories from local data...");
      const { allCategories } = await fetchPromptCategories(lang.code);
      console.log(`  ✅ Fetched ${allCategories.length} categories`);

      const officialCases = await fetchOfficialCases();

      console.log(`  📥 Loading prompts from local data (locale: ${lang.code})...`);
      const { docs: prompts, total } = await fetchAllPrompts(
        lang.code,
        allCategories
      );

      console.log(`  ✅ Fetched ${prompts.length} prompts (total: ${total})`);

      console.log("  🔃 Sorting prompts...");
      const sorted = sortPrompts(prompts, total);

      console.log("  📝 Generating README...");
      const markdown = generateMarkdown(
        { ...sorted, categories: allCategories, officialCases },
        total,
        lang.code
      );

      console.log(`  💾 Writing ${lang.readmeFileName}...`);
      fs.writeFileSync(lang.readmeFileName, markdown, "utf-8");

      console.log(`  ✅ ${lang.readmeFileName} updated successfully!`);
      console.log(
        `  📊 Stats: ${sorted.stats.total} total, ${sorted.featured.length} featured`
      );
    }

    console.log("\n✨ All languages processed successfully!");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

main();
