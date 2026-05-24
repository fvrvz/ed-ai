# EdAI

EdAI is an AI-powered, RAG-driven learning management platform. It allows administrators to create custom courses, manage internal knowledge bases, and use AI to identify and fill knowledge gaps. Members receive personalized AI chat assistance grounded directly in the documents uploaded by their administrators.

## 🚀 Tech Stack & Prerequisites

- **Frontend Framework:** Expo 55 (React Native)
- **Database & Vector Engine:** Supabase (PostgreSQL with `pgvector`)
- **Storage Framework:** Cloudflare R2 (S3-Compatible Object Storage) & Local Device Cache
- **LLM Provider:** Grok AI (xAI API Free-Tier Models)
- **Runtime Environment:** Node.js v24.15.0
- **Package Manager:** npm v11.12.1

## 🏗️ System Architecture

| Component           | Technology             | Primary Responsibility / Action                                                              |
| :------------------ | :--------------------- | :------------------------------------------------------------------------------------------- |
| **Frontend Client** | Expo 55 (React Native) | UI presentation, handling file uploads, user prompt submissions, and local device caching.   |
| **Object Storage**  | Cloudflare R2          | Hosts raw training documents (PDFs, text files) uploaded by admins via an S3-compatible API. |
| **Vector Engine**   | Supabase (`pgvector`)  | Stores text chunks alongside numerical vector embeddings; runs cosine-similarity searches.   |
| **LLM Inference**   | Grok AI (xAI API)      | Receives context-rich prompts to generate accurate, grounded natural language responses.     |

### RAG Operations Pipeline

1. **Document Storage:** Administrators upload training manuals, textbooks, or policy sheets. Files are streamed directly to a secure **Cloudflare R2** bucket, saving the reference URI.
2. **Local Caching:** Active learning content and session metadata are mirrored to the client device's local storage for instant offline structural access.
3. **Vector Vectorization:** Text is extracted from documents, divided into optimal semantic chunks, converted into vector representations, and recorded into **Supabase** via the `pgvector` engine.
4. **Context Retrieval:** When a member posts a question, the text is vectorized. A cosine-similarity query finds the relevant matching documentation pieces inside Supabase.
5. **Grok Generation:** The system passes the context chunks along with the user query to **Grok AI**, forcing it to generate a response anchored strictly within the verified organizational knowledge base.

## 🌟 Core Features

### 👑 Admin Capabilities

- **Course & Project Management:** Create, structure, and organize courses or projects.
- **RAG Knowledge Base:** Upload training documents, manuals, and assets directly to Cloudflare R2 to seed the AI context.
- **AI & Manual Quiz Generation:** Instantly spin up assessments using Grok AI models or build them manually.
- **Analytics Dashboard:** Track system usage, user performance, and course completion rates.
- **User Management:** Provision users, manage permissions, and assign content to users or custom user groups.
- **Knowledge Gap Resolution:** Review user-generated threads and unresolved AI queries to expand the documentation.

### 👥 Member Capabilities

- **Assigned Portal:** View, access, and progress through assigned courses and projects.
- **RAG-Powered AI Chat:** Query the AI assistant with conversational questions, getting answers strictly grounded in the project’s knowledge base.
- **Attempt Quizzes:** Take assessments to prove competency and pinpoint personal skill areas.
- **Thread Creation:** Manually open support threads or automatically flag a failed/incomplete AI response when information is missing from the knowledge base.

## 🛠️ Supabase Database Migrations

We use the Supabase CLI to manage database schemas, Vector embeddings, functions, and Row-Level Security (RLS) policies locally. This keeps our environment reproducible and safely versioned.

### 1. Initial Setup

Install the CLI dependencies locally and initialize the configuration directory:

```bash
# Install Supabase CLI as a dev dependency
npm install supabase --save-dev

# Initialize the local supabase configuration folder
npx supabase init
```

### 2. Link to Live Project

Connect your local workspace to the hosted Supabase cloud infrastructure. You will need your project's reference ID and your database password.

```bash
npx supabase link --project-ref <your-project-ref-id>
```

### 3. Setup pgvector (First Migration)

Before creating vector tables, your database needs the vector extension enabled. Generate a migration file:

```bash
npx supabase migration new enable_pgvector
```

Open the generated SQL file and add:

```sql
-- Enable the pgvector extension to work with embedding vectors
CREATE EXTENSION IF NOT EXISTS vector;
```

### 4. Pull Remote Changes (Backup)

If any changes were made directly via the online Supabase Dashboard UI, pull them down to generate your baseline local schema tracking file:

```bash
npx supabase db pull
```

### 5. Create a New Migration

Whenever you need to create new tables, add vector extensions, or modify RLS policies, generate a fresh timestamped SQL migration file:

```bash
npx supabase migration new <migration_name_here>
```

### 6. Apply Changes to Remote Database

Deploy and execute your local migration files directly onto your live production cloud database:

```bash
npx supabase db push
```

---

## 📦 Local Installation & Getting Started

1.  **Clone the repository:**

    ```bash
    git clone https://github.com
    cd EdAI
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Environment Variables:**
    Create a `.env` file in the root directory and add your keys:

    ```env
    # Supabase Setup
    EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
    EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

    # Grok AI Configuration
    EXPO_PUBLIC_XAI_API_KEY=your_grok_ai_api_key

    # Cloudflare R2 Credentials
    EXPO_PUBLIC_R2_ACCOUNT_ID=your_cloudflare_account_id
    EXPO_PUBLIC_R2_ACCESS_KEY_ID=your_r2_access_key
    EXPO_PUBLIC_R2_SECRET_ACCESS_KEY=your_r2_secret_key
    EXPO_PUBLIC_R2_BUCKET_NAME=your_bucket_name
    ```

4.  **Start the Expo application:**
    ```bash
    npx expo start
    ```

## 🛠️ Supabase Database Migrations

We use the Supabase CLI to manage database schemas, Vector embeddings, functions, and Row-Level Security (RLS) policies locally. This keeps our environment reproducible and safely versioned.

### 1. Initial Setup

Install the CLI dependencies locally and initialize the configuration directory:

```bash
# Install Supabase CLI as a dev dependency
npm install supabase --save-dev

# Initialize the local supabase configuration folder
npx supabase init
```

### 2. Link to Live Project

Connect your local workspace to the hosted Supabase cloud infrastructure. You will need your project's reference ID and your database password.

```bash
npx supabase link --project-ref <your-project-ref-id>
```

### 3. Create a New Migration

Whenever you need to create new tables, functions, or RLS policies, generate a fresh timestamped SQL migration file:

```bash
npx supabase migration new <migration_name_here>
```

- Open the newly generated file inside `./supabase/migrations/`.
- Write or paste your custom PostgreSQL/SQL scripts inside it.

### 4. Apply Changes to Remote Database

Deploy and execute your local migration files directly to your live production cloud database:

```bash
npx supabase db push
```

## 📦 Local Installation & Getting Started

1.  **Clone the repository:**

    ```bash
    git clone https://github.com
    cd EdAI
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Environment Variables:**
    Create a `.env` file in the root directory and add your keys:

    ```env
    # Supabase Setup
    EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
    EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

    # Grok AI Configuration
    EXPO_PUBLIC_XAI_API_KEY=your_grok_ai_api_key

    # Cloudflare R2 Credentials
    EXPO_PUBLIC_R2_ACCOUNT_ID=your_cloudflare_account_id
    EXPO_PUBLIC_R2_ACCESS_KEY_ID=your_r2_access_key
    EXPO_PUBLIC_R2_SECRET_ACCESS_KEY=your_r2_secret_key
    EXPO_PUBLIC_R2_BUCKET_NAME=your_bucket_name
    ```

4.  **Start the Expo application:**
    ```bash
    npm start
    ```
