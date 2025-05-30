using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VMServer.Migrations
{
    /// <inheritdoc />
    public partial class updateMaintenanceVehicleTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CreateAt",
                table: "MaintenanceSchedules",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "LastUpdateAt",
                table: "MaintenanceSchedules",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "MaintenanceSchedules",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreateAt",
                table: "MaintenanceSchedules");

            migrationBuilder.DropColumn(
                name: "LastUpdateAt",
                table: "MaintenanceSchedules");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "MaintenanceSchedules");
        }
    }
}
