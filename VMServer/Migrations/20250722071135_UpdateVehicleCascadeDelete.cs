using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VMServer.Migrations
{
    /// <inheritdoc />
    public partial class UpdateVehicleCascadeDelete : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MaintenanceSchedules_Vehicles_VehicleId",
                table: "MaintenanceSchedules");

            migrationBuilder.AddForeignKey(
                name: "FK_MaintenanceSchedules_Vehicles_VehicleId",
                table: "MaintenanceSchedules",
                column: "VehicleId",
                principalTable: "Vehicles",
                principalColumn: "VehicleId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MaintenanceSchedules_Vehicles_VehicleId",
                table: "MaintenanceSchedules");

            migrationBuilder.AddForeignKey(
                name: "FK_MaintenanceSchedules_Vehicles_VehicleId",
                table: "MaintenanceSchedules",
                column: "VehicleId",
                principalTable: "Vehicles",
                principalColumn: "VehicleId",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
