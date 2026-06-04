import { Profile } from "./auth";
import { Base } from "./base";

export interface Discussion extends Base {
    client_id: string;
    course_id: string;
    user_id: string;
    title: string;
    status: "opened" | "closed";
}

export interface DiscussionMessage extends Base {
    discussion_id: string;
    content: string;
    user_id: string;
    role: "member" | "edai" | "admin" | "super_admin";
    profile: Pick<Profile, "first_name" | "last_name">;
}
