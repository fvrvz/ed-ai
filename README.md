# EdAI

## 🛠️ Supabase Database Migrations

We use the Supabase CLI to manage database schemas, functions, and RLS policies locally. This ensures our environment remains reproducible and backed up in version control.

### 1. Initial Setup

First, install the CLI dependencies and initialize the configuration directory:

```bash
# Install Supabase CLI as a dev dependency
npm install supabase --save-dev

# Initialize the local supabase configuration folder
npx supabase init
```

### 2. Link to Live Project

Connect your local workspace to the hosted Supabase cloud project. You will need your project's reference ID and your database password.

```bash
npx supabase link --project-ref <your-project-ref-id>
```

### 3. Pull Remote Changes (Backup)

If changes were made directly via the Supabase web UI (like creating tables or triggers), pull them down to generate your baseline local migration tracking file:

```bash
npx supabase db pull
```

### 4. Create a New Migration

Whenever you need to create new tables, functions, or RLS policies, generate a fresh timestamped SQL migration file:

```bash
npx supabase migration new <migration_name_here>
```

- Open the newly generated file inside `./supabase/migrations/`.
- Write or paste your custom PostgreSQL/SQL scripts inside it.

### 5. Apply Changes to Remote Database

Deploy and execute your local migration files directly to your live production cloud database:

```bash
npx supabase db push
```
