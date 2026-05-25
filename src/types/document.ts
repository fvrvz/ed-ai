import { Base } from "./base";

export interface Document extends Base {
  client_id: string;
  name: string;
  storage_url: string;
  course_id: string;
}