import { Profile, UserRole } from "@/types/auth";
import { Course } from "@/types/course";
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
        console.error("Error fetching courses:", error);
        return [];
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
        console.error(`Error fetching course with ID ${courseId}:`, error);
        return null;
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
        console.error("Error fetching users:", error);
        return [];
    }
    return data;
}

export async function getUserById(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (error) {
        console.error(`Error fetching user with ID ${userId}:`, error);
        return null;
    }
    return data;
}

export async function getUserByEmail(email: string): Promise<Profile | null> {
    const { data, error } = await supabase.from("profiles").select("*").eq("email", email).single();
    if (error) {
        console.error(`Error fetching user with email ${email}:`, error);
        return null;
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
        console.error(`Error changing role for user with email ${email}:`, error);
        return null;
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
        console.error("Error fetching documents:", error);
        return [];
    }
    return data;
}

export async function getDocumentById(documentId: string): Promise<Document | null> {
    const { data, error } = await supabase.from("documents").select("*").eq("id", documentId).single();
    if (error) {
        console.error(`Error fetching document with ID ${documentId}:`, error);
        return null;
    }
    return data;
}

export async function getDocumentsByCourseId(courseId: string): Promise<Document[]> {
    const { data, error } = await supabase.from("documents").select("*").eq("course_id", courseId);
    if (error) {
        console.error(`Error fetching documents for course with ID ${courseId}:`, error);
        return [];
    }
    return data;
}