import { Base } from "./base";

export interface Course extends Base {
    client_id: string;
    title: string;
    description: string;
    is_published: boolean;
}