CREATE TABLE IF NOT EXISTS "public"."sub_districts" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "jila_id" uuid NOT NULL,
    "name" text NOT NULL,
    "slug" text NOT NULL,
    "status" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("jila_id") REFERENCES "public"."districts"("id") ON DELETE CASCADE
);

GRANT SELECT ON public.sub_districts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sub_districts TO authenticated;
GRANT ALL ON public.sub_districts TO service_role;

ALTER TABLE public.sub_districts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sub_districts public read" ON public.sub_districts;
CREATE POLICY "sub_districts public read" ON public.sub_districts FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "sub_districts admin write" ON public.sub_districts;
CREATE POLICY "sub_districts admin write" ON public.sub_districts 
FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'::public.app_role)) 
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'::public.app_role));

ALTER TABLE "public"."articles"
ADD COLUMN IF NOT EXISTS "sub_district_id" uuid;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'articles_sub_district_id_fkey'
        AND table_name = 'articles'
    ) THEN
        ALTER TABLE "public"."articles"
        ADD CONSTRAINT "articles_sub_district_id_fkey"
        FOREIGN KEY ("sub_district_id") REFERENCES "public"."sub_districts"("id") ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS "idx_articles_category_slug" ON "public"."articles" ("category_slug");
CREATE INDEX IF NOT EXISTS "idx_articles_district_id" ON "public"."articles" ("district_id");
CREATE INDEX IF NOT EXISTS "idx_articles_sub_district_id" ON "public"."articles" ("sub_district_id");
