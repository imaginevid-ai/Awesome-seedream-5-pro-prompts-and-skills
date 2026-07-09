import { Prompt, FilterCategory, OfficialGallery } from "./cms-client.js";
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
  officialGallery?: OfficialGallery;
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
  { code: "ar-SA", name: "العربية", readmeFileName: "README_ar-SA.md" },
  { code: "bn-BD", name: "বাংলা", readmeFileName: "README_bn-BD.md" },
  { code: "ur-PK", name: "اردو", readmeFileName: "README_ur-PK.md" },
  { code: "id-ID", name: "Bahasa Indonesia", readmeFileName: "README_id-ID.md" },
  { code: "ms-MY", name: "Bahasa Melayu", readmeFileName: "README_ms-MY.md" },
  { code: "ru-RU", name: "Русский", readmeFileName: "README_ru-RU.md" },
  { code: "nl-NL", name: "Nederlands", readmeFileName: "README_nl-NL.md" },
  { code: "pl-PL", name: "Polski", readmeFileName: "README_pl-PL.md" },
  { code: "sv-SE", name: "Svenska", readmeFileName: "README_sv-SE.md" },
  { code: "da-DK", name: "Dansk", readmeFileName: "README_da-DK.md" },
  { code: "nb-NO", name: "Norsk bokmål", readmeFileName: "README_nb-NO.md" },
  { code: "fi-FI", name: "Suomi", readmeFileName: "README_fi-FI.md" },
  { code: "el-GR", name: "Ελληνικά", readmeFileName: "README_el-GR.md" },
  { code: "cs-CZ", name: "Čeština", readmeFileName: "README_cs-CZ.md" },
  { code: "hu-HU", name: "Magyar", readmeFileName: "README_hu-HU.md" },
  { code: "ro-RO", name: "Română", readmeFileName: "README_ro-RO.md" },
  { code: "uk-UA", name: "Українська", readmeFileName: "README_uk-UA.md" },
  { code: "he-IL", name: "עברית", readmeFileName: "README_he-IL.md" },
  { code: "fa-IR", name: "فارسی", readmeFileName: "README_fa-IR.md" },
  { code: "fil-PH", name: "Filipino", readmeFileName: "README_fil-PH.md" },
  { code: "sw-KE", name: "Kiswahili", readmeFileName: "README_sw-KE.md" },
  { code: "ta-IN", name: "தமிழ்", readmeFileName: "README_ta-IN.md" },
  { code: "te-IN", name: "తెలుగు", readmeFileName: "README_te-IN.md" },
  { code: "mr-IN", name: "मराठी", readmeFileName: "README_mr-IN.md" },
  { code: "pa-IN", name: "ਪੰਜਾਬੀ", readmeFileName: "README_pa-IN.md" },
  { code: "gu-IN", name: "ગુજરાતી", readmeFileName: "README_gu-IN.md" },
  { code: "kn-IN", name: "ಕನ್ನಡ", readmeFileName: "README_kn-IN.md" },
  { code: "ml-IN", name: "മലയാളം", readmeFileName: "README_ml-IN.md" },
  { code: "my-MM", name: "မြန်မာ", readmeFileName: "README_my-MM.md" },
  { code: "jv-ID", name: "Basa Jawa", readmeFileName: "README_jv-ID.md" },
];

const MAX_REGULAR_PROMPTS_TO_DISPLAY = 120;
const REPO = "imaginevid-ai/Awesome-seedream-5-pro-prompts-and-skills";
const REPO_URL = `https://github.com/${REPO}`;

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
  md += generateOfficialGallery(data.officialGallery, locale);
  md += generateStats(stats, locale);
  md += generateFeaturedSection(featured, locale);
  md += generateAllPromptsSection(displayedRegular, Math.max(0, hiddenCount), locale);
  md += generateContribute(locale);
  md += generateFooter(locale, data.all);

  return md;
}

function generateHeader(locale: string): string {
  const coverImage = "public/images/imaginevid-prompt-skills-cross-promo.png";

  return `<a href="${REPO_URL}">
  <img src="${coverImage}" alt="ImagineVid Seedream 5 Pro Prompt Skills" width="100%" />
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

  const rows: string[] = [];
  for (let i = 0; i < badges.length; i += 10) {
    rows.push(badges.slice(i, i + 10).join(" "));
  }

  return `${rows.join("\n")}\n\n---\n\n`;
}

function generateCollectionCTA(categories: FilterCategory[], locale: string): string {
  let md = `## ${t("viewInGallery", locale)}

**[${t("browseGallery", locale)}](${REPO_URL})**

${t("galleryFeatures", locale)}

| ${t("feature", locale)} | ${t("githubReadme", locale)} | ${t("collection", locale)} |
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

  if (prompt.promptVariants?.length) {
    md += generatePromptVariants(prompt.promptVariants, locale);
  }

  if (prompt.sourceMedia && prompt.sourceMedia.length > 0) {
    md += `#### ${t("generatedImages", locale)}\n\n`;
    md += generateMediaTable(prompt.sourceMedia, prompt.title);
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
- [${officialGalleryCopy(locale).title}](#official-capability-gallery)
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

export function generateMediaTable(images: string[], title: string): string {
  const rows: string[] = [];

  for (let index = 0; index < images.length; index += 4) {
    const row = images.slice(index, index + 4);
    const cellWidth = `${Math.floor(100 / row.length)}%`;
    const cells = row
      .map((imageUrl, rowIndex) => {
        const imageNumber = index + rowIndex + 1;
        return `<td width="${cellWidth}" valign="top" align="center"><img src="${escapeAttribute(imageUrl)}" width="100%" alt="${escapeAttribute(title)} - Image ${imageNumber}"></td>`;
      })
      .join("\n");
    rows.push(`<tr>\n${cells}\n</tr>`);
  }

  return `<table>\n${rows.join("\n")}\n</table>\n\n`;
}

function generatePromptVariants(
  variants: NonNullable<Prompt["promptVariants"]>,
  locale: string
): string {
  const copy = promptVariantCopy(locale);
  let md = `<details>\n<summary>${copy.summary} (${variants.length})</summary>\n\n`;

  for (const variant of variants) {
    if (variant.title) md += `**${variant.title}**\n\n`;
    md += `\`\`\`\n${cleanPromptContent(variant.content)}\n\`\`\`\n\n`;
    if (variant.author?.name) {
      md += `${copy.author}: ${variant.author.link ? `[${variant.author.name}](${variant.author.link})` : variant.author.name}\n\n`;
    }
    if (variant.sourceLink) {
      md += `${copy.source}: [${copy.source}](${variant.sourceLink})\n\n`;
    }
  }

  return `${md}</details>\n\n`;
}

function promptVariantCopy(locale: string): {
  summary: string;
  author: string;
  source: string;
} {
  if (locale === "zh") return { summary: "相关提示词变体", author: "作者", source: "来源" };
  if (locale === "zh-TW") return { summary: "相關提示詞變體", author: "作者", source: "來源" };
  if (locale === "ja-JP") {
    return { summary: "関連プロンプトのバリエーション", author: "作者", source: "出典" };
  }
  if (locale === "ko-KR") {
    return { summary: "관련 프롬프트 변형", author: "작성자", source: "출처" };
  }
  return { summary: "Related prompt variants", author: "Author", source: "Source" };
}

function generateOfficialGallery(
  gallery: OfficialGallery | undefined,
  locale: string
): string {
  if (!gallery || gallery.cases.length === 0) return "";
  const copy = officialGalleryCopy(locale);
  let md = `<a id="official-capability-gallery"></a>\n\n## ${copy.title}\n\n`;
  md += `${copy.intro} [Evolink-AI/awesome-seedream-5-pro-guide-and-prompt](${gallery.sourceRepo}) (${gallery.sourceLicense}).\n\n`;

  for (const [categoryIndex, category] of gallery.categories.entries()) {
    const cases = gallery.cases.filter((item) => item.category === category.id);
    if (cases.length === 0) continue;
    const categoryTitle =
      locale === "en" ? category.title : `${copy.sectionLabel} ${categoryIndex + 1}`;
    md += `### ${category.emoji} ${categoryTitle}\n\n`;
    if (locale === "en") md += `${category.desc}\n\n`;
    md += "<table>\n";

    for (let index = 0; index < cases.length; index += 2) {
      const row = cases.slice(index, index + 2);
      md += "<tr>\n";
      for (const item of row) {
        md += '<td width="50%" valign="top">\n\n';
        md += `<strong>${locale === "en" ? `Case ${item.number}: ${item.title}` : `#${item.number}`}</strong><br><br>\n`;
        item.media.forEach((mediaUrl, mediaIndex) => {
          if (locale === "en" && item.mediaLabels?.[mediaIndex]) {
            md += `<strong>${item.mediaLabels[mediaIndex]}</strong><br>\n`;
          }
          md += `<img src="${escapeAttribute(mediaUrl)}" width="${item.media.length > 1 ? "48%" : "100%"}" alt="${escapeAttribute(item.title)} ${mediaIndex + 1}">\n`;
        });
        if (item.prompt) {
          md += `\n<details>\n<summary>${copy.promptLabel}</summary>\n\n\`\`\`\n${item.prompt}\n\`\`\`\n\n</details>\n`;
        }
        md += "\n</td>\n";
      }
      if (row.length === 1) md += '<td width="50%"></td>\n';
      md += "</tr>\n";
    }

    md += "</table>\n\n";
  }

  return `${md}---\n\n`;
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

function generateFooter(locale: string, prompts: Prompt[]): string {
  const timestamp = new Date().toISOString();
  const creatorCredits = generateCreatorCredits(prompts, locale);

  return `## ${t("license", locale)}

${t("licensedUnder", locale)}

---

## ${t("acknowledgements", locale)}

- [ImagineVid](https://imaginevid.com)
- [Evolink-AI/awesome-seedream-5-pro-guide-and-prompt](https://github.com/Evolink-AI/awesome-seedream-5-pro-guide-and-prompt) - selected prompt references and official capability media under CC BY 4.0. We modified the source material by completing prompt excerpts from original posts, preserving source prompts as variants, rewriting collection descriptions, merging visual duplicates, and adapting the table layout.
- The creators whose public prompts are attributed in this collection

${creatorCredits}

---

## ${t("starHistory", locale)}

[![GitHub stars](https://img.shields.io/github/stars/${REPO}?style=for-the-badge&logo=github&label=GitHub%20Stars)](${REPO_URL}/stargazers)

**[${t("starHistory", locale)}](https://star-history.com/#${REPO}&Date)**

---

<div align="center">

**[${t("viewInGallery", locale)}](${REPO_URL})** •
**[${t("submitPrompt", locale)}](https://github.com/${REPO}/issues/new?template=submit-prompt.yml)** •
**[${t("starRepo", locale)}](${REPO_URL})**

<sub>${t("autoGenerated", locale)} ${timestamp}</sub>

</div>
`;
}

function generateCreatorCredits(prompts: Prompt[], locale: string): string {
  const copy = officialGalleryCopy(locale);
  const attributedCreators = prompts.flatMap((prompt) => [
    prompt.author,
    ...(prompt.promptVariants || []).map((variant) => variant.author).filter(Boolean),
  ]);
  const creators = [
    ...new Map(
      attributedCreators
        .filter((author) => author?.name && author.link)
        .map((author) => [author!.link, author!])
    ).values(),
  ].sort((left, right) => left.name.localeCompare(right.name));
  const rows: string[] = [];

  for (let index = 0; index < creators.length; index += 8) {
    rows.push(
      creators
        .slice(index, index + 8)
        .map((creator) => `[${creator.name}](${creator.link})`)
        .join(" · ")
    );
  }

  return `<details>\n<summary>${copy.creatorSummary} (${creators.length})</summary>\n\n${rows.join("<br>\n")}\n\n</details>`;
}

function officialGalleryCopy(locale: string): {
  title: string;
  intro: string;
  promptLabel: string;
  creatorSummary: string;
  sectionLabel: string;
} {
  type Copy = {
    title: string;
    intro: string;
    promptLabel: string;
    creatorSummary: string;
    sectionLabel: string;
  };
  const copies: Record<string, Copy> = {
    en: { title: "Official Capability Gallery", intro: "These cases document the official Seedream 5 Pro capability baseline with source and license attribution:", promptLabel: "View prompt", creatorSummary: "Community creators we thank", sectionLabel: "Capability group" },
    zh: { title: "官方能力案例图库", intro: "以下案例展示 Seedream 5 Pro 的官方能力基线，并注明来源与许可：", promptLabel: "查看提示词", creatorSummary: "查看并感谢社区作者", sectionLabel: "能力分组" },
    "zh-TW": { title: "官方能力案例圖庫", intro: "以下案例展示 Seedream 5 Pro 的官方能力基準，並標註來源與授權：", promptLabel: "查看提示詞", creatorSummary: "查看並感謝社群作者", sectionLabel: "能力分組" },
    "ja-JP": { title: "公式機能ギャラリー", intro: "以下は出典とライセンスを明記した Seedream 5 Pro の公式機能事例です：", promptLabel: "プロンプトを表示", creatorSummary: "コミュニティ作者への謝辞", sectionLabel: "機能グループ" },
    "ko-KR": { title: "공식 기능 갤러리", intro: "다음은 출처와 라이선스를 명시한 Seedream 5 Pro 공식 기능 사례입니다:", promptLabel: "프롬프트 보기", creatorSummary: "커뮤니티 제작자 감사 명단", sectionLabel: "기능 그룹" },
    "th-TH": { title: "แกลเลอรีความสามารถอย่างเป็นทางการ", intro: "กรณีต่อไปนี้แสดงความสามารถอย่างเป็นทางการของ Seedream 5 Pro พร้อมแหล่งที่มาและสัญญาอนุญาต:", promptLabel: "ดูพรอมต์", creatorSummary: "ขอบคุณผู้สร้างจากชุมชน", sectionLabel: "กลุ่มความสามารถ" },
    "vi-VN": { title: "Thư viện năng lực chính thức", intro: "Các trường hợp sau minh họa năng lực chính thức của Seedream 5 Pro kèm nguồn và giấy phép:", promptLabel: "Xem câu lệnh", creatorSummary: "Các tác giả cộng đồng", sectionLabel: "Nhóm năng lực" },
    "hi-IN": { title: "आधिकारिक क्षमता गैलरी", intro: "ये उदाहरण स्रोत और लाइसेंस सहित Seedream 5 Pro की आधिकारिक क्षमताएं दिखाते हैं:", promptLabel: "प्रॉम्प्ट देखें", creatorSummary: "समुदाय के रचनाकारों का आभार", sectionLabel: "क्षमता समूह" },
    "es-ES": { title: "Galería oficial de capacidades", intro: "Estos casos muestran las capacidades oficiales de Seedream 5 Pro con fuente y licencia:", promptLabel: "Ver prompt", creatorSummary: "Autores de la comunidad", sectionLabel: "Grupo de capacidades" },
    "es-419": { title: "Galería oficial de capacidades", intro: "Estos casos muestran las capacidades oficiales de Seedream 5 Pro con fuente y licencia:", promptLabel: "Ver prompt", creatorSummary: "Creadores de la comunidad", sectionLabel: "Grupo de capacidades" },
    "de-DE": { title: "Offizielle Funktionsgalerie", intro: "Diese Beispiele zeigen offizielle Seedream-5-Pro-Funktionen mit Quellen- und Lizenzangabe:", promptLabel: "Prompt anzeigen", creatorSummary: "Community-Autoren", sectionLabel: "Funktionsgruppe" },
    "fr-FR": { title: "Galerie officielle des fonctionnalités", intro: "Ces exemples présentent les fonctions officielles de Seedream 5 Pro avec leur source et leur licence :", promptLabel: "Afficher le prompt", creatorSummary: "Auteurs de la communauté", sectionLabel: "Groupe de fonctions" },
    "it-IT": { title: "Galleria ufficiale delle funzionalità", intro: "Questi casi mostrano le funzionalità ufficiali di Seedream 5 Pro con fonte e licenza:", promptLabel: "Mostra prompt", creatorSummary: "Autori della community", sectionLabel: "Gruppo di funzionalità" },
    "pt-BR": { title: "Galeria oficial de recursos", intro: "Estes casos mostram os recursos oficiais do Seedream 5 Pro com fonte e licença:", promptLabel: "Ver prompt", creatorSummary: "Criadores da comunidade", sectionLabel: "Grupo de recursos" },
    "pt-PT": { title: "Galeria oficial de funcionalidades", intro: "Estes casos mostram as funcionalidades oficiais do Seedream 5 Pro com fonte e licença:", promptLabel: "Ver prompt", creatorSummary: "Autores da comunidade", sectionLabel: "Grupo de funcionalidades" },
    "tr-TR": { title: "Resmi yetenek galerisi", intro: "Bu örnekler Seedream 5 Pro'nun resmi yeteneklerini kaynak ve lisans bilgileriyle gösterir:", promptLabel: "İstemi görüntüle", creatorSummary: "Topluluk üreticileri", sectionLabel: "Yetenek grubu" },
    "ar-SA": { title: "معرض الإمكانات الرسمية", intro: "توضح هذه الحالات إمكانات Seedream 5 Pro الرسمية مع ذكر المصدر والترخيص:", promptLabel: "عرض الموجه", creatorSummary: "مبدعو المجتمع الذين نشكرهم", sectionLabel: "مجموعة الإمكانات" },
    "bn-BD": { title: "অফিশিয়াল সক্ষমতা গ্যালারি", intro: "এই উদাহরণগুলো উৎস ও লাইসেন্সসহ Seedream 5 Pro-এর অফিশিয়াল সক্ষমতা দেখায়:", promptLabel: "প্রম্পট দেখুন", creatorSummary: "কমিউনিটি নির্মাতাদের প্রতি কৃতজ্ঞতা", sectionLabel: "সক্ষমতা বিভাগ" },
    "ur-PK": { title: "سرکاری صلاحیتوں کی گیلری", intro: "یہ مثالیں ماخذ اور لائسنس کے ساتھ Seedream 5 Pro کی سرکاری صلاحیتیں دکھاتی ہیں:", promptLabel: "پرامپٹ دیکھیں", creatorSummary: "کمیونٹی تخلیق کاروں کا شکریہ", sectionLabel: "صلاحیتوں کا گروپ" },
    "id-ID": { title: "Galeri kemampuan resmi", intro: "Contoh berikut menampilkan kemampuan resmi Seedream 5 Pro beserta sumber dan lisensinya:", promptLabel: "Lihat prompt", creatorSummary: "Kreator komunitas yang kami hargai", sectionLabel: "Kelompok kemampuan" },
    "ms-MY": { title: "Galeri keupayaan rasmi", intro: "Contoh berikut menunjukkan keupayaan rasmi Seedream 5 Pro berserta sumber dan lesen:", promptLabel: "Lihat prompt", creatorSummary: "Pengkarya komuniti yang kami hargai", sectionLabel: "Kumpulan keupayaan" },
    "ru-RU": { title: "Галерея официальных возможностей", intro: "Эти примеры показывают официальные возможности Seedream 5 Pro с указанием источника и лицензии:", promptLabel: "Показать промпт", creatorSummary: "Авторы сообщества", sectionLabel: "Группа возможностей" },
    "nl-NL": { title: "Officiële functiegallerij", intro: "Deze voorbeelden tonen officiële Seedream 5 Pro-functies met bron- en licentievermelding:", promptLabel: "Prompt bekijken", creatorSummary: "Makers uit de community", sectionLabel: "Functiegroep" },
    "pl-PL": { title: "Galeria oficjalnych możliwości", intro: "Te przykłady pokazują oficjalne możliwości Seedream 5 Pro wraz ze źródłem i licencją:", promptLabel: "Pokaż prompt", creatorSummary: "Twórcy społeczności", sectionLabel: "Grupa możliwości" },
    "sv-SE": { title: "Officiellt funktionsgalleri", intro: "Exemplen visar officiella Seedream 5 Pro-funktioner med källa och licens:", promptLabel: "Visa prompt", creatorSummary: "Kreatörer i communityn", sectionLabel: "Funktionsgrupp" },
    "da-DK": { title: "Officielt funktionsgalleri", intro: "Eksemplerne viser officielle Seedream 5 Pro-funktioner med kilde og licens:", promptLabel: "Vis prompt", creatorSummary: "Skabere fra fællesskabet", sectionLabel: "Funktionsgruppe" },
    "nb-NO": { title: "Offisielt funksjonsgalleri", intro: "Eksemplene viser offisielle Seedream 5 Pro-funksjoner med kilde og lisens:", promptLabel: "Vis prompt", creatorSummary: "Skapere i fellesskapet", sectionLabel: "Funksjonsgruppe" },
    "fi-FI": { title: "Virallinen ominaisuusgalleria", intro: "Esimerkit näyttävät Seedream 5 Pron viralliset ominaisuudet lähde- ja lisenssitietoineen:", promptLabel: "Näytä kehote", creatorSummary: "Yhteisön tekijät", sectionLabel: "Ominaisuusryhmä" },
    "el-GR": { title: "Επίσημη συλλογή δυνατοτήτων", intro: "Τα παραδείγματα παρουσιάζουν τις επίσημες δυνατότητες του Seedream 5 Pro με πηγή και άδεια:", promptLabel: "Προβολή προτροπής", creatorSummary: "Δημιουργοί της κοινότητας", sectionLabel: "Ομάδα δυνατοτήτων" },
    "cs-CZ": { title: "Galerie oficiálních funkcí", intro: "Tyto příklady ukazují oficiální funkce Seedream 5 Pro včetně zdroje a licence:", promptLabel: "Zobrazit prompt", creatorSummary: "Tvůrci z komunity", sectionLabel: "Skupina funkcí" },
    "hu-HU": { title: "Hivatalos képességgaléria", intro: "A példák a Seedream 5 Pro hivatalos képességeit mutatják be forrás- és licencmegjelöléssel:", promptLabel: "Prompt megtekintése", creatorSummary: "Közösségi alkotók", sectionLabel: "Képességcsoport" },
    "ro-RO": { title: "Galerie oficială de capabilități", intro: "Aceste exemple prezintă capabilitățile oficiale Seedream 5 Pro, cu sursă și licență:", promptLabel: "Vezi promptul", creatorSummary: "Creatorii comunității", sectionLabel: "Grup de capabilități" },
    "uk-UA": { title: "Галерея офіційних можливостей", intro: "Ці приклади показують офіційні можливості Seedream 5 Pro із зазначенням джерела та ліцензії:", promptLabel: "Показати промпт", creatorSummary: "Автори спільноти", sectionLabel: "Група можливостей" },
    "he-IL": { title: "גלריית יכולות רשמית", intro: "הדוגמאות מציגות את היכולות הרשמיות של Seedream 5 Pro בציון מקור ורישיון:", promptLabel: "הצגת הפרומפט", creatorSummary: "יוצרי הקהילה", sectionLabel: "קבוצת יכולות" },
    "fa-IR": { title: "گالری قابلیت‌های رسمی", intro: "این نمونه‌ها قابلیت‌های رسمی Seedream 5 Pro را همراه با منبع و مجوز نشان می‌دهند:", promptLabel: "نمایش پرامپت", creatorSummary: "سازندگان جامعه", sectionLabel: "گروه قابلیت‌ها" },
    "fil-PH": { title: "Opisyal na gallery ng kakayahan", intro: "Ipinapakita ng mga halimbawang ito ang opisyal na kakayahan ng Seedream 5 Pro kasama ang pinagmulan at lisensya:", promptLabel: "Tingnan ang prompt", creatorSummary: "Mga creator ng komunidad", sectionLabel: "Pangkat ng kakayahan" },
    "sw-KE": { title: "Matunzio rasmi ya uwezo", intro: "Mifano hii inaonyesha uwezo rasmi wa Seedream 5 Pro pamoja na chanzo na leseni:", promptLabel: "Tazama prompti", creatorSummary: "Wabunifu wa jumuiya", sectionLabel: "Kikundi cha uwezo" },
    "ta-IN": { title: "அதிகாரப்பூர்வ திறன் காட்சியகம்", intro: "இந்த எடுத்துக்காட்டுகள் மூலம் மற்றும் உரிமத்துடன் Seedream 5 Pro-வின் அதிகாரப்பூர்வ திறன்களைக் காட்டுகின்றன:", promptLabel: "ப்ராம்ப்டைக் காண்க", creatorSummary: "சமூக படைப்பாளர்களுக்கு நன்றி", sectionLabel: "திறன் குழு" },
    "te-IN": { title: "అధికారిక సామర్థ్య గ్యాలరీ", intro: "ఈ ఉదాహరణలు మూలం మరియు లైసెన్స్‌తో Seedream 5 Pro అధికారిక సామర్థ్యాలను చూపిస్తాయి:", promptLabel: "ప్రాంప్ట్ చూడండి", creatorSummary: "కమ్యూనిటీ సృష్టికర్తలకు కృతజ్ఞతలు", sectionLabel: "సామర్థ్య సమూహం" },
    "mr-IN": { title: "अधिकृत क्षमता गॅलरी", intro: "ही उदाहरणे स्रोत आणि परवान्यासह Seedream 5 Pro ची अधिकृत क्षमता दाखवतात:", promptLabel: "प्रॉम्प्ट पहा", creatorSummary: "समुदाय निर्मात्यांचे आभार", sectionLabel: "क्षमता गट" },
    "pa-IN": { title: "ਅਧਿਕਾਰਤ ਸਮਰੱਥਾ ਗੈਲਰੀ", intro: "ਇਹ ਉਦਾਹਰਨਾਂ ਸਰੋਤ ਅਤੇ ਲਾਇਸੈਂਸ ਸਮੇਤ Seedream 5 Pro ਦੀਆਂ ਅਧਿਕਾਰਤ ਸਮਰੱਥਾਵਾਂ ਦਿਖਾਉਂਦੀਆਂ ਹਨ:", promptLabel: "ਪ੍ਰਾਮਪਟ ਵੇਖੋ", creatorSummary: "ਕਮਿਊਨਿਟੀ ਰਚਨਾਕਾਰਾਂ ਦਾ ਧੰਨਵਾਦ", sectionLabel: "ਸਮਰੱਥਾ ਸਮੂਹ" },
    "gu-IN": { title: "સત્તાવાર ક્ષમતા ગેલેરી", intro: "આ ઉદાહરણો સ્રોત અને લાઇસન્સ સાથે Seedream 5 Pro ની સત્તાવાર ક્ષમતાઓ દર્શાવે છે:", promptLabel: "પ્રોમ્પ્ટ જુઓ", creatorSummary: "સમુદાય સર્જકોનો આભાર", sectionLabel: "ક્ષમતા જૂથ" },
    "kn-IN": { title: "ಅಧಿಕೃತ ಸಾಮರ್ಥ್ಯ ಗ್ಯಾಲರಿ", intro: "ಈ ಉದಾಹರಣೆಗಳು ಮೂಲ ಮತ್ತು ಪರವಾನಗಿಯೊಂದಿಗೆ Seedream 5 Pro ಅಧಿಕೃತ ಸಾಮರ್ಥ್ಯಗಳನ್ನು ತೋರಿಸುತ್ತವೆ:", promptLabel: "ಪ್ರಾಂಪ್ಟ್ ನೋಡಿ", creatorSummary: "ಸಮುದಾಯ ರಚಯಿತರಿಗೆ ಧನ್ಯವಾದ", sectionLabel: "ಸಾಮರ್ಥ್ಯ ಗುಂಪು" },
    "ml-IN": { title: "ഔദ്യോഗിക ശേഷി ഗാലറി", intro: "ഈ ഉദാഹരണങ്ങൾ ഉറവിടവും ലൈസൻസും സഹിതം Seedream 5 Pro-യുടെ ഔദ്യോഗിക ശേഷികൾ കാണിക്കുന്നു:", promptLabel: "പ്രോംപ്റ്റ് കാണുക", creatorSummary: "കമ്മ്യൂണിറ്റി സ്രഷ്ടാക്കൾക്ക് നന്ദി", sectionLabel: "ശേഷി വിഭാഗം" },
    "my-MM": { title: "တရားဝင် စွမ်းရည်ပြခန်း", intro: "ဤနမူနာများသည် ရင်းမြစ်နှင့် လိုင်စင်အချက်အလက်ပါဝင်သော Seedream 5 Pro ၏ တရားဝင်စွမ်းရည်များကို ပြသသည်:", promptLabel: "ပရောမ့်ကို ကြည့်ရန်", creatorSummary: "အသိုင်းအဝိုင်း ဖန်တီးသူများအား ကျေးဇူးတင်ပါသည်", sectionLabel: "စွမ်းရည်အုပ်စု" },
    "jv-ID": { title: "Galeri kemampuan resmi", intro: "Tuladha iki nuduhake kemampuan resmi Seedream 5 Pro kanthi sumber lan lisensi:", promptLabel: "Deleng prompt", creatorSummary: "Pangripta komunitas", sectionLabel: "Klompok kemampuan" },
  };
  return copies[locale] || copies.en;
}

function escapeAttribute(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function anchor(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}
