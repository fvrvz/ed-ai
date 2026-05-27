import { Base } from "./base";

export interface SystemSettings extends Base {
    client_id: string;
    grok_api_key: string;
    grok_model_name: string;
}