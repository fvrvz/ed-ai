import { Base } from "./base";

export interface UserGroup extends Base {
    client_id: string;
    name: string;
    description: string;
}

export interface GroupMember extends Omit<Base, "updated_at"> {
    group_id: string;
    user_id: string;
}
