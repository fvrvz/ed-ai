import { Base } from "./base";

export interface SystemSettings extends Base {
    client_id: string;
    groq_api_key: string;
    groq_model_name: string;
    huggingface_api_key: string;
}