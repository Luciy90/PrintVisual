import path from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";
import { z } from "zod";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const projectRoot = path.resolve(__dirname, "..");

const EnvSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(8765),
  HOST: z.string().min(1).default("localhost"),
  PUBLIC_DIR: z.string().min(1).default("public"),
  DATA_DIR: z.string().min(1).default("data")
});

export const config = EnvSchema.parse(process.env);

export const paths = {
  root: projectRoot,
  publicDir: path.resolve(projectRoot, config.PUBLIC_DIR),
  clientIndexFile: path.resolve(projectRoot, config.PUBLIC_DIR, "index.html"),
  dataDir: path.resolve(projectRoot, config.DATA_DIR),
  settingsFile: path.resolve(projectRoot, config.DATA_DIR, "printerCamsV2.json")
};
