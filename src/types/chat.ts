import { Base } from "./base";

export interface ChatMessage extends Omit<Base, "updated_at"> {
  sender_type: "user" | "assistant";
  content: string;
  session_id: string;
}

export interface ChatSession extends Base {
  title: string;
  course_id: string;
  profile_id: string;
  client_id: string;
}

export const timeOptions = {
  hour: "2-digit",
  minute: "2-digit",
} as const;
