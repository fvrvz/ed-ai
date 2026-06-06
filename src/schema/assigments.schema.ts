import { z } from "zod";

export const assignmentSchema = z.object({
    course_id: z.string().trim().min(1, { error: "Course is required" }),
    user_id: z.string().trim().min(1, { error: "User is required" }),
    group_id: z.string().trim().min(1, { error: "Group is required" }),
    client_id: z.string().trim().min(1, { error: "Client is required" }),
});

export type AssigmentSchema = z.infer<typeof assignmentSchema>;
