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

export interface WorkflowPromptGroup {
  category: FilterCategory;
  prompts: Prompt[];
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
const SEEDREAM_PRODUCT_URL = "https://imaginevid.io/seedream-5-pro";
const IMAGINEVID_LOCALE_BY_README: Record<string, string> = {
  "ar-SA": "ar",
  "de-DE": "de",
  "es-419": "es",
  "es-ES": "es",
  "fr-FR": "fr",
  "it-IT": "it",
  "ja-JP": "ja",
  "ko-KR": "ko",
  "nl-NL": "nl",
  "pl-PL": "pl",
  "pt-BR": "pt",
  "pt-PT": "pt",
  "ru-RU": "ru",
  "tr-TR": "tr",
  zh: "zh",
  "zh-TW": "zh",
};

export function getSeedreamProductUrl(locale: string): string {
  const productLocale = IMAGINEVID_LOCALE_BY_README[locale];
  return productLocale
    ? `https://imaginevid.io/${productLocale}/seedream-5-pro`
    : SEEDREAM_PRODUCT_URL;
}

export function getPromptCtaLabel(locale: string): string {
  return locale === "en" ? "Use this prompt on ImagineVid" : `${t("tryItNow", locale)} · ImagineVid`;
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
  md += generateModelIntroduction(locale);
  md += generateStats(stats, locale);
  md += generateFeaturedSection(featured, locale);
  md += generateAllPromptsSection(
    [...featured, ...displayedRegular],
    Math.max(0, hiddenCount),
    categories || [],
    locale
  );
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

**[${t("browseGallery", locale)}](${getSeedreamProductUrl(locale)})**

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
  const workflowCategories = categories
    .filter((category) => category.parentSlug === "workflow-groups")
    .sort((left, right) => (left.sort || 0) - (right.sort || 0));
  let md = `\n### ${t("browseByCategory", locale)}\n\n`;

  for (const category of workflowCategories) {
    md += `- [**${category.title}**](#workflow-${category.slug}) - ${workflowDescription(category.slug, locale)}\n`;
  }

  return `${md}\n`;
}

export function groupPromptsByWorkflow(
  prompts: Prompt[],
  categories: FilterCategory[]
): WorkflowPromptGroup[] {
  return categories
    .filter((category) => category.parentSlug === "workflow-groups")
    .sort((left, right) => (left.sort || 0) - (right.sort || 0))
    .map((category) => ({
      category,
      prompts: prompts.filter((prompt) =>
        prompt.imageCategories?.workflows?.some((workflow) => workflow.slug === category.slug)
      ),
    }))
    .filter((group) => group.prompts.length > 0);
}

function generatePromptSection(
  prompt: Prompt,
  index: number,
  locale: string,
  headingLevel = 3
): string {
  const authorLink = prompt.author.link || "#";
  const publishedDate = new Date(prompt.sourcePublishedAt).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
  const rawContent = prompt.translatedContent || prompt.content;
  const promptContent = cleanPromptContent(rawContent);
  const hasArguments = promptContent.includes("{argument");

  const heading = "#".repeat(headingLevel);
  const detailHeading = "#".repeat(headingLevel + 1);
  let md = `<a id="prompt-${prompt.id}"></a>\n\n${heading} No. ${index + 1}: ${prompt.title}\n\n`;
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

  md += `\n${detailHeading} ${t("description", locale)}\n\n${prompt.description}\n\n`;
  md += `${detailHeading} ${t("prompt", locale)}\n\n\`\`\`\n${promptContent}\n\`\`\`\n\n`;

  if (prompt.promptVariants?.length) {
    md += generatePromptVariants(prompt.promptVariants, locale);
  }

  if (prompt.sourceMedia && prompt.sourceMedia.length > 0) {
    if (prompt.video?.url) {
      md += generateAnimationPreview(
        prompt.animationPreview || prompt.video.thumbnail || "",
        prompt.title,
        prompt.video.url
      );
    } else {
      md += `${detailHeading} ${t("generatedImages", locale)}\n\n`;
      md += generateMediaTable(prompt.sourceMedia, prompt.title);
      if (prompt.animationPreview) {
        md += generateAnimationPreview(prompt.animationPreview, prompt.title);
      }
    }
  } else if (prompt.animationPreview) {
    md += generateAnimationPreview(prompt.animationPreview, prompt.title);
  }

  md += `${detailHeading} ${t("details", locale)}\n\n`;
  md += `- **${t("author", locale)}:** [${prompt.author.name}](${authorLink})\n`;
  if (prompt.sourceLink) {
    md += `- **${t("source", locale)}:** [${t("source", locale)}](${prompt.sourceLink})\n`;
  }
  md += `- **${t("published", locale)}:** ${publishedDate}\n`;
  md += `- **${t("languages", locale)}:** ${prompt.language}\n\n`;
  md += `**[${getPromptCtaLabel(locale)}](${getSeedreamProductUrl(locale)})**\n\n`;
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

function generateAllPromptsSection(
  categorizedPrompts: Prompt[],
  hiddenCount: number,
  categories: FilterCategory[],
  locale: string
): string {
  if (categorizedPrompts.length === 0 && hiddenCount === 0) return "";
  let md = `## ${t("allPrompts", locale)}\n\n`;
  md += `> ${t("sortedByDate", locale)}\n\n`;
  const groups = groupPromptsByWorkflow(categorizedPrompts, categories);
  let promptIndex = 0;

  for (const group of groups) {
    md += `<a id="workflow-${group.category.slug}"></a>\n\n`;
    md += `### ${group.category.title} (${group.prompts.length})\n\n`;
    md += `${workflowDescription(group.category.slug, locale)}\n\n`;
    const featuredPrompts = group.prompts.filter((prompt) => prompt.featured);
    if (featuredPrompts.length > 0) {
      md += `**${t("featuredPrompts", locale)}**\n\n`;
      for (const prompt of featuredPrompts) {
        md += `- [${prompt.title}](#prompt-${prompt.id})\n`;
      }
      md += "\n";
    }
    for (const prompt of group.prompts.filter((item) => !item.featured)) {
      md += generatePromptSection(prompt, promptIndex, locale, 4);
      promptIndex += 1;
    }
  }

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

function workflowDescription(slug: string, locale: string): string {
  const descriptions: Record<string, Record<string, string>> = {
    "directed-editing-input-control": {
      en: "Prompts that modify an existing image or use regions, sketches, references, and positional instructions to control the result.",
      zh: "通过现有图片、区域、草图、参考图或位置指令，对结果进行定向控制与修改。",
      "zh-TW": "透過現有圖片、區域、草圖、參考圖或位置指令，對結果進行定向控制與修改。",
    },
    "commercial-design-ui-posters": {
      en: "Production briefs for advertisements, product campaigns, interfaces, posters, typography, and other designed assets.",
      zh: "面向广告、产品营销、界面、海报、文字排版及其他设计资产的生产型提示词。",
      "zh-TW": "面向廣告、產品行銷、介面、海報、文字排版及其他設計資產的製作型提示詞。",
    },
    "diagrams-technical-storyboards": {
      en: "Structured visuals where information order matters: diagrams, technical drawings, multi-panel sequences, and storyboards.",
      zh: "强调信息结构与顺序的视觉任务，包括图表、技术图纸、多格序列和分镜。",
      "zh-TW": "強調資訊結構與順序的視覺任務，包括圖表、技術圖紙、多格序列和分鏡。",
    },
    "characters-cinema-visual-styles": {
      en: "Character, portrait, fashion, cinematic-frame, and style-exploration prompts centered on visual direction and image language.",
      zh: "以视觉方向和画面语言为核心的角色、肖像、时尚、电影画面与风格探索提示词。",
      "zh-TW": "以視覺方向和畫面語言為核心的角色、肖像、時尚、電影畫面與風格探索提示詞。",
    },
    "environments-architecture-worldbuilding": {
      en: "Environment, architecture, landscape, concept-art, and worldbuilding prompts where the place itself carries the idea.",
      zh: "以环境本身承载创意的建筑、景观、概念艺术和世界构建提示词。",
      "zh-TW": "以環境本身承載創意的建築、景觀、概念藝術和世界構建提示詞。",
    },
    "benchmarks-model-comparisons": {
      en: "Controlled tests and comparisons used to evaluate prompt following, editing behavior, consistency, typography, or visual quality.",
      zh: "用于评估提示词遵循、编辑行为、一致性、文字渲染或视觉质量的受控测试与模型对比。",
      "zh-TW": "用於評估提示詞遵循、編輯行為、一致性、文字渲染或視覺品質的受控測試與模型比較。",
    },
  };
  const copy = descriptions[slug];
  return copy?.[locale] || copy?.en || "";
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

export function generateAnimationPreview(
  url: string,
  title: string,
  sourceUrl?: string
): string {
  const image = `<img src="${escapeAttribute(url)}" height="420" alt="${escapeAttribute(title)} - Motion preview">`;
  const content = sourceUrl ? `<a href="${escapeAttribute(sourceUrl)}">${image}</a>` : image;
  return `<div align="center">\n${content}\n</div>\n\n`;
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

export function generateModelIntroduction(locale: string): string {
  const contentLocale = locale === "zh" || locale === "zh-TW" ? locale : "en";
  const sourceLabel =
    locale === "zh"
      ? "ImagineVid 资源"
      : locale === "zh-TW"
        ? "ImagineVid 資源"
        : locale === "ja-JP"
          ? "ImagineVid リソース"
          : locale === "ko-KR"
            ? "ImagineVid 자료"
            : "ImagineVid resources";

  return `## ${t("whatIs", locale)}

${t("whatIsIntro", contentLocale)}

- ${t("multimodalUnderstanding", contentLocale)}
- ${t("highQualityGeneration", contentLocale)}
- ${t("fastIteration", contentLocale)}
- ${t("diverseStyles", contentLocale)}
- ${t("preciseControl", contentLocale)}
- ${t("complexScenes", contentLocale)}

**${sourceLabel}:** [Seedream 5 Pro on ImagineVid](${getSeedreamProductUrl(locale)}) · [Best Dreamina alternatives](https://imaginevid.io/blog/best-dreamina-alternatives)

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

- [ImagineVid](https://imaginevid.io)
${creatorCredits}

---

## ${t("starHistory", locale)}

[![GitHub stars](https://img.shields.io/github/stars/${REPO}?style=for-the-badge&logo=github&label=GitHub%20Stars)](${REPO_URL}/stargazers)

**[${t("starHistory", locale)}](https://star-history.com/#${REPO}&Date)**

---

<div align="center">

**[${t("viewInGallery", locale)}](${getSeedreamProductUrl(locale)})** •
**[${t("submitPrompt", locale)}](https://github.com/${REPO}/issues/new?template=submit-prompt.yml)** •
**[${t("starRepo", locale)}](${REPO_URL})**

<sub>${t("autoGenerated", locale)} ${timestamp}</sub>

</div>
`;
}

function generateCreatorCredits(prompts: Prompt[], locale: string): string {
  const summary = creatorSummary(locale);
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

  return `<details>\n<summary>${summary} (${creators.length})</summary>\n\n${rows.join("<br>\n")}\n\n</details>`;
}

function creatorSummary(locale: string): string {
  const copies: Record<string, string> = {
    "en": "Community creators we thank",
    "zh": "查看并感谢社区作者",
    "zh-TW": "查看並感謝社群作者",
    "ja-JP": "コミュニティ作者への謝辞",
    "ko-KR": "커뮤니티 제작자 감사 명단",
    "th-TH": "ขอบคุณผู้สร้างจากชุมชน",
    "vi-VN": "Các tác giả cộng đồng",
    "hi-IN": "समुदाय के रचनाकारों का आभार",
    "es-ES": "Autores de la comunidad",
    "es-419": "Creadores de la comunidad",
    "de-DE": "Community-Autoren",
    "fr-FR": "Auteurs de la communauté",
    "it-IT": "Autori della community",
    "pt-BR": "Criadores da comunidade",
    "pt-PT": "Autores da comunidade",
    "tr-TR": "Topluluk üreticileri",
    "ar-SA": "مبدعو المجتمع الذين نشكرهم",
    "bn-BD": "কমিউনিটি নির্মাতাদের প্রতি কৃতজ্ঞতা",
    "ur-PK": "کمیونٹی تخلیق کاروں کا شکریہ",
    "id-ID": "Kreator komunitas yang kami hargai",
    "ms-MY": "Pengkarya komuniti yang kami hargai",
    "ru-RU": "Авторы сообщества",
    "nl-NL": "Makers uit de community",
    "pl-PL": "Twórcy społeczności",
    "sv-SE": "Kreatörer i communityn",
    "da-DK": "Skabere fra fællesskabet",
    "nb-NO": "Skapere i fellesskapet",
    "fi-FI": "Yhteisön tekijät",
    "el-GR": "Δημιουργοί της κοινότητας",
    "cs-CZ": "Tvůrci z komunity",
    "hu-HU": "Közösségi alkotók",
    "ro-RO": "Creatorii comunității",
    "uk-UA": "Автори спільноти",
    "he-IL": "יוצרי הקהילה",
    "fa-IR": "سازندگان جامعه",
    "fil-PH": "Mga creator ng komunidad",
    "sw-KE": "Wabunifu wa jumuiya",
    "ta-IN": "சமூக படைப்பாளர்களுக்கு நன்றி",
    "te-IN": "కమ్యూనిటీ సృష్టికర్తలకు కృతజ్ఞతలు",
    "mr-IN": "समुदाय निर्मात्यांचे आभार",
    "pa-IN": "ਕਮਿਊਨਿਟੀ ਰਚਨਾਕਾਰਾਂ ਦਾ ਧੰਨਵਾਦ",
    "gu-IN": "સમુદાય સર્જકોનો આભાર",
    "kn-IN": "ಸಮುದಾಯ ರಚಯಿತರಿಗೆ ಧನ್ಯವಾದ",
    "ml-IN": "കമ്മ്യൂണിറ്റി സ്രഷ്ടാക്കൾക്ക് നന്ദി",
    "my-MM": "အသိုင်းအဝိုင်း ဖန်တီးသူများအား ကျေးဇူးတင်ပါသည်",
    "jv-ID": "Pangripta komunitas",
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
