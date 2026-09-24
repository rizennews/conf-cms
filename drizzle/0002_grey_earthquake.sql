ALTER TABLE "registrations" ALTER COLUMN "full_name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "registrations" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "registrations" ALTER COLUMN "whatsapp" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "registrations" ALTER COLUMN "address" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "registrations" ALTER COLUMN "age_range" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "registrations" ALTER COLUMN "is_member" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "registrations" ALTER COLUMN "is_first_time" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "registrations" ALTER COLUMN "heard_from" DROP NOT NULL;