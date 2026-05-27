import { Base } from "./base";

export interface Document extends Base {
  client_id: string;
  name: string;
  storage_url: string;
  course_id: string;
  embedding_status: 'processing' | 'completed' | 'failed';
}

export interface DocumentChunk extends Base {
  client_id: string;
  document_id: string;
  content: string;
  embedding: number[]
}