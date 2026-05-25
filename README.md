# EdAI

EdAI is an AI-powered, RAG-driven multi-tenant learning management platform. It allows administrators to isolate corporate clients, structure courses/projects, manage granular document knowledge bases, and use AI to fill knowledge gaps. Members receive contextual AI chat assistance grounded directly in the documents assigned to their specific active course.

## 🚀 Tech Stack & Prerequisites

- **Frontend Framework:** Expo 56 (React Native)
- **Database & Core Workspace Backend:** Supabase (PostgreSQL with `pgvector`)
- **Storage Framework:** Supabase Storage & Local Device Cache
- **LLM Provider:** Grok AI (xAI API Free-Tier Models)
- **Runtime Environment:** Node.js v24.15.0
- **Package Manager:** npm v11.12.1

## 🏗️ System Architecture

| Component               | Technology              | Primary Responsibility / Action                                                               |
| :---------------------- | :---------------------- | :-------------------------------------------------------------------------------------------- |
| **Frontend Client**     | Expo 56 (React Native)  | UI presentation, file uploading pipelines, message history tracking, local keyless requests.  |
| **Object Storage**      | Supabase Storage        | Hosts raw learning items (PDFs, text files) grouped inside client namespaces securely.        |
| **Vector Engine**       | Supabase (`pgvector`)   | Stores chunk strings and coordinates; runs relational index filtered RPC similarity matching. |
| **LLM Inference Proxy** | Supabase Edge Functions | Vault isolation proxy executing serverless routines to mask client master credentials.        |
| **LLM Inference**       | Grok AI (xAI API)       | Receives context-rich prompts bound by course documentation constraints to generate replies.  |

### Multi-Tenant RAG Operations Pipeline

1. **Document Storage:** Admins link documentation items to an explicit course. The binary payload uploads directly to **Supabase Storage** and the resulting public URL is recorded in Supabase.
2. **Offline Memory Mirroring:** Core course metadata grids and thread schemas cache directly onto local storage arrays for near-instant client-side loading configurations.
3. **Isolated Vectorization:** Documents are divided into granular text pieces. The `generate-embeddings` edge worker utilizes the client's scoped service master key to bypass RLS barriers and write the rows.
4. **Targeted Context Retrieval:** When a student posts a question within a course view, the message history and active `course_id` pass to the `grok-chat` edge function. An optimized Database Remote Procedure Call (`match_course_chunks`) runs an HNSW-indexed cosine similarity scan isolated **strictly** to that specific course.
5. **Grok Grounded Generation:** Matched context strings merge into a strict system prompt instruction block sent to **Grok AI**, forcing the inference model to formulate answers anchored solely to the corporate course documentation.

## 🌟 Core Features

### 👑 Admin Capabilities

- **Multi-Tenant Client Provisioning:** Maintain independent client profiles and fully isolated encryption setting matrices.
- **Course & Project Management:** Create, structure, and assign custom training courses.
- **Targeted Knowledge Base Building:** Upload files straight to Supabase Storage mapped explicitly down to individual course modules.
- **AI & Manual Quiz Generation:** Build assessments manually or prompt Grok models to output custom validation questions.
- **Analytics Dashboard:** Track platform engagement, progress loops, and failure percentages.
- **Knowledge Gap Resolution:** Address unresolved support threads and failed AI query logs by expanding course documentation blocks.

### 👥 Member Capabilities

- **Assigned Course Portal:** Access modules, view completion paths, and complete active training programs.
- **Course-Locked AI Chat:** Query a personal learning assistant whose knowledge pool is locked into that active course.
- **Attempt Quizzes:** Complete structured assessments to log completion credentials.
- **Thread Creation:** Open support tickets manually or flag low-confidence AI replies when crucial training data is missing.

## 🛠️ Supabase Workspace & Database Migrations

We use the Supabase CLI to manage structural databases, configuration indexes, serverless functions, and Row-Level Security (RLS) policies locally to ensure version-controlled reproducibility.

### 1. Initial Setup

Install dependencies and initialize the workspace configuration folders:

```bash
# Install Supabase CLI as a dev dependency
npm install supabase --save-dev

# Initialize the local supabase environment folder
npx supabase init
```

### 2. Link to Remote Instance

Connect your local development instance to your live cloud project using your Project Reference ID:

```bash
npx supabase link --project-ref <your-project-ref-id>
```

### 3. Create Database Schemas (First Migrations)

Generate separate timestamped migration files to establish your relational matrices and performance indexing parameters:

```bash
# Migration A: Enable vector capabilities
npx supabase migration new enable_pgvector

# Migration B: Setup multi-tenant clients and configuration secrets vault
npx supabase migration new setup_multi_tenant_vault

# Migration C: Build course vector tracking schemas and HNSW optimizations
npx supabase migration new add_course_document_vectors
```

_Open the resulting files inside `./supabase/migrations/` and apply the targeted structural PostgreSQL scripts._

### 4. Deploy Serverless Edge Functions

Our isolated edge functions operate with scoped `deno.json` import maps. To bundle dependencies and push your entire suite live, run:

```bash
# Deploy all functions simultaneously
npx supabase functions deploy

# Or target individual workers to isolate compilation feedback
npx supabase functions deploy grok-chat
npx supabase functions deploy generate-embeddings
```

### 5. Push Local Schemas to Production

Execute your local migration sequences against your hosted live instance:

```bash
npx supabase db push
```

## 🧪 Local Supabase Development (Recommended for Day-to-Day Work)

Use the local Supabase stack while developing so you can iterate without depending on the cloud project.

1. **Start the local Supabase services**

   ```bash
   npx supabase start
   ```

2. **Apply migrations locally**

   ```bash
   npx supabase migration up
   ```

3. **Open the local Studio**

   ```bash
   npx supabase studio
   ```

4. **Use local env values in your app**

   After `npx supabase start`, copy the local values into your `.env` file:

   ```env
   EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_local_anon_key
   ```

   You can fetch the current local anon key with:

   ```bash
   npx supabase status
   ```

5. **Stop the local stack when you are done**

   ```bash
   npx supabase stop
   ```

> Use the local Supabase instance for development and testing. Use the cloud project only when you are ready to deploy or share changes externally.

## 📦 Local Installation & Getting Started

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/fvrvz/ed-ai
    cd ed-ai
    ```

2.  **Install client-side dependencies:**

    ```bash
    npm install
    ```

3.  **Environment Variables Setup:**
    Create a `.env` file in your root workspace folder and configure your entry keys:

    ```env
    # Public Supabase Client Access Configuration
    EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
    EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anonymous_public_key
    ```

    _(Note: Master keys for Grok AI and Supabase service roles are intentionally omitted from client env setups. They reside encrypted inside the database vault to guarantee total app safety)._

4.  **Start the Expo application:**
    ```bash
    expo start
    ```
