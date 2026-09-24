ALTER TABLE "events" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "is_main_event" boolean DEFAULT false NOT NULL;