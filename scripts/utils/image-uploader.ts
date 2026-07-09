export interface LocalImageReference {
  url: string;
}

export async function normalizeImageReference(url: string): Promise<LocalImageReference> {
  return { url };
}
