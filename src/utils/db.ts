import { Profile, UserRole } from "@/types/auth";
import { Assignment, AssignmentWithCourse, Course } from "@/types/course";
import { Document } from "@/types/document";
import { supabase } from "./supabase";

interface FilterOptions<T> {
    isActive?: boolean;
    clientId?: string;
    sortBy?: keyof T;
    sortOrder?: "asc" | "desc";
}

export async function getCourses(filterOptions?: FilterOptions<Course>): Promise<Course[]> {
    let query = supabase.from("courses").select("*");

    if (filterOptions?.isActive !== undefined) {
        query = query.eq("is_published", filterOptions.isActive);
    }

    if (filterOptions?.clientId) {
        query = query.eq("client_id", filterOptions.clientId);
    }

    if (filterOptions?.sortBy) {
        query = query.order(filterOptions.sortBy, { ascending: filterOptions.sortOrder === "asc" });
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
        throw new Error(`Error fetching course with ID ${courseId}: ${error.message}`);
    }
    return data;
}

export async function getUsers(filterOptions?: FilterOptions<Profile>): Promise<Profile[]> {
    let query = supabase.from("profiles").select("*");

    if (filterOptions?.clientId) {
        query = query.eq("client_id", filterOptions.clientId);
    }

    if (filterOptions?.isActive !== undefined) {
        query = query.eq("is_active", filterOptions.isActive);
    }

    if (filterOptions?.sortBy) {
        query = query.order(filterOptions.sortBy, { ascending: filterOptions.sortOrder === "asc" });
    }

    const { data, error } = await query;
    if (error) {
        throw new Error(`Error fetching users: ${error.message}`);
    }
    return data;
}

export async function getUserById(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (error) {
        throw new Error(`Error fetching user with ID ${userId}: ${error.message}`);
    }
    return data;
}

export async function getUserByEmail(email: string): Promise<Profile | null> {
    const { data, error } = await supabase.from("profiles").select("*").eq("email", email).single();
    if (error) {
        throw new Error(`Error fetching user with email ${email}: ${error.message}`);
    }
    return data;
}

export async function changeUserRole(email: string, role: UserRole): Promise<Profile | null> {
    const { data, error } = await supabase
        .from("profiles")
        .update({ role })
        .eq("email", email)
        .single();
    if (error) {
        throw new Error(`Error changing role for user with email ${email}: ${error.message}`);
    }
    return data;
}

export async function getDocuments(filterOptions?: FilterOptions<Document>): Promise<Document[]> {
    let query = supabase.from("documents").select("*");

    if (filterOptions?.clientId) {
        query = query.eq("client_id", filterOptions.clientId);
    }

    if (filterOptions?.sortBy) {
        query = query.order(filterOptions.sortBy, { ascending: filterOptions.sortOrder === "asc" });
    }

    const { data, error } = await query;
    if (error) {
        throw new Error(`Error fetching documents: ${error.message}`);
    }
    return data;
}

export async function getDocumentById(documentId: string): Promise<Document | null> {
    const { data, error } = await supabase.from("documents").select("*").eq("id", documentId).single();
    if (error) {
        throw new Error(`Error fetching document with ID ${documentId}: ${error.message}`);
    }
    return data;
}

export async function getDocumentsByCourseId(courseId: string): Promise<Document[]> {
    const { data, error } = await supabase.from("documents").select("*").eq("course_id", courseId);
    if (error) {
        throw new Error(`Error fetching documents for course with ID ${courseId}: ${error.message}`);
    }
    return data;
}

async function getAssignmentsForUser(userId: string): Promise<Assignment[]> {
    const { data: directAssignments, error: directError } = await supabase
        .from("course_assignments")
        .select("*")
        .eq("user_id", userId);

    if (directError) {
        throw new Error(`Error fetching assignments for user with ID ${userId}: ${directError.message}`);
    }

    const { data: groupMemberships, error: groupMembershipError } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", userId);

    if (groupMembershipError) {
        throw new Error(`Error fetching group memberships for user with ID ${userId}: ${groupMembershipError.message}`);
    }

    const groupIds = [...new Set((groupMemberships ?? []).map((row) => row.group_id))];

    if (groupIds.length === 0) {
        return directAssignments ?? [];
    }

    const { data: groupAssignments, error: groupAssignmentsError } = await supabase
        .from("course_assignments")
        .select("*")
        .in("group_id", groupIds);

    if (groupAssignmentsError) {
        throw new Error(`Error fetching group assignments for user with ID ${userId}: ${groupAssignmentsError.message}`);
    }

    return [...(directAssignments ?? []), ...(groupAssignments ?? [])];
}

export async function getAssignments(filterOptions?: Omit<FilterOptions<Assignment>, 'isActive'> ): Promise<Assignment[]> {
    let query = supabase.from("course_assignments").select("*");

    if (filterOptions?.clientId) {
        query = query.eq("client_id", filterOptions.clientId);
    }

    if (filterOptions?.sortBy) {
        query = query.order(filterOptions.sortBy, { ascending: filterOptions.sortOrder === "asc" });
    }

    const { data, error } = await query;
    if (error) {
        throw new Error(`Error fetching assignments: ${error.message}`);
    }
    return data;
}

export async function getAssignmentById(assignmentId: string): Promise<Assignment | null> {
    const { data, error } = await supabase.from("course_assignments").select("*").eq("id", assignmentId).single();
    if (error) {
        throw new Error(`Error fetching assignment with ID ${assignmentId}: ${error.message}`);
    }
    return data;
}

export async function getAssignmentsByUserId(userId: string): Promise<Assignment[]> {
    return getAssignmentsForUser(userId);
}

export async function getAssignmentsByUserIdWithCourse(userId: string): Promise<AssignmentWithCourse[]> {
    const assignments = await getAssignmentsForUser(userId);

    if (assignments.length === 0) {
        return [];
    }

    const courseIds = [...new Set(assignments.map((assignment) => assignment.course_id))];
    const { data: courses, error: coursesError } = await supabase
        .from("courses")
        .select("*")
        .in("id", courseIds);

    if (coursesError) {
        throw new Error(`Error fetching courses for assignments: ${coursesError.message}`);
    }

    const courseMap = new Map((courses ?? []).map((course) => [course.id, course]));

    return assignments.map((assignment) => ({
        ...assignment,
        course: courseMap.get(assignment.course_id) ?? null,
    }));
}