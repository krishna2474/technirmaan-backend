-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "maxPlayers" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "price" TEXT NOT NULL DEFAULT '50';
