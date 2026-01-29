-- AlterTable
-- Add allowedWeekdays field to resources table for day-of-week booking restrictions
-- 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday

ALTER TABLE "resources" ADD COLUMN "allowedWeekdays" INTEGER[] DEFAULT ARRAY[0, 1, 2, 3, 4, 5, 6];
