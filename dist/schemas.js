import { z } from "zod";
export const MacSchema = z
    .string()
    .trim()
    .regex(/^([0-9a-f]{2}[:-]){5}[0-9a-f]{2}$/i)
    .transform(value => value.replace(/-/g, ":").toUpperCase());
export const PrinterAddressSchema = z.string().trim().min(1).max(255);
export const CameraSchema = z.object({
    ip: z.string().trim().default(""),
    stream: z.string().trim().default(""),
    name: z.string().trim().default(""),
    mac: z.string().trim().optional().default(""),
    lastSeenIp: z.string().trim().optional().default(""),
    lastMacCheckAt: z.string().trim().optional().default("")
});
export const CameraListSchema = z.array(CameraSchema);
export const AppSettingsSchema = z
    .object({
    cameraOrder: CameraListSchema.optional(),
    streamToggles: z.record(z.string(), z.boolean()).optional()
})
    .passthrough();
export const MacLookupQuerySchema = z.object({
    address: PrinterAddressSchema
});
export const MacLookupBodySchema = z.object({
    address: PrinterAddressSchema,
    timeoutMs: z.number().int().min(250).max(10000).optional()
});
export const SubnetSchema = z
    .string()
    .trim()
    .regex(/^(25[0-5]|2[0-4]\d|1?\d?\d)\.(25[0-5]|2[0-4]\d|1?\d?\d)\.(25[0-5]|2[0-4]\d|1?\d?\d)$/);
export const NetworkScanSchema = z.object({
    subnets: z.array(SubnetSchema).min(1).max(16).optional(),
    printers: CameraListSchema.optional(),
    concurrency: z.number().int().min(1).max(64).optional(),
    probeTimeoutMs: z.number().int().min(250).max(10000).optional(),
    macTimeoutMs: z.number().int().min(250).max(10000).optional()
});
export const RecoverPlanSchema = z.object({
    printers: CameraListSchema.min(1),
    concurrency: z.number().int().min(1).max(64).optional(),
    probeTimeoutMs: z.number().int().min(250).max(10000).optional(),
    macTimeoutMs: z.number().int().min(250).max(10000).optional()
});
