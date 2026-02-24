-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('user', 'artist', 'organizer', 'enthusiast', 'collaborator', 'networker', 'admin');

-- CreateEnum
CREATE TYPE "application_status" AS ENUM ('pending', 'accepted', 'rejected');

-- CreateEnum
CREATE TYPE "notification_type" AS ENUM ('application_submitted', 'application_status', 'new_message', 'event_update', 'system');

-- CreateEnum
CREATE TYPE "payment_type" AS ENUM ('fixed', 'hourly');

-- CreateEnum
CREATE TYPE "event_status" AS ENUM ('open', 'closed', 'filled', 'cancelled', 'completed');

-- CreateEnum
CREATE TYPE "message_status" AS ENUM ('sent', 'delivered', 'read');

-- CreateEnum
CREATE TYPE "entity_type" AS ENUM ('artist_profile', 'event_posting');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "location" TEXT,
    "bio" TEXT,
    "roles" "user_role"[] DEFAULT ARRAY['user']::"user_role"[],
    "onboarding_step" INTEGER NOT NULL DEFAULT 0,
    "onboarding_complete" BOOLEAN NOT NULL DEFAULT false,
    "profile_image" TEXT,
    "preferences" JSONB,
    "location_details" JSONB,
    "notification_preferences" JSONB,
    "privacy_settings" JSONB,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "reset_password_token" TEXT,
    "reset_password_expires" TIMESTAMP(3),
    "email_verification_token" TEXT,
    "email_verification_expires" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artist_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "stage_name" TEXT NOT NULL,
    "biography" TEXT,
    "instruments" TEXT[],
    "years_of_experience" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "website_url" TEXT,
    "social_media_links" JSONB,
    "profile_image" TEXT,
    "portfolio_items" JSONB,
    "availability" JSONB,
    "rate_per_hour" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "artist_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_postings" (
    "id" TEXT NOT NULL,
    "organizer_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "required_instruments" TEXT[],
    "location" TEXT NOT NULL,
    "venue" TEXT,
    "event_date" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "payment_amount" DECIMAL(10,2) NOT NULL,
    "payment_type" "payment_type" NOT NULL,
    "required_experience" INTEGER NOT NULL DEFAULT 0,
    "application_deadline" TIMESTAMP(3) NOT NULL,
    "status" "event_status" NOT NULL DEFAULT 'open',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_postings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "applicant_id" TEXT NOT NULL,
    "artist_profile_id" TEXT NOT NULL,
    "event_posting_id" TEXT NOT NULL,
    "cover_letter" TEXT NOT NULL,
    "status" "application_status" NOT NULL DEFAULT 'pending',
    "proposed_rate" DOUBLE PRECISION,
    "availability" TIMESTAMP(3)[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "entity1_id" TEXT NOT NULL,
    "entity1_type" "entity_type" NOT NULL,
    "entity2_id" TEXT NOT NULL,
    "entity2_type" "entity_type" NOT NULL,
    "last_message_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "sender_entity_id" TEXT NOT NULL,
    "sender_entity_type" "entity_type" NOT NULL,
    "content" TEXT,
    "attachment_url" TEXT,
    "attachment_type" TEXT,
    "status" "message_status" NOT NULL DEFAULT 'sent',
    "reactions" JSONB,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "recipient_id" TEXT NOT NULL,
    "type" "notification_type" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "related_event_id" TEXT,
    "related_application_id" TEXT,
    "related_conversation_id" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "genres" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "genres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ArtistProfileGenres" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ArtistProfileGenres_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_EventLineup" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EventLineup_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_EventPostingGenres" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EventPostingGenres_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "artist_profiles_user_id_key" ON "artist_profiles"("user_id");

-- CreateIndex
CREATE INDEX "artist_profiles_user_id_idx" ON "artist_profiles"("user_id");

-- CreateIndex
CREATE INDEX "event_postings_organizer_id_status_event_date_idx" ON "event_postings"("organizer_id", "status", "event_date");

-- CreateIndex
CREATE INDEX "applications_event_posting_id_status_idx" ON "applications"("event_posting_id", "status");

-- CreateIndex
CREATE INDEX "applications_artist_profile_id_status_idx" ON "applications"("artist_profile_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "applications_event_posting_id_artist_profile_id_key" ON "applications"("event_posting_id", "artist_profile_id");

-- CreateIndex
CREATE INDEX "conversations_entity1_id_entity2_id_idx" ON "conversations"("entity1_id", "entity2_id");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_entity1_id_entity1_type_entity2_id_entity2_ty_key" ON "conversations"("entity1_id", "entity1_type", "entity2_id", "entity2_type");

-- CreateIndex
CREATE INDEX "messages_conversation_id_created_at_idx" ON "messages"("conversation_id", "created_at");

-- CreateIndex
CREATE INDEX "notifications_recipient_id_read_created_at_idx" ON "notifications"("recipient_id", "read", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "genres_name_key" ON "genres"("name");

-- CreateIndex
CREATE INDEX "_ArtistProfileGenres_B_index" ON "_ArtistProfileGenres"("B");

-- CreateIndex
CREATE INDEX "_EventLineup_B_index" ON "_EventLineup"("B");

-- CreateIndex
CREATE INDEX "_EventPostingGenres_B_index" ON "_EventPostingGenres"("B");

-- AddForeignKey
ALTER TABLE "artist_profiles" ADD CONSTRAINT "artist_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_postings" ADD CONSTRAINT "event_postings_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_applicant_id_fkey" FOREIGN KEY ("applicant_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_artist_profile_id_fkey" FOREIGN KEY ("artist_profile_id") REFERENCES "artist_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_event_posting_id_fkey" FOREIGN KEY ("event_posting_id") REFERENCES "event_postings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArtistProfileGenres" ADD CONSTRAINT "_ArtistProfileGenres_A_fkey" FOREIGN KEY ("A") REFERENCES "artist_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArtistProfileGenres" ADD CONSTRAINT "_ArtistProfileGenres_B_fkey" FOREIGN KEY ("B") REFERENCES "genres"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventLineup" ADD CONSTRAINT "_EventLineup_A_fkey" FOREIGN KEY ("A") REFERENCES "artist_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventLineup" ADD CONSTRAINT "_EventLineup_B_fkey" FOREIGN KEY ("B") REFERENCES "event_postings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventPostingGenres" ADD CONSTRAINT "_EventPostingGenres_A_fkey" FOREIGN KEY ("A") REFERENCES "event_postings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventPostingGenres" ADD CONSTRAINT "_EventPostingGenres_B_fkey" FOREIGN KEY ("B") REFERENCES "genres"("id") ON DELETE CASCADE ON UPDATE CASCADE;

