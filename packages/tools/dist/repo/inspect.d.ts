import { z } from "zod";
import { Tool } from "@forge/core";
export declare const ReadFileInputSchema: z.ZodObject<{
    path: z.ZodString;
    maxBytes: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    path: string;
    maxBytes?: number | undefined;
}, {
    path: string;
    maxBytes?: number | undefined;
}>;
export declare const ReadFileTool: Tool;
export declare const ListDirInputSchema: z.ZodObject<{
    dirPath: z.ZodDefault<z.ZodString>;
    maxDepth: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    dirPath: string;
    maxDepth?: number | undefined;
}, {
    dirPath?: string | undefined;
    maxDepth?: number | undefined;
}>;
export declare const ListDirTool: Tool;
export declare const GitStatusTool: Tool;
//# sourceMappingURL=inspect.d.ts.map