import { z } from "zod";
export const StateSchema = z.enum([
    "INTAKE",
    "DISCOVER",
    "EXPLORE",
    "PLAN",
    "IMPLEMENT",
    "TEST",
    "RECOVER",
    "VERIFY",
    "COMPLETE",
    "FAILED"
]);
//# sourceMappingURL=types.js.map