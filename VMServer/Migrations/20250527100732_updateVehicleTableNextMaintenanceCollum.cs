using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VMServer.Migrations
{
    /// <inheritdoc />
    public partial class updateVehicleTableNextMaintenanceCollum : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Vehicles_MaintenanceSchedules_NextMaintenanceId",
                table: "Vehicles");

            migrationBuilder.DropIndex(
                name: "IX_Vehicles_NextMaintenanceId",
                table: "Vehicles");

            migrationBuilder.AddColumn<DateTime>(
                name: "NextMaintenance",
                table: "Vehicles",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NextMaintenance",
                table: "Vehicles");

            migrationBuilder.CreateIndex(
                name: "IX_Vehicles_NextMaintenanceId",
                table: "Vehicles",
                column: "NextMaintenanceId",
                unique: true,
                filter: "[NextMaintenanceId] IS NOT NULL");

            migrationBuilder.AddForeignKey(
                name: "FK_Vehicles_MaintenanceSchedules_NextMaintenanceId",
                table: "Vehicles",
                column: "NextMaintenanceId",
                principalTable: "MaintenanceSchedules",
                principalColumn: "MaintenanceId");
        }
    }
}
