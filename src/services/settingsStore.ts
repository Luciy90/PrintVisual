import { mkdir, readFile, writeFile } from "node:fs/promises";
import { paths } from "../config.js";
import { AppSettingsSchema, type AppSettings } from "../schemas.js";

export class SettingsStore {
  async read(): Promise<AppSettings> {
    try {
      const raw = await readFile(paths.settingsFile, "utf8");
      return AppSettingsSchema.parse(JSON.parse(raw));
    } catch (error) {
      if (isMissingFile(error)) return {};
      throw error;
    }
  }

  async write(settings: AppSettings): Promise<AppSettings> {
    const parsed = AppSettingsSchema.parse(settings);
    await mkdir(paths.dataDir, { recursive: true });
    await writeFile(paths.settingsFile, `${JSON.stringify(parsed, null, 2)}\n`, "utf8");
    return parsed;
  }

  async merge(patch: AppSettings): Promise<AppSettings> {
    const current = await this.read();
    return this.write({ ...current, ...patch });
  }
}

function isMissingFile(error: unknown): boolean {
  return typeof error === "object"
    && error !== null
    && "code" in error
    && error.code === "ENOENT";
}

export const settingsStore = new SettingsStore();
