CREATE TYPE "public"."activity_category" AS ENUM('water', 'wildlife', 'heritage', 'culture', 'food');--> statement-breakpoint
CREATE TYPE "public"."booking_kind" AS ENUM('tour', 'moto', 'stay', 'event');--> statement-breakpoint
CREATE TYPE "public"."booking_status" AS ENUM('pending-payment', 'confirmed', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."departure_status" AS ENUM('open', 'filling', 'sold-out', 'guaranteed');--> statement-breakpoint
CREATE TYPE "public"."difficulty" AS ENUM('easy', 'moderate', 'challenging', 'expert');--> statement-breakpoint
CREATE TYPE "public"."enquiry_status" AS ENUM('new', 'in_progress', 'closed');--> statement-breakpoint
CREATE TYPE "public"."event_category" AS ENUM('festival', 'music', 'culture', 'sport', 'food');--> statement-breakpoint
CREATE TYPE "public"."faq_topic" AS ENUM('booking', 'permits', 'travel', 'payment', 'motorcycle');--> statement-breakpoint
CREATE TYPE "public"."meal_plan" AS ENUM('breakfast', 'half-board', 'full-board', 'none');--> statement-breakpoint
CREATE TYPE "public"."permit_kind" AS ENUM('ILP', 'PAP');--> statement-breakpoint
CREATE TYPE "public"."permit_status" AS ENUM('draft', 'submitted', 'approved', 'rejected', 'expired');--> statement-breakpoint
CREATE TYPE "public"."publish_state" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."state_slug" AS ENUM('assam', 'meghalaya', 'arunachal-pradesh', 'nagaland', 'manipur', 'mizoram', 'tripura', 'sikkim');--> statement-breakpoint
CREATE TYPE "public"."suitability" AS ENUM('couples', 'families', 'groups');--> statement-breakpoint
CREATE TYPE "public"."tour_type" AS ENUM('couple', 'honeymoon', 'group', 'solo');--> statement-breakpoint
CREATE TYPE "public"."trip_request_status" AS ENUM('new', 'in_progress', 'quoted', 'confirmed', 'lost', 'closed');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('traveller', 'staff', 'admin');--> statement-breakpoint
CREATE TABLE "accounts" (
	"userId" uuid NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "accounts_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" uuid NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"emailVerified" timestamp with time zone,
	"image" text,
	"password_hash" text,
	"role" "user_role" DEFAULT 'traveller' NOT NULL,
	"phone" text,
	"disabled_at" timestamp with time zone,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "verification_tokens_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE "activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"strapline" text NOT NULL,
	"category" "activity_category" NOT NULL,
	"locality" text NOT NULL,
	"duration_label" text NOT NULL,
	"duration_hours" double precision NOT NULL,
	"distance_km" integer NOT NULL,
	"best_time" text NOT NULL,
	"from_price" integer NOT NULL,
	"group_size_max" integer NOT NULL,
	"meeting_point" text NOT NULL,
	"intro" text NOT NULL,
	"body" text[] DEFAULT '{}'::text[] NOT NULL,
	"highlights" text[] DEFAULT '{}'::text[] NOT NULL,
	"includes" text[] DEFAULT '{}'::text[] NOT NULL,
	"excludes" text[] DEFAULT '{}'::text[] NOT NULL,
	"hero_alt" text NOT NULL,
	"image" text,
	"featured" boolean DEFAULT false NOT NULL,
	"status" "publish_state" DEFAULT 'draft' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "activities_slug_unique" UNIQUE("slug"),
	CONSTRAINT "activities_distance_nonneg" CHECK ("activities"."distance_km" >= 0)
);
--> statement-breakpoint
CREATE TABLE "cafes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"locality" text NOT NULL,
	"blurb" text NOT NULL,
	"hero_alt" text NOT NULL,
	"image" text,
	"status" "publish_state" DEFAULT 'published' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cafes_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "departures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tour_id" uuid,
	"motorcycle_tour_id" uuid,
	"date" date NOT NULL,
	"end_date" date NOT NULL,
	"seats_left" integer NOT NULL,
	"per_person" integer NOT NULL,
	"was_per_person" integer,
	"status" "departure_status" DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "departures_exactly_one_parent" CHECK (("departures"."tour_id" is not null)::int + ("departures"."motorcycle_tour_id" is not null)::int = 1),
	CONSTRAINT "departures_seats_nonneg" CHECK ("departures"."seats_left" >= 0),
	CONSTRAINT "departures_dates_ordered" CHECK ("departures"."end_date" >= "departures"."date")
);
--> statement-breakpoint
CREATE TABLE "destinations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" "state_slug" NOT NULL,
	"name" text NOT NULL,
	"tagline" text NOT NULL,
	"intro" text NOT NULL,
	"body" text[] DEFAULT '{}'::text[] NOT NULL,
	"region" text NOT NULL,
	"tint" text NOT NULL,
	"requires_ilp" boolean DEFAULT false NOT NULL,
	"requires_pap" boolean DEFAULT false NOT NULL,
	"best_months" text[] DEFAULT '{}'::text[] NOT NULL,
	"gateway" text NOT NULL,
	"known_for" text[] DEFAULT '{}'::text[] NOT NULL,
	"hero_alt" text NOT NULL,
	"image" text,
	"status" "publish_state" DEFAULT 'published' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "destinations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "event_ticket_tiers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"name" text NOT NULL,
	"price" integer NOT NULL,
	"description" text NOT NULL,
	"remaining" integer,
	"perks" text[] DEFAULT '{}'::text[] NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "event_tiers_price_nonneg" CHECK ("event_ticket_tiers"."price" >= 0),
	CONSTRAINT "event_tiers_remaining_nonneg" CHECK ("event_ticket_tiers"."remaining" is null or "event_ticket_tiers"."remaining" >= 0)
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"strapline" text NOT NULL,
	"state" "state_slug" NOT NULL,
	"region" text NOT NULL,
	"venue" text NOT NULL,
	"locality" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"category" "event_category" NOT NULL,
	"from_price" integer NOT NULL,
	"intro" text NOT NULL,
	"body" text[] DEFAULT '{}'::text[] NOT NULL,
	"lineup" text[] DEFAULT '{}'::text[] NOT NULL,
	"hero_alt" text NOT NULL,
	"image" text,
	"featured" boolean DEFAULT false NOT NULL,
	"status" "publish_state" DEFAULT 'draft' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "events_slug_unique" UNIQUE("slug"),
	CONSTRAINT "events_dates_ordered" CHECK ("events"."end_date" >= "events"."start_date")
);
--> statement-breakpoint
CREATE TABLE "faqs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"topic" "faq_topic" NOT NULL,
	"status" "publish_state" DEFAULT 'published' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "homestay_rooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"homestay_id" uuid NOT NULL,
	"name" text NOT NULL,
	"sleeps" integer NOT NULL,
	"per_night" integer NOT NULL,
	"description" text NOT NULL,
	"amenities" text[] DEFAULT '{}'::text[] NOT NULL,
	"gallery" text[] DEFAULT '{}'::text[] NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "homestay_rooms_sleeps_positive" CHECK ("homestay_rooms"."sleeps" > 0),
	CONSTRAINT "homestay_rooms_rate_nonneg" CHECK ("homestay_rooms"."per_night" >= 0)
);
--> statement-breakpoint
CREATE TABLE "homestays" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"strapline" text NOT NULL,
	"state" "state_slug" NOT NULL,
	"region" text NOT NULL,
	"locality" text NOT NULL,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL,
	"from_price" integer,
	"max_guests" integer,
	"bedrooms" integer,
	"intro" text NOT NULL,
	"body" text[] DEFAULT '{}'::text[] NOT NULL,
	"host_name" text,
	"host_story" text,
	"amenities" text[] DEFAULT '{}'::text[] NOT NULL,
	"house_rules" text[] DEFAULT '{}'::text[] NOT NULL,
	"meals_included" "meal_plan",
	"rating" double precision,
	"review_count" integer,
	"hero_alt" text NOT NULL,
	"image" text,
	"gallery" text[] DEFAULT '{}'::text[] NOT NULL,
	"suitability" "suitability"[] DEFAULT '{}'::suitability[] NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"status" "publish_state" DEFAULT 'draft' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "homestays_slug_unique" UNIQUE("slug"),
	CONSTRAINT "homestays_price_nonneg" CHECK ("homestays"."from_price" is null or "homestays"."from_price" >= 0),
	CONSTRAINT "homestays_rating_range" CHECK ("homestays"."rating" is null or ("homestays"."rating" >= 0 and "homestays"."rating" <= 5)),
	CONSTRAINT "homestays_review_count_nonneg" CHECK ("homestays"."review_count" is null or "homestays"."review_count" >= 0)
);
--> statement-breakpoint
CREATE TABLE "journal_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"excerpt" text NOT NULL,
	"body" text[] DEFAULT '{}'::text[] NOT NULL,
	"published_at" date NOT NULL,
	"reading_minutes" integer NOT NULL,
	"author" text NOT NULL,
	"author_user_id" uuid,
	"region" text NOT NULL,
	"tag" text NOT NULL,
	"hero_alt" text NOT NULL,
	"image" text,
	"status" "publish_state" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "journal_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "motorcycle_tours" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"strapline" text NOT NULL,
	"states" "state_slug"[] DEFAULT '{}'::state_slug[] NOT NULL,
	"region" text NOT NULL,
	"nights" integer NOT NULL,
	"days" integer NOT NULL,
	"distance_km" integer NOT NULL,
	"max_altitude" integer NOT NULL,
	"from_price" integer NOT NULL,
	"pillion_price" integer NOT NULL,
	"intro" text NOT NULL,
	"terrain" text[] DEFAULT '{}'::text[] NOT NULL,
	"bikes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"support_vehicle" text[] DEFAULT '{}'::text[] NOT NULL,
	"highlights" text[] DEFAULT '{}'::text[] NOT NULL,
	"includes" text[] DEFAULT '{}'::text[] NOT NULL,
	"excludes" text[] DEFAULT '{}'::text[] NOT NULL,
	"itinerary" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"difficulty" "difficulty" NOT NULL,
	"group_size_max" integer NOT NULL,
	"starts_at" text NOT NULL,
	"ends_at" text NOT NULL,
	"requires_ilp" boolean DEFAULT false NOT NULL,
	"riding_experience" text NOT NULL,
	"hero_alt" text NOT NULL,
	"image" text,
	"featured" boolean DEFAULT false NOT NULL,
	"status" "publish_state" DEFAULT 'draft' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "motorcycle_tours_slug_unique" UNIQUE("slug"),
	CONSTRAINT "moto_price_nonneg" CHECK ("motorcycle_tours"."from_price" >= 0 and "motorcycle_tours"."pillion_price" >= 0)
);
--> statement-breakpoint
CREATE TABLE "policies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sections" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" "publish_state" DEFAULT 'published' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "policies_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "site_content" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"label" text NOT NULL,
	"description" text,
	"group" text DEFAULT 'general' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tours" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"strapline" text NOT NULL,
	"states" "state_slug"[] DEFAULT '{}'::state_slug[] NOT NULL,
	"region" text NOT NULL,
	"types" "tour_type"[] DEFAULT '{}'::tour_type[] NOT NULL,
	"nights" integer NOT NULL,
	"days" integer NOT NULL,
	"from_price" integer NOT NULL,
	"price_bands" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"single_supplement" integer,
	"intro" text NOT NULL,
	"highlights" text[] DEFAULT '{}'::text[] NOT NULL,
	"includes" text[] DEFAULT '{}'::text[] NOT NULL,
	"excludes" text[] DEFAULT '{}'::text[] NOT NULL,
	"itinerary" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"difficulty" "difficulty" NOT NULL,
	"group_size_max" integer NOT NULL,
	"starts_at" text NOT NULL,
	"ends_at" text NOT NULL,
	"requires_ilp" boolean DEFAULT false NOT NULL,
	"hero_alt" text NOT NULL,
	"image" text,
	"featured" boolean DEFAULT false NOT NULL,
	"status" "publish_state" DEFAULT 'draft' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tours_slug_unique" UNIQUE("slug"),
	CONSTRAINT "tours_price_nonneg" CHECK ("tours"."from_price" >= 0),
	CONSTRAINT "tours_nights_positive" CHECK ("tours"."nights" > 0)
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference" text NOT NULL,
	"user_id" uuid,
	"kind" "booking_kind" NOT NULL,
	"tour_id" uuid,
	"motorcycle_tour_id" uuid,
	"homestay_id" uuid,
	"event_id" uuid,
	"departure_id" uuid,
	"title" text NOT NULL,
	"item_slug" text NOT NULL,
	"region" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"travellers" integer NOT NULL,
	"total" integer NOT NULL,
	"deposit" integer DEFAULT 0 NOT NULL,
	"amount_paid" integer DEFAULT 0 NOT NULL,
	"lead_name" text NOT NULL,
	"lead_email" text NOT NULL,
	"lead_phone" text NOT NULL,
	"companions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"traveller_notes" text,
	"status" "booking_status" DEFAULT 'pending-payment' NOT NULL,
	"staff_notes" text,
	"booked_at" timestamp with time zone DEFAULT now() NOT NULL,
	"cancelled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bookings_reference_unique" UNIQUE("reference"),
	CONSTRAINT "bookings_travellers_positive" CHECK ("bookings"."travellers" > 0),
	CONSTRAINT "bookings_total_nonneg" CHECK ("bookings"."total" >= 0),
	CONSTRAINT "bookings_paid_within_total" CHECK ("bookings"."amount_paid" >= 0 and "bookings"."amount_paid" <= "bookings"."total"),
	CONSTRAINT "bookings_dates_ordered" CHECK ("bookings"."end_date" >= "bookings"."start_date"),
	CONSTRAINT "bookings_product_matches_kind" CHECK (case "bookings"."kind"
            when 'tour'  then "bookings"."tour_id" is not null
            when 'moto'  then "bookings"."motorcycle_tour_id" is not null
            when 'stay'  then "bookings"."homestay_id" is not null
            when 'event' then "bookings"."event_id" is not null
          end)
);
--> statement-breakpoint
CREATE TABLE "enquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" uuid,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"state" "state_slug",
	"month" text,
	"party_size" integer,
	"message" text NOT NULL,
	"source" text DEFAULT 'contact' NOT NULL,
	"status" "enquiry_status" DEFAULT 'new' NOT NULL,
	"assigned_to_user_id" uuid,
	"staff_notes" text,
	"handled_at" timestamp with time zone,
	CONSTRAINT "enquiries_party_size_positive" CHECK ("enquiries"."party_size" is null or "enquiries"."party_size" > 0)
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"method" text NOT NULL,
	"external_reference" text,
	"note" text,
	"recorded_by_user_id" uuid,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payments_amount_nonzero" CHECK ("payments"."amount" <> 0)
);
--> statement-breakpoint
CREATE TABLE "permits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference" text NOT NULL,
	"user_id" uuid,
	"booking_id" uuid,
	"state" "state_slug" NOT NULL,
	"kind" "permit_kind" NOT NULL,
	"traveller_name" text NOT NULL,
	"valid_from" date NOT NULL,
	"valid_to" date NOT NULL,
	"status" "permit_status" DEFAULT 'draft' NOT NULL,
	"submitted_at" timestamp with time zone,
	"decided_at" timestamp with time zone,
	"rejection_reason" text,
	"staff_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "permits_reference_unique" UNIQUE("reference"),
	CONSTRAINT "permits_dates_ordered" CHECK ("permits"."valid_to" >= "permits"."valid_from")
);
--> statement-breakpoint
CREATE TABLE "trip_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reference" text NOT NULL,
	"user_id" uuid,
	"state" "state_slug" NOT NULL,
	"state_name" text NOT NULL,
	"party" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"nights" integer NOT NULL,
	"adults" integer NOT NULL,
	"children" integer DEFAULT 0 NOT NULL,
	"child_ages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"lead_name" text NOT NULL,
	"lead_email" text NOT NULL,
	"lead_phone" text NOT NULL,
	"companions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"traveller_notes" text,
	"selections" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"plan" jsonb NOT NULL,
	"total" integer NOT NULL,
	"deposit" integer DEFAULT 0 NOT NULL,
	"status" "trip_request_status" DEFAULT 'new' NOT NULL,
	"assigned_to_user_id" uuid,
	"staff_notes" text,
	"handled_at" timestamp with time zone,
	"booking_id" uuid,
	CONSTRAINT "trip_requests_reference_unique" UNIQUE("reference"),
	CONSTRAINT "trip_requests_nights_positive" CHECK ("trip_requests"."nights" > 0),
	CONSTRAINT "trip_requests_adults_positive" CHECK ("trip_requests"."adults" > 0),
	CONSTRAINT "trip_requests_children_nonneg" CHECK ("trip_requests"."children" >= 0),
	CONSTRAINT "trip_requests_total_nonneg" CHECK ("trip_requests"."total" >= 0),
	CONSTRAINT "trip_requests_dates_ordered" CHECK ("trip_requests"."end_date" >= "trip_requests"."start_date")
);
--> statement-breakpoint
CREATE TABLE "amenities" (
	"key" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"icon" text,
	"group" text DEFAULT 'general' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "day_templates" (
	"key" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"data" jsonb NOT NULL,
	"status" "publish_state" DEFAULT 'published' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gateway_points" (
	"key" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"state" "state_slug",
	"data" jsonb NOT NULL,
	"status" "publish_state" DEFAULT 'published' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "local_guides" (
	"state" "state_slug" PRIMARY KEY NOT NULL,
	"intro" text,
	"places" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" "publish_state" DEFAULT 'published' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "place_options" (
	"place" text PRIMARY KEY NOT NULL,
	"state" "state_slug",
	"stays" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"activities" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"transfers" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" "publish_state" DEFAULT 'published' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quote_terms" (
	"key" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"items" text[] DEFAULT '{}'::text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "routes" (
	"state" "state_slug" PRIMARY KEY NOT NULL,
	"legs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"max_days" integer NOT NULL,
	"status" "publish_state" DEFAULT 'published' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_user_id" uuid,
	"actor_email" text,
	"action" text NOT NULL,
	"entity" text NOT NULL,
	"entity_id" text,
	"entity_label" text,
	"before" jsonb,
	"after" jsonb,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"path" text NOT NULL,
	"original_filename" text NOT NULL,
	"mime_type" text NOT NULL,
	"byte_size" integer NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"alt" text NOT NULL,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"variant_widths" integer[] DEFAULT '{}'::int[] NOT NULL,
	"uploaded_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_path_unique" UNIQUE("path")
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "departures" ADD CONSTRAINT "departures_tour_id_tours_id_fk" FOREIGN KEY ("tour_id") REFERENCES "public"."tours"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "departures" ADD CONSTRAINT "departures_motorcycle_tour_id_motorcycle_tours_id_fk" FOREIGN KEY ("motorcycle_tour_id") REFERENCES "public"."motorcycle_tours"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_ticket_tiers" ADD CONSTRAINT "event_ticket_tiers_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "homestay_rooms" ADD CONSTRAINT "homestay_rooms_homestay_id_homestays_id_fk" FOREIGN KEY ("homestay_id") REFERENCES "public"."homestays"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_posts" ADD CONSTRAINT "journal_posts_author_user_id_users_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_tour_id_tours_id_fk" FOREIGN KEY ("tour_id") REFERENCES "public"."tours"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_motorcycle_tour_id_motorcycle_tours_id_fk" FOREIGN KEY ("motorcycle_tour_id") REFERENCES "public"."motorcycle_tours"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_homestay_id_homestays_id_fk" FOREIGN KEY ("homestay_id") REFERENCES "public"."homestays"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_departure_id_departures_id_fk" FOREIGN KEY ("departure_id") REFERENCES "public"."departures"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_assigned_to_user_id_users_id_fk" FOREIGN KEY ("assigned_to_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_recorded_by_user_id_users_id_fk" FOREIGN KEY ("recorded_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "permits" ADD CONSTRAINT "permits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "permits" ADD CONSTRAINT "permits_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_requests" ADD CONSTRAINT "trip_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_requests" ADD CONSTRAINT "trip_requests_assigned_to_user_id_users_id_fk" FOREIGN KEY ("assigned_to_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_requests" ADD CONSTRAINT "trip_requests_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_uploaded_by_user_id_users_id_fk" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accounts_user_id_idx" ON "accounts" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "activities_status_idx" ON "activities" USING btree ("status","sort_order");--> statement-breakpoint
CREATE INDEX "activities_category_idx" ON "activities" USING btree ("category");--> statement-breakpoint
CREATE INDEX "cafes_status_idx" ON "cafes" USING btree ("status","sort_order");--> statement-breakpoint
CREATE INDEX "departures_tour_idx" ON "departures" USING btree ("tour_id","date");--> statement-breakpoint
CREATE INDEX "departures_moto_idx" ON "departures" USING btree ("motorcycle_tour_id","date");--> statement-breakpoint
CREATE INDEX "departures_date_idx" ON "departures" USING btree ("date");--> statement-breakpoint
CREATE INDEX "destinations_status_idx" ON "destinations" USING btree ("status","sort_order");--> statement-breakpoint
CREATE INDEX "event_tiers_event_idx" ON "event_ticket_tiers" USING btree ("event_id","sort_order");--> statement-breakpoint
CREATE INDEX "events_status_idx" ON "events" USING btree ("status","start_date");--> statement-breakpoint
CREATE INDEX "events_start_date_idx" ON "events" USING btree ("start_date");--> statement-breakpoint
CREATE INDEX "faqs_topic_idx" ON "faqs" USING btree ("topic","sort_order");--> statement-breakpoint
CREATE INDEX "homestay_rooms_homestay_idx" ON "homestay_rooms" USING btree ("homestay_id","sort_order");--> statement-breakpoint
CREATE INDEX "homestays_status_idx" ON "homestays" USING btree ("status","sort_order");--> statement-breakpoint
CREATE INDEX "homestays_state_idx" ON "homestays" USING btree ("state");--> statement-breakpoint
CREATE INDEX "homestays_from_price_idx" ON "homestays" USING btree ("from_price");--> statement-breakpoint
CREATE INDEX "journal_status_idx" ON "journal_posts" USING btree ("status","published_at");--> statement-breakpoint
CREATE INDEX "moto_status_idx" ON "motorcycle_tours" USING btree ("status","sort_order");--> statement-breakpoint
CREATE INDEX "moto_from_price_idx" ON "motorcycle_tours" USING btree ("from_price");--> statement-breakpoint
CREATE INDEX "site_content_group_idx" ON "site_content" USING btree ("group","sort_order");--> statement-breakpoint
CREATE INDEX "tours_status_idx" ON "tours" USING btree ("status","sort_order");--> statement-breakpoint
CREATE INDEX "tours_from_price_idx" ON "tours" USING btree ("from_price");--> statement-breakpoint
CREATE INDEX "tours_featured_idx" ON "tours" USING btree ("featured");--> statement-breakpoint
CREATE INDEX "bookings_user_idx" ON "bookings" USING btree ("user_id","booked_at");--> statement-breakpoint
CREATE INDEX "bookings_status_idx" ON "bookings" USING btree ("status","booked_at");--> statement-breakpoint
CREATE INDEX "bookings_start_date_idx" ON "bookings" USING btree ("start_date");--> statement-breakpoint
CREATE INDEX "bookings_lead_email_idx" ON "bookings" USING btree ("lead_email");--> statement-breakpoint
CREATE INDEX "enquiries_created_at_idx" ON "enquiries" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "enquiries_status_idx" ON "enquiries" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "enquiries_email_idx" ON "enquiries" USING btree ("email");--> statement-breakpoint
CREATE INDEX "payments_booking_idx" ON "payments" USING btree ("booking_id","received_at");--> statement-breakpoint
CREATE INDEX "permits_user_idx" ON "permits" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "permits_status_idx" ON "permits" USING btree ("status","valid_from");--> statement-breakpoint
CREATE INDEX "permits_booking_idx" ON "permits" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "trip_requests_created_at_idx" ON "trip_requests" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "trip_requests_status_idx" ON "trip_requests" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "trip_requests_start_date_idx" ON "trip_requests" USING btree ("start_date");--> statement-breakpoint
CREATE INDEX "gateway_points_state_idx" ON "gateway_points" USING btree ("state");--> statement-breakpoint
CREATE INDEX "place_options_state_idx" ON "place_options" USING btree ("state");--> statement-breakpoint
CREATE INDEX "audit_log_entity_idx" ON "audit_log" USING btree ("entity","entity_id","created_at");--> statement-breakpoint
CREATE INDEX "audit_log_actor_idx" ON "audit_log" USING btree ("actor_user_id","created_at");--> statement-breakpoint
CREATE INDEX "audit_log_created_idx" ON "audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "media_tags_idx" ON "media" USING btree ("tags");--> statement-breakpoint
CREATE INDEX "media_created_idx" ON "media" USING btree ("created_at");