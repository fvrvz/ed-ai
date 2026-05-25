import { Base } from "./base";

export interface Course extends Base {
    client_id: string;
    title: string;
    description: string;
    is_published: boolean;
}

export interface Assignment extends Base {
    course_id: string;
    user_id: string;
    group_id: string;
    client_id: string; 
}

export interface AssignmentWithCourse extends Assignment {
    course: Course | null;
}