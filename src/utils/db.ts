import { Profile, UserRole } from "@/types/auth";
import { Base } from "@/types/base";
import { ChatMessage, ChatSession } from "@/types/chat";
import { Client } from "@/types/client";
import { Assignment, AssignmentWithCourse, Course } from "@/types/course";
import { Discussion, DiscussionMessage } from "@/types/discussion";
import { Document, DocumentChunk } from "@/types/document";
import { SystemSettings } from "@/types/system-settings";
import { supabase } from "./supabase";

interface FilterOptions<T> {
    isActive?: boolean;
    clientId?: string;
    sortBy?: keyof T;
    sortOrder?: "asc" | "desc";
}

export async function getCourses(
    filterOptions?: FilterOptions<Course>,
): Promise<Course[]> {
    let query = supabase.from("courses").select("*");

    if (filterOptions?.isActive !== undefined) {
        query = query.eq("is_published", filterOptions.isActive);
    }

    if (filterOptions?.clientId) {
        query = query.eq("client_id", filterOptions.clientId);
    }

    if (filterOptions?.sortBy) {
        query = query.order(filterOptions.sortBy, {
            ascending: filterOptions.sortOrder === "asc",
        });
    }

    const { data, error } = await query;
    if (error) {
        throw new Error(`Error fetching courses: ${error.message}`);
    }
    return data;
}

export async function getCourseById(courseId: string): Promise<Course | null> {
    const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single();
    if (error) {
        throw new Error(
            `Error fetching course with ID ${courseId}: ${error.message}`,
        );
    }
    return data;
}

export async function getClients(
    filterOptions?: FilterOptions<Client>,
): Promise<Client[]> {
    let query = supabase.from("clients").select("*");

    if (filterOptions?.isActive !== undefined) {
        query = query.eq("is_active", filterOptions.isActive);
    }

    if (filterOptions?.sortBy) {
        query = query.order(filterOptions.sortBy, {
            ascending: filterOptions.sortOrder === "asc",
        });
    }

    const { data, error } = await query;
    if (error) {
        throw new Error(`Error fetching clients: ${error.message}`);
    }
    return data;
}

export async function getClientById(clientId: string): Promise<Client | null> {
    const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("id", clientId)
        .single();

    if (error) {
        throw new Error(
            `Error fetching client with ID ${clientId}: ${error.message}`,
        );
    }

    return data;
}

export async function createClient(
    client: Omit<Client, keyof Base>,
): Promise<Client> {
    const { data, error } = await supabase
        .from("clients")
        .insert(client)
        .select()
        .single();

    if (error) {
        throw new Error(`Error creating client: ${error.message}`);
    }

    return data;
}

export async function updateClient(
    clientId: string,
    updates: Partial<Omit<Client, keyof Base>>,
): Promise<Client> {
    const { data, error } = await supabase
        .from("clients")
        .update(updates)
        .eq("id", clientId)
        .select()
        .single();

    if (error) {
        throw new Error(
            `Error updating client with ID ${clientId}: ${error.message}`,
        );
    }

    return data;
}

export async function getUsers(
    filterOptions?: FilterOptions<Profile>,
): Promise<Profile[]> {
    let query = supabase.from("profiles").select("*");

    if (filterOptions?.clientId) {
        query = query.eq("client_id", filterOptions.clientId);
    }

    if (filterOptions?.isActive !== undefined) {
        query = query.eq("is_active", filterOptions.isActive);
    }

    if (filterOptions?.sortBy) {
        query = query.order(filterOptions.sortBy, {
            ascending: filterOptions.sortOrder === "asc",
        });
    }

    const { data, error } = await query;
    if (error) {
        throw new Error(`Error fetching users: ${error.message}`);
    }
    return data;
}

export async function getUserById(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase.from("profiles").select("*").eq(
        "id",
        userId,
    ).single();
    if (error) {
        throw new Error(
            `Error fetching user with ID ${userId}: ${error.message}`,
        );
    }
    return data;
}

export async function getUserByEmail(email: string): Promise<Profile | null> {
    const { data, error } = await supabase.from("profiles").select("*").eq(
        "email",
        email,
    ).single();
    if (error) {
        throw new Error(
            `Error fetching user with email ${email}: ${error.message}`,
        );
    }
    return data;
}

export async function changeUserRole(
    email: string,
    role: Omit<UserRole, "super_admin">,
): Promise<Profile | null> {
    const { data, error } = await supabase
        .from("profiles")
        .update({ role })
        .eq("email", email)
        .single();
    if (error) {
        throw new Error(
            `Error changing role for user with email ${email}: ${error.message}`,
        );
    }
    return data;
}

export async function updateUserClient(
    userId: string,
    clientId: string | null,
): Promise<Profile | null> {
    const { data, error } = await supabase
        .from("profiles")
        .update({ client_id: clientId })
        .eq("id", userId)
        .select()
        .single();

    if (error) {
        throw new Error(
            `Error updating client assignment for user with ID ${userId}: ${error.message}`,
        );
    }

    return data;
}

export async function getDocuments(
    filterOptions?: FilterOptions<Document>,
): Promise<Document[]> {
    let query = supabase.from("documents").select("*");

    if (filterOptions?.clientId) {
        query = query.eq("client_id", filterOptions.clientId);
    }

    if (filterOptions?.sortBy) {
        query = query.order(filterOptions.sortBy, {
            ascending: filterOptions.sortOrder === "asc",
        });
    }

    const { data, error } = await query;
    if (error) {
        throw new Error(`Error fetching documents: ${error.message}`);
    }
    return data;
}

export async function getDocumentById(
    documentId: string,
): Promise<Document | null> {
    const { data, error } = await supabase.from("documents").select("*").eq(
        "id",
        documentId,
    ).single();
    if (error) {
        throw new Error(
            `Error fetching document with ID ${documentId}: ${error.message}`,
        );
    }
    return data;
}

export async function getDocumentsByCourseId(
    courseId: string,
): Promise<Document[]> {
    const { data, error } = await supabase.from("documents").select("*").eq(
        "course_id",
        courseId,
    );
    if (error) {
        throw new Error(
            `Error fetching documents for course with ID ${courseId}: ${error.message}`,
        );
    }
    return data;
}

export async function addDocument(
    payload: Omit<Document, keyof Base | "embedding_status">,
): Promise<Document> {
    const { data, error } = await supabase.from("documents").insert(payload)
        .select().single<Document>();
    if (error) {
        throw new Error(`Error adding document: ${error.message}`);
    }
    return data;
}

export async function deleteDocument(id: string): Promise<void> {
    const { error } = await supabase.from("documents").delete().eq<
        keyof Document
    >("id", id);
    if (error) {
        throw new Error(`Error adding document: ${error.message}`);
    }
}

export async function deleteEmbeddingByDocumentId(id: string): Promise<void> {
    const { error } = await supabase.from("document_chunks").delete().eq<
        keyof DocumentChunk
    >("document_id", id);
    if (error) {
        throw new Error(`Error deleting document chunks: ${error.message}`);
    }
}

async function getAssignmentsForUser(userId: string): Promise<Assignment[]> {
    const { data: directAssignments, error: directError } = await supabase
        .from("course_assignments")
        .select("*")
        .eq("user_id", userId);

    if (directError) {
        throw new Error(
            `Error fetching assignments for user with ID ${userId}: ${directError.message}`,
        );
    }

    const { data: groupMemberships, error: groupMembershipError } =
        await supabase
            .from("group_members")
            .select("group_id")
            .eq("user_id", userId);

    if (groupMembershipError) {
        throw new Error(
            `Error fetching group memberships for user with ID ${userId}: ${groupMembershipError.message}`,
        );
    }

    const groupIds = [
        ...new Set((groupMemberships ?? []).map((row) => row.group_id)),
    ];

    if (groupIds.length === 0) {
        return directAssignments ?? [];
    }

    const { data: groupAssignments, error: groupAssignmentsError } =
        await supabase
            .from("course_assignments")
            .select("*")
            .in("group_id", groupIds);

    if (groupAssignmentsError) {
        throw new Error(
            `Error fetching group assignments for user with ID ${userId}: ${groupAssignmentsError.message}`,
        );
    }

    return [...(directAssignments ?? []), ...(groupAssignments ?? [])];
}

export async function getAssignments(
    filterOptions?: Omit<FilterOptions<Assignment>, "isActive">,
): Promise<Assignment[]> {
    let query = supabase.from("course_assignments").select("*");

    if (filterOptions?.clientId) {
        query = query.eq("client_id", filterOptions.clientId);
    }

    if (filterOptions?.sortBy) {
        query = query.order(filterOptions.sortBy, {
            ascending: filterOptions.sortOrder === "asc",
        });
    }

    const { data, error } = await query;
    if (error) {
        throw new Error(`Error fetching assignments: ${error.message}`);
    }
    return data;
}

export async function getAssignmentById(
    assignmentId: string,
): Promise<Assignment | null> {
    const { data, error } = await supabase.from("course_assignments").select(
        "*",
    ).eq("id", assignmentId).single();
    if (error) {
        throw new Error(
            `Error fetching assignment with ID ${assignmentId}: ${error.message}`,
        );
    }
    return data;
}

export async function getAssignmentsByUserId(
    userId: string,
): Promise<Assignment[]> {
    return getAssignmentsForUser(userId);
}

export async function getAssignmentsByUserIdWithCourse(
    userId: string,
): Promise<AssignmentWithCourse[]> {
    const assignments = await getAssignmentsForUser(userId);

    if (assignments.length === 0) {
        return [];
    }

    const courseIds = [
        ...new Set(assignments.map((assignment) => assignment.course_id)),
    ];
    const { data: courses, error: coursesError } = await supabase
        .from("courses")
        .select("*")
        .in("id", courseIds);

    if (coursesError) {
        throw new Error(
            `Error fetching courses for assignments: ${coursesError.message}`,
        );
    }

    const courseMap = new Map(
        (courses ?? []).map((course) => [course.id, course]),
    );

    return assignments.map((assignment) => ({
        ...assignment,
        course: courseMap.get(assignment.course_id) ?? null,
    }));
}

export async function createCourse(
    course: Omit<Course, keyof Base>,
): Promise<Course> {
    const { data, error } = await supabase.from("courses").insert(course)
        .select().single();
    if (error) {
        throw new Error(`Error creating course: ${error.message}`);
    }
    return data;
}

export async function updateCourse(
    courseId: string,
    updates: Partial<Omit<Course, keyof Base>>,
): Promise<Course> {
    const { data, error } = await supabase.from("courses").update(updates).eq(
        "id",
        courseId,
    ).select().single();
    if (error) {
        throw new Error(
            `Error updating course with ID ${courseId}: ${error.message}`,
        );
    }
    return data;
}

export async function deleteCourse(courseId: string): Promise<void> {
    const { error } = await supabase.from("courses").delete().eq(
        "id",
        courseId,
    );
    if (error) {
        throw new Error(
            `Error deleting course with ID ${courseId}: ${error.message}`,
        );
    }
}

export async function getSystemSettingsForClient(
    clientId: string,
): Promise<SystemSettings | null> {
    const { data, error } = await supabase.from("system_settings").select("*")
        .eq<keyof SystemSettings>("client_id", clientId).maybeSingle<
        SystemSettings
    >();
    if (error) {
        throw new Error(
            `Error fetching system settings for reason: ${error.message}`,
        );
    }

    if (!data) {
        console.log("Data not available");
        return null;
    }
    return data;
}

export async function updateSystemSettingsForClient(
    clientId: string,
    payload: Partial<Omit<SystemSettings, keyof Base>>,
): Promise<SystemSettings> {
    const { data, error } = await supabase.from("system_settings").update(
        payload,
    ).eq<keyof SystemSettings>("client_id", clientId).select("*").single<
        SystemSettings
    >();
    if (error) {
        throw new Error(
            `Error updating system settings for reason: ${error.message}`,
        );
    }
    return data;
}

export async function createSystemSettingsForClient(
    payload: Partial<Omit<SystemSettings, keyof Base>>,
): Promise<SystemSettings> {
    const { data, error } = await supabase.from("system_settings").insert(
        payload,
    ).select().single<SystemSettings>();
    if (error) {
        throw new Error(
            `Error inserting system settings for reason: ${error.message}`,
        );
    }
    return data;
}

export async function getChatSessions(
    options?: Partial<ChatSession>,
): Promise<ChatSession[]> {
    const query = supabase.from("chat_sessions").select("*");

    if (options?.id) {
        query.eq("id", options.id);
    }

    if (options?.course_id) {
        query.eq("course_id", options.course_id);
    }

    if (options?.profile_id) {
        query.eq("profile_id", options.profile_id);
    }

    const { data, error } = await query;
    if (error) {
        throw new Error(`Error fetching chat sessions: ${error.message}`);
    }
    return data;
}

export async function getChatMessagesBySessionId(
    sessionId: string,
): Promise<ChatMessage[]> {
    const { data, error } = await supabase.from("chat_messages").select("*").eq(
        "session_id",
        sessionId,
    ).order("created_at", { ascending: false });
    if (error) {
        throw new Error(
            `Error fetching chat messages for session ID ${sessionId}: ${error.message}`,
        );
    }
    return data;
}

export async function getDiscussionMessages(
    discussionId: string,
): Promise<DiscussionMessage[]> {
    const { data, error } = await supabase
        .from("discussion_messages")
        .select(`
            *,
            profile:profiles (
                first_name,
                last_name
            )
        `)
        .eq<keyof DiscussionMessage>("discussion_id", discussionId)
        .order<keyof DiscussionMessage>("created_at", { ascending: true });

    if (error) {
        throw new Error(`Error fetching discussion messages: ${error.message}`);
    }
    return data;
}

export async function getDiscussions(
    options?: Partial<Discussion>,
): Promise<Discussion[]> {
    const query = supabase.from("discussions").select("*").order(
        "created_at",
        { ascending: false },
    );

    if (options?.id) {
        query.eq("id", options.id);
    }

    if (options?.course_id) {
        query.eq("course_id", options.course_id);
    }

    if (options?.user_id) {
        query.eq("user_id", options.user_id);
    }

    if (options?.client_id) {
        query.eq("client_id", options.client_id);
    }

    const { data, error } = await query;
    if (error) {
        throw new Error(`Error fetching discussions: ${error.message}`);
    }
    return data;
}

export async function addDiscussionMessage(
    payload: Omit<DiscussionMessage, keyof Base | "profile">,
): Promise<DiscussionMessage> {
    const { data, error } = await supabase.from("discussion_messages").insert(
        payload,
    ).select(`
            *,
            profile:profiles (
                first_name,
                last_name
            )
        `).single();
    if (error) {
        throw new Error(`Error adding discussion message: ${error.message}`);
    }
    return data;
}

export async function createDiscussion(
    payload: Omit<Discussion, keyof Base>,
): Promise<Discussion> {
    const { data, error } = await supabase.from("discussions").insert(payload)
        .select().single();
    if (error) {
        throw new Error(`Error creating discussion: ${error.message}`);
    }
    return data;
}

export async function updateDiscussionStatus(
    discussionId: string,
    status: Discussion["status"],
): Promise<Discussion> {
    const { data, error } = await supabase
        .from("discussions")
        .update({ status })
        .eq("id", discussionId)
        .select()
        .single();

    if (error) {
        throw new Error(`Error updating discussion status: ${error.message}`);
    }

    return data;
}

export async function updateDiscussionMessage(
    messageId: string,
    content: string,
): Promise<DiscussionMessage> {
    const { data, error } = await supabase
        .from("discussion_messages")
        .update({ content })
        .eq("id", messageId)
        .select()
        .single();

    if (error) {
        throw new Error(`Error updating discussion message: ${error.message}`);
    }

    return data;
}

export async function deleteDiscussionMessage(
    messageId: string,
): Promise<void> {
    const { error } = await supabase
        .from("discussion_messages")
        .delete()
        .eq("id", messageId);

    if (error) {
        throw new Error(`Error deleting discussion message: ${error.message}`);
    }
}
