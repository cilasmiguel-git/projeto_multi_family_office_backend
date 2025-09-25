/*
  Warnings:

  - You are about to alter the column `value` on the `AllocationRecord` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(18,2)`.
  - You are about to alter the column `monthlyPremium` on the `InsurancePolicy` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(18,2)`.
  - You are about to alter the column `insuredAmount` on the `InsurancePolicy` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(18,2)`.
  - You are about to alter the column `amount` on the `Movement` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(18,2)`.
  - A unique constraint covering the columns `[allocationId,date]` on the table `AllocationRecord` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[document]` on the table `Client` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[simulationId,version]` on the table `SimulationVersion` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Allocation" DROP CONSTRAINT "Allocation_simulationVersionId_fkey";

-- DropForeignKey
ALTER TABLE "AllocationRecord" DROP CONSTRAINT "AllocationRecord_allocationId_fkey";

-- DropForeignKey
ALTER TABLE "InsurancePolicy" DROP CONSTRAINT "InsurancePolicy_simulationVersionId_fkey";

-- DropForeignKey
ALTER TABLE "Movement" DROP CONSTRAINT "Movement_simulationVersionId_fkey";

-- DropForeignKey
ALTER TABLE "Simulation" DROP CONSTRAINT "Simulation_clientId_fkey";

-- DropForeignKey
ALTER TABLE "SimulationVersion" DROP CONSTRAINT "SimulationVersion_simulationId_fkey";

-- AlterTable
ALTER TABLE "AllocationRecord" ALTER COLUMN "value" SET DATA TYPE DECIMAL(18,2);

-- AlterTable
ALTER TABLE "InsurancePolicy" ALTER COLUMN "monthlyPremium" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "insuredAmount" SET DATA TYPE DECIMAL(18,2);

-- AlterTable
ALTER TABLE "Movement" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(18,2);

-- CreateIndex
CREATE INDEX "Allocation_simulationVersionId_type_idx" ON "Allocation"("simulationVersionId", "type");

-- CreateIndex
CREATE INDEX "Allocation_name_idx" ON "Allocation"("name");

-- CreateIndex
CREATE INDEX "AllocationRecord_allocationId_date_idx" ON "AllocationRecord"("allocationId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "AllocationRecord_allocationId_date_key" ON "AllocationRecord"("allocationId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Client_document_key" ON "Client"("document");

-- CreateIndex
CREATE INDEX "Client_name_idx" ON "Client"("name");

-- CreateIndex
CREATE INDEX "InsurancePolicy_simulationVersionId_type_idx" ON "InsurancePolicy"("simulationVersionId", "type");

-- CreateIndex
CREATE INDEX "InsurancePolicy_name_idx" ON "InsurancePolicy"("name");

-- CreateIndex
CREATE INDEX "Movement_simulationVersionId_type_idx" ON "Movement"("simulationVersionId", "type");

-- CreateIndex
CREATE INDEX "Movement_startDate_endDate_idx" ON "Movement"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "Simulation_clientId_name_idx" ON "Simulation"("clientId", "name");

-- CreateIndex
CREATE INDEX "SimulationVersion_simulationId_isCurrentSnapshot_idx" ON "SimulationVersion"("simulationId", "isCurrentSnapshot");

-- CreateIndex
CREATE UNIQUE INDEX "SimulationVersion_simulationId_version_key" ON "SimulationVersion"("simulationId", "version");

-- AddForeignKey
ALTER TABLE "Simulation" ADD CONSTRAINT "Simulation_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulationVersion" ADD CONSTRAINT "SimulationVersion_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "Simulation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulationVersion" ADD CONSTRAINT "SimulationVersion_copiedFromVersionId_fkey" FOREIGN KEY ("copiedFromVersionId") REFERENCES "SimulationVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Allocation" ADD CONSTRAINT "Allocation_simulationVersionId_fkey" FOREIGN KEY ("simulationVersionId") REFERENCES "SimulationVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AllocationRecord" ADD CONSTRAINT "AllocationRecord_allocationId_fkey" FOREIGN KEY ("allocationId") REFERENCES "Allocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movement" ADD CONSTRAINT "Movement_simulationVersionId_fkey" FOREIGN KEY ("simulationVersionId") REFERENCES "SimulationVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsurancePolicy" ADD CONSTRAINT "InsurancePolicy_simulationVersionId_fkey" FOREIGN KEY ("simulationVersionId") REFERENCES "SimulationVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
