import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Octokit } from "@octokit/rest";
import type { Prompt } from "./utils/cms-client.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const PROMPTS_PATH = path.join(ROOT_DIR, "data/prompts.json");

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

interface IssueFields {
  prompt_title?: string;
  prompt?: string;
  need_reference_images?: string;
  need_reference_images_?: string;
  description?: string;
  image_urls?: string;
  generated_image_urls?: string;
  author_name?: string;
  original_author?: string;
  author_link?: string;
  author_profile_link?: string;
  source_link?: string;
  language?: string;
  prompt_language?: string;
}

const FIELD_NAME_MAP: Record<string, keyof IssueFields> = {
  generated_image_urls: "image_urls",
  original_author: "author_name",
  author_profile_link: "author_link",
  prompt_language: "language",
  need_reference_images_: "need_reference_images",
};

const LANGUAGE_MAP: Record<string, string> = {
  "English": "en",
  "Chinese (中文)": "zh",
  "Traditional Chinese (繁體中文)": "zh-TW",
  "Japanese (日本語)": "ja-JP",
  "Korean (한국어)": "ko-KR",
  "Thai (ไทย)": "th-TH",
  "Vietnamese (Tiếng Việt)": "vi-VN",
  "Hindi (हिन्दी)": "hi-IN",
  "Spanish (Español)": "es-ES",
  "Latin American Spanish (Español Latinoamérica)": "es-419",
  "German (Deutsch)": "de-DE",
  "French (Français)": "fr-FR",
  "Italian (Italiano)": "it-IT",
  "Brazilian Portuguese (Português do Brasil)": "pt-BR",
  "European Portuguese (Português)": "pt-PT",
  "Turkish (Türkçe)": "tr-TR",
  "Arabic (العربية)": "ar-SA",
  "Bengali (বাংলা)": "bn-BD",
  "Urdu (اردو)": "ur-PK",
  "Indonesian (Bahasa Indonesia)": "id-ID",
  "Malay (Bahasa Melayu)": "ms-MY",
  "Russian (Русский)": "ru-RU",
  "Dutch (Nederlands)": "nl-NL",
  "Polish (Polski)": "pl-PL",
  "Swedish (Svenska)": "sv-SE",
  "Danish (Dansk)": "da-DK",
  "Norwegian Bokmål (Norsk bokmål)": "nb-NO",
  "Finnish (Suomi)": "fi-FI",
  "Greek (Ελληνικά)": "el-GR",
  "Czech (Čeština)": "cs-CZ",
  "Hungarian (Magyar)": "hu-HU",
  "Romanian (Română)": "ro-RO",
  "Ukrainian (Українська)": "uk-UA",
  "Hebrew (עברית)": "he-IL",
  "Persian (فارسی)": "fa-IR",
  "Filipino (Filipino)": "fil-PH",
  "Swahili (Kiswahili)": "sw-KE",
  "Tamil (தமிழ்)": "ta-IN",
  "Telugu (తెలుగు)": "te-IN",
  "Marathi (मराठी)": "mr-IN",
  "Punjabi (ਪੰਜਾਬੀ)": "pa-IN",
  "Gujarati (ગુજરાતી)": "gu-IN",
  "Kannada (ಕನ್ನಡ)": "kn-IN",
  "Malayalam (മലയാളം)": "ml-IN",
  "Burmese (မြန်မာ)": "my-MM",
  "Javanese (Basa Jawa)": "jv-ID",
};

function parseLanguage(languageName = "English"): string {
  return LANGUAGE_MAP[languageName] || "en";
}

function cleanFieldValue(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed === "_No response_") {
    return undefined;
  }
  return trimmed;
}

async function parseIssue(issueBody: string): Promise<IssueFields> {
  const fields: Record<string, string> = {};
  const lines = issueBody.split("\n");
  let currentField: string | null = null;
  let currentValue: string[] = [];

  for (const line of lines) {
    if (line.startsWith("### ")) {
      if (currentField) {
        fields[currentField] = currentValue.join("\n").trim();
      }
      currentField = line.replace("### ", "").toLowerCase().replace(/\s+/g, "_");
      currentValue = [];
    } else if (currentField) {
      currentValue.push(line);
    }
  }

  if (currentField) {
    fields[currentField] = currentValue.join("\n").trim();
  }

  const mappedFields: IssueFields = {};
  for (const [key, value] of Object.entries(fields)) {
    const mappedKey = FIELD_NAME_MAP[key] || key;
    mappedFields[mappedKey as keyof IssueFields] = cleanFieldValue(value);
  }

  return mappedFields;
}

function readPrompts(): Prompt[] {
  return JSON.parse(fs.readFileSync(PROMPTS_PATH, "utf-8")) as Prompt[];
}

function writePrompts(prompts: Prompt[]): void {
  fs.writeFileSync(PROMPTS_PATH, `${JSON.stringify(prompts, null, 2)}\n`, "utf-8");
}

async function main() {
  const issueNumber = process.env.ISSUE_NUMBER;
  const issueBody = process.env.ISSUE_BODY || "";
  const repository = process.env.GITHUB_REPOSITORY || "";
  const [owner, repo] = repository.split("/");

  if (!issueNumber) {
    throw new Error("ISSUE_NUMBER not provided");
  }
  if (!owner || !repo) {
    throw new Error("GITHUB_REPOSITORY must be set to owner/repo");
  }

  const issue = await octokit.issues.get({
    owner,
    repo,
    issue_number: Number(issueNumber),
  });

  const hasPromptSubmissionLabel = issue.data.labels.some((label) => {
    const labelName = typeof label === "string" ? label : label.name;
    return labelName === "prompt-submission";
  });

  if (!hasPromptSubmissionLabel) {
    console.log('Skipping: issue does not have "prompt-submission" label');
    return;
  }

  const fields = await parseIssue(issueBody);
  const imageUrls = (fields.image_urls || "")
    .split("\n")
    .map((url) => url.trim())
    .filter((url) => url.startsWith("http") || url.startsWith("public/"));

  const prompts = readPrompts();
  const existingIndex = prompts.findIndex(
    (prompt) => prompt.sourceMeta?.github_issue === issueNumber
  );
  const nextId = Math.max(0, ...prompts.map((prompt) => prompt.id)) + 1;

  const promptData: Prompt = {
    id: existingIndex >= 0 ? prompts[existingIndex].id : nextId,
    model: "seedream-5-pro",
    title: fields.prompt_title || issue.data.title.replace(/^\[Prompt\]\s*/i, ""),
    content: fields.prompt || "",
    description: fields.description || "",
    sourceMedia: imageUrls,
    author: {
      name: fields.author_name || "Community contributor",
      ...(fields.author_link ? { link: fields.author_link } : {}),
    },
    language: parseLanguage(fields.language || fields.prompt_language || "English"),
    sourcePublishedAt: issue.data.created_at,
    sourceLink: fields.source_link || issue.data.html_url,
    featured: false,
    needReferenceImages: fields.need_reference_images?.toLowerCase() === "true",
    sourceMeta: {
      github_issue: issueNumber,
    },
  };

  if (existingIndex >= 0) {
    prompts[existingIndex] = promptData;
  } else {
    prompts.push(promptData);
  }

  writePrompts(prompts);

  if (issue.data.state === "open") {
    await octokit.issues.update({
      owner,
      repo,
      issue_number: Number(issueNumber),
      state: "closed",
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
