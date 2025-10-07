/*
  Warnings:

  - A unique constraint covering the columns `[datasetName]` on the table `DatasetMaster` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "DatasetMaster_datasetName_key" ON "DatasetMaster"("datasetName");
