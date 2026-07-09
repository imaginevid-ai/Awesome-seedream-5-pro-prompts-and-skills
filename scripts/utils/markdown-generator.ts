import { Prompt, FilterCategory } from "./cms-client.js";
import { t } from "./i18n.js";

interface SortedPrompts {
  all: Prompt[];
  featured: Prompt[];
  regular: Prompt[];
  stats: {
    total: number;
    featured: number;
  };
  categories?: FilterCategory[];
}

export interface LanguageConfig {
  code: string;
  name: string;
  readmeFileName: string;
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  { code: "en", name: "English", readmeFileName: "README.md" },
  { code: "zh", name: "简体中文", readmeFileName: "README_zh.md" },
  { code: "zh-TW", name: "繁體中文", readmeFileName: "README_zh-TW.md" },
  { code: "ja-JP", name: "日本語", readmeFileName: "README_ja-JP.md" },
  { code: "ko-KR", name: "한국어", readmeFileName: "README_ko-KR.md" },
  { code: "th-TH", name: "ไทย", readmeFileName: "README_th-TH.md" },
  { code: "vi-VN", name: "Tiếng Việt", readmeFileName: "README_vi-VN.md" },
  { code: "hi-IN", name: "हिन्दी", readmeFileName: "README_hi-IN.md" },
  { code: "es-ES", name: "Español", readmeFileName: "README_es-ES.md" },
  { code: "es-419", name: "Español (Latinoamérica)", readmeFileName: "README_es-419.md" },
  { code: "de-DE", name: "Deutsch", readmeFileName: "README_de-DE.md" },
  { code: "fr-FR", name: "Français", readmeFileName: "README_fr-FR.md" },
  { code: "it-IT", name: "Italiano", readmeFileName: "README_it-IT.md" },
  { code: "pt-BR", name: "Português (Brasil)", readmeFileName: "README_pt-BR.md" },
  { code: "pt-PT", name: "Português", readmeFileName: "README_pt-PT.md" },
  { code: "tr-TR", name: "Türkçe", readmeFileName: "README_tr-TR.md" },
];

const MAX_REGULAR_PROMPTS_TO_DISPLAY = 120;
const REPO = "Nsmo-ai/-awesome-seedream-5-pro-prompts-and-skills";
const REPO_URL = `https://github.com/${REPO}`;

function getLocalePrefix(locale: string): string {
  if (locale === "en") return "en-US";
  if (locale === "zh") return "zh-CN";
  return locale;
}

function cleanPromptContent(content: string): string {
  if (!content) return content;
  return content
    .replace(/^```[\w-]*\s*\n?/im, "")
    .replace(/\n?```\s*$/im, "")
    .replace(/\n```[\w-]*\s*\n/g, "\n")
    .trim();
}

export function generateMarkdown(data: SortedPrompts, total: number, locale = "en"): string {
  const { featured, regular, stats, categories } = data;
  const displayedRegular = regular.slice(0, MAX_REGULAR_PROMPTS_TO_DISPLAY);
  const hiddenCount = total - displayedRegular.length - featured.length;

  let md = generateHeader(locale);
  md += generateLanguageNavigation(locale);
  md += generateCollectionCTA(categories || [], locale);
  md += generateTOC(locale);
  md += generateWhatIs(locale);
  md += generateStats(stats, locale);
  md += generateFeaturedSection(featured, locale);
  md += generateAllPromptsSection(displayedRegular, Math.max(0, hiddenCount), locale);
  md += generateContribute(locale);
  md += generateFooter(locale);

  return md;
}

function generateHeader(locale: string): string {
  const localePrefix = getLocalePrefix(locale);
  const heroImage = `public/images/seedream-5-pro-prompts-hero-${locale === "zh" || locale === "zh-TW" ? "zh" : "en"}.svg`;
  const crossPromoImage = "public/images/imaginevid-prompt-skills-cross-promo.svg";

  return `<a href="${REPO_URL}">
  <img src="${heroImage}" alt="Seedream 5 Pro Prompts and Skills" width="100%" />
</a>

<a href="https://imaginevid.com/${localePrefix}">
  <img src="${crossPromoImage}" alt="ImagineVid Prompt Skills" width="100%" />
</a>

> ${t("relatedPromo", locale)}
# ${t("title", locale)}

[![Awesome](https://awesome.re/badge.svg)](https://github.com/sindresorhus/awesome)
[![GitHub stars](https://img.shields.io/github/stars/${REPO}?style=social)](${REPO_URL})
[![License: CC BY 4.0](https://img.shields.io/badge/License-CC%20BY%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)
[![Update README](https://github.com/${REPO}/actions/workflows/update-readme.yml/badge.svg)](https://github.com/${REPO}/actions)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](docs/CONTRIBUTING.md)

> ${t("subtitle", locale)}

> ${t("copyright", locale)}

---

`;
}

function generateLanguageNavigation(currentLocale: string): string {
  const badges = SUPPORTED_LANGUAGES.map((lang) => {
    const isCurrent = lang.code === currentLocale;
    const color = isCurrent ? "brightgreen" : "lightgrey";
    const text = isCurrent ? "Current" : "Click%20to%20View";
    const safeName = encodeURIComponent(lang.name);
    return `[![${lang.name}](https://img.shields.io/badge/${safeName}-${text}-${color})](${lang.readmeFileName})`;
  });

  return `${badges.join(" ")}\n\n---\n\n`;
}

function generateCollectionCTA(categories: FilterCategory[], locale: string): string {
  const imageLang = locale === "zh" || locale === "zh-TW" ? "zh" : "en";
  const coverImage = `public/images/seedream-5-pro-prompts-cover-${imageLang}.svg`;

  let md = `## ${t("viewInGallery", locale)}

<div align="center">

![Cover](${coverImage})

</div>

**[${t("browseGallery", locale)}](${REPO_URL})**

${t("galleryFeatures", locale)}

| Feature | ${t("githubReadme", locale)} | ${t("collection", locale)} |
|---------|--------------|---------------------|
| ${t("visualLayout", locale)} | ${t("linearList", locale)} | ${t("masonryGrid", locale)} |
| ${t("search", locale)} | ${t("ctrlFOnly", locale)} | ${t("fullTextSearch", locale)} |
| ${t("aiGenerate", locale)} | - | ${t("aiOneClickGen", locale)} |
| ${t("mobile", locale)} | ${t("basic", locale)} | ${t("fullyResponsive", locale)} |
| ${t("categories", locale)} | - | ${t("categoryBrowsing", locale)} |

`;

  if (categories.length > 0) {
    md += generateCategoriesSection(categories, locale);
  }

  return `${md}---\n\n`;
}

function generateCategoriesSection(categories: FilterCategory[], locale: string): string {
  const parentCategories = categories.filter((category) => category.parentId === null);
  let md = `\n### ${t("browseByCategory", locale)}\n\n`;

  for (const parent of parentCategories) {
    md += `- **${parent.title}**\n`;
    const children = categories.filter((category) => category.parentId === parent.id);
    for (const child of children) {
      md += `  - <a id="${child.slug}"></a>[${child.title}](#${child.slug})\n`;
    }
  }

  return `${md}\n`;
}

function generatePromptSection(prompt: Prompt, index: number, locale: string): string {
  const authorLink = prompt.author.link || "#";
  const publishedDate = new Date(prompt.sourcePublishedAt).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const rawContent = prompt.translatedContent || prompt.content;
  const promptContent = cleanPromptContent(rawContent);
  const hasArguments = promptContent.includes("{argument");

  let md = `### No. ${index + 1}: ${prompt.title}\n\n`;
  md += `![Language-${prompt.language.toUpperCase()}](https://img.shields.io/badge/Language-${prompt.language.toUpperCase()}-blue)\n`;

  if (prompt.featured) {
    md += "![Featured](https://img.shields.io/badge/Featured-gold-gold)\n";
  }
  if (hasArguments) {
    md += "![Raycast](https://img.shields.io/badge/Raycast-Friendly-purple)\n";
  }
  if (prompt.needReferenceImages) {
    md += "![Reference](https://img.shields.io/badge/Reference-Image%20Needed-orange)\n";
  }

  md += `\n#### ${t("description", locale)}\n\n${prompt.description}\n\n`;
  md += `#### ${t("prompt", locale)}\n\n\`\`\`\n${promptContent}\n\`\`\`\n\n`;

  if (prompt.sourceMedia && prompt.sourceMedia.length > 0) {
    md += `#### ${t("generatedImages", locale)}\n\n`;
    prompt.sourceMedia.forEach((imageUrl, imgIndex) => {
      md += `##### Image ${imgIndex + 1}\n\n`;
      md += `<div align="center">\n`;
      md += `<img src="${imageUrl}" width="${prompt.featured ? "700" : "600"}" alt="${prompt.title} - Image ${imgIndex + 1}">\n`;
      md += `</div>\n\n`;
    });
  }

  md += `#### ${t("details", locale)}\n\n`;
  md += `- **${t("author", locale)}:** [${prompt.author.name}](${authorLink})\n`;
  if (prompt.sourceLink) {
    md += `- **${t("source", locale)}:** [${t("source", locale)}](${prompt.sourceLink})\n`;
  }
  md += `- **${t("published", locale)}:** ${publishedDate}\n`;
  md += `- **${t("languages", locale)}:** ${prompt.language}\n\n`;
  md += `**[${t("tryItNow", locale)}](${prompt.sourceLink || REPO_URL})**\n\n`;
  md += "---\n\n";

  return md;
}

function generateFeaturedSection(featured: Prompt[], locale: string): string {
  if (featured.length === 0) return "";
  let md = `## ${t("featuredPrompts", locale)}\n\n`;
  md += `> ${t("handPicked", locale)}\n\n`;
  featured.forEach((prompt, index) => {
    md += generatePromptSection(prompt, index, locale);
  });
  return md;
}

function generateAllPromptsSection(regular: Prompt[], hiddenCount: number, locale: string): string {
  if (regular.length === 0 && hiddenCount === 0) return "";
  let md = `## ${t("allPrompts", locale)}\n\n`;
  md += `> ${t("sortedByDate", locale)}\n\n`;
  regular.forEach((prompt, index) => {
    md += generatePromptSection(prompt, index, locale);
  });

  if (hiddenCount > 0) {
    md += `---\n\n## ${t("morePrompts", locale)}\n\n`;
    md += `<div align="center">\n\n`;
    md += `### ${hiddenCount} ${t("morePromptsDesc", locale)}\n\n`;
    md += `Due to GitHub README length limits, only the first ${MAX_REGULAR_PROMPTS_TO_DISPLAY} regular prompts are displayed here.\n\n`;
    md += `**[${t("viewAll", locale)}](${REPO_URL})**\n\n`;
    md += `${t("galleryFeature1", locale)}\n\n${t("galleryFeature2", locale)}\n\n${t("galleryFeature3", locale)}\n\n${t("galleryFeature4", locale)}\n\n`;
    md += `</div>\n\n---\n\n`;
  }

  return md;
}

function generateStats(stats: { total: number; featured: number }, locale: string): string {
  const now = new Date().toLocaleString(locale, {
    timeZone: "UTC",
    dateStyle: "full",
    timeStyle: "long",
  });

  return `## ${t("stats", locale)}

<div align="center">

| ${t("metric", locale)} | ${t("count", locale)} |
|--------|-------|
| ${t("totalPrompts", locale)} | **${stats.total}** |
| ${t("featured", locale)} | **${stats.featured}** |
| ${t("lastUpdated", locale)} | **${now}** |

</div>

---

`;
}

function generateTOC(locale: string): string {
  return `## ${t("toc", locale)}

- [${t("viewInGallery", locale)}](#${anchor(t("viewInGallery", locale))})
- [${t("whatIs", locale)}](#${anchor(t("whatIs", locale))})
- [${t("stats", locale)}](#${anchor(t("stats", locale))})
- [${t("featuredPrompts", locale)}](#${anchor(t("featuredPrompts", locale))})
- [${t("allPrompts", locale)}](#${anchor(t("allPrompts", locale))})
- [${t("howToContribute", locale)}](#${anchor(t("howToContribute", locale))})
- [${t("license", locale)}](#${anchor(t("license", locale))})
- [${t("acknowledgements", locale)}](#${anchor(t("acknowledgements", locale))})
- [${t("starHistory", locale)}](#${anchor(t("starHistory", locale))})

---

`;
}

function generateWhatIs(locale: string): string {
  return `## ${t("whatIs", locale)}

${t("whatIsIntro", locale)}

- ${t("multimodalUnderstanding", locale)}
- ${t("highQualityGeneration", locale)}
- ${t("fastIteration", locale)}
- ${t("diverseStyles", locale)}
- ${t("preciseControl", locale)}
- ${t("complexScenes", locale)}

${t("learnMore", locale)}

### ${t("raycastIntegration", locale)}

${t("raycastDescription", locale)}

**${t("example", locale)}**
\`\`\`
${t("raycastExample", locale)}
\`\`\`

${t("raycastUsage", locale)}

---

`;
}

function generateContribute(locale: string): string {
  return `## ${t("howToContribute", locale)}

${t("welcomeContributions", locale)}

### ${t("githubIssue", locale)}

1. Click [**${t("submitNewPrompt", locale)}**](https://github.com/${REPO}/issues/new?template=submit-prompt.yml)
2. ${t("fillForm", locale)}
3. ${t("submitWait", locale)}
4. ${t("approvedSync", locale)}
5. ${t("appearInReadme", locale)}

**${t("note", locale)}** ${t("noteContent", locale)}

${t("seeContributing", locale)}

---

`;
}

function generateFooter(locale: string): string {
  const timestamp = new Date().toISOString();

  return `## ${t("license", locale)}

${t("licensedUnder", locale)}

---

## ${t("acknowledgements", locale)}

- [ImagineVid](https://imaginevid.com)
- The creators whose public prompts are attributed in this collection

---

## ${t("starHistory", locale)}

[![Star History Chart](https://api.star-history.com/svg?repos=${REPO}&type=Date)](https://star-history.com/#${REPO}&Date)

---

<div align="center">

**[${t("viewInGallery", locale)}](${REPO_URL})** •
**[${t("submitPrompt", locale)}](https://github.com/${REPO}/issues/new?template=submit-prompt.yml)** •
**[${t("starRepo", locale)}](${REPO_URL})**

<sub>${t("autoGenerated", locale)} ${timestamp}</sub>

</div>
`;
}

function anchor(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}
