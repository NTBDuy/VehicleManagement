using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VMServer.Migrations
{
    /// <inheritdoc />
    public partial class updateVehicleTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "NextMaintenanceId",
                table: "Vehicles",
                type: "int",
                nullable: true);

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Vehicles_MaintenanceSchedules_NextMaintenanceId",
                table: "Vehicles");

            migrationBuilder.DropIndex(
                name: "IX_Vehicles_NextMaintenanceId",
                table: "Vehicles");

            migrationBuilder.DropColumn(
                name: "NextMaintenanceId",
                table: "Vehicles");
        }
    }
}
