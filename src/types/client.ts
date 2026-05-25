import { Base } from "./base";

export interface Client extends Base {
  name: string;
  code: string;
  is_active: boolean;
}
