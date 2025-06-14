using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VMServer.Migrations
{
    /// <inheritdoc />
    public partial class appsetting : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Requests_ActionBy",
                table: "Requests");

            migrationBuilder.DropIndex(
                name: "IX_Requests_UserId",
                table: "Requests");

            migrationBuilder.DropIndex(
                name: "IX_Requests_VehicleId",
                table: "Requests");

            migrationBuilder.DropIndex(
                name: "IX_Notifications_UserId",
                table: "Notifications");

            migrationBuilder.RenameIndex(
                name: "IX_MaintenanceSchedules_VehicleId",
                table: "MaintenanceSchedules",
                newName: "IX_MaintenanceSchedule_VehicleId");

            migrationBuilder.RenameIndex(
                name: "IX_Assignments_RequestId",
                table: "Assignments",
                newName: "IX_Assignment_RequestId");

            migrationBuilder.CreateTable(
                name: "AppSettings",
                columns: table => new
                {
                    SettingId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SettingKey = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    SettingValue = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    SettingType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppSettings", x => x.SettingId);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Vehicle_Status",
                table: "Vehicles",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_User_Role",
                table: "Users",
                column: "Role");

            migrationBuilder.CreateIndex(
                name: "IX_Request_ActionBy_Status",
                table: "Requests",
                columns: new[] { "ActionBy", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Request_Status_EndTime",
                table: "Requests",
                columns: new[] { "Status", "EndTime" });

            migrationBuilder.CreateIndex(
                name: "IX_Request_Status_LastUpdateAt",
                table: "Requests",
                columns: new[] { "Status", "LastUpdateAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Request_Status_StartTime_EndTime",
                table: "Requests",
                columns: new[] { "Status", "StartTime", "EndTime" })
                .Annotation("SqlServer:Include", new[] { "VehicleId" });

            migrationBuilder.CreateIndex(
                name: "IX_Request_UserId_Status",
                table: "Requests",
                columns: new[] { "UserId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Request_VehicleId_Status",
                table: "Requests",
                columns: new[] { "VehicleId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Request_VehicleId_Status_StartTime",
                table: "Requests",
                columns: new[] { "VehicleId", "Status", "StartTime" });

            migrationBuilder.CreateIndex(
                name: "IX_Request_VehicleId_TimeRange",
                table: "Requests",
                columns: new[] { "VehicleId", "StartTime", "EndTime" });

            migrationBuilder.CreateIndex(
                name: "IX_Notification_UserId_Type_CreatedAt",
                table: "Notifications",
                columns: new[] { "UserId", "Type", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_MaintenanceSchedule_VehicleId_Status",
                table: "MaintenanceSchedules",
                columns: new[] { "VehicleId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_CheckPoint_RequestId_CheckPointId",
                table: "CheckPoints",
                columns: new[] { "RequestId", "CheckPointId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppSettings");

            migrationBuilder.DropIndex(
                name: "IX_Vehicle_Status",
                table: "Vehicles");

            migrationBuilder.DropIndex(
                name: "IX_User_Role",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Request_ActionBy_Status",
                table: "Requests");

            migrationBuilder.DropIndex(
                name: "IX_Request_Status_EndTime",
                table: "Requests");

            migrationBuilder.DropIndex(
                name: "IX_Request_Status_LastUpdateAt",
                table: "Requests");

            migrationBuilder.DropIndex(
                name: "IX_Request_Status_StartTime_EndTime",
                table: "Requests");

            migrationBuilder.DropIndex(
                name: "IX_Request_UserId_Status",
                table: "Requests");

            migrationBuilder.DropIndex(
                name: "IX_Request_VehicleId_Status",
                table: "Requests");

            migrationBuilder.DropIndex(
                name: "IX_Request_VehicleId_Status_StartTime",
                table: "Requests");

            migrationBuilder.DropIndex(
                name: "IX_Request_VehicleId_TimeRange",
                table: "Requests");

            migrationBuilder.DropIndex(
                name: "IX_Notification_UserId_Type_CreatedAt",
                table: "Notifications");

            migrationBuilder.DropIndex(
                name: "IX_MaintenanceSchedule_VehicleId_Status",
                table: "MaintenanceSchedules");

            migrationBuilder.DropIndex(
                name: "IX_CheckPoint_RequestId_CheckPointId",
                table: "CheckPoints");

            migrationBuilder.RenameIndex(
                name: "IX_MaintenanceSchedule_VehicleId",
                table: "MaintenanceSchedules",
                newName: "IX_MaintenanceSchedules_VehicleId");

            migrationBuilder.RenameIndex(
                name: "IX_Assignment_RequestId",
                table: "Assignments",
                newName: "IX_Assignments_RequestId");

            migrationBuilder.CreateIndex(
                name: "IX_Requests_ActionBy",
                table: "Requests",
                column: "ActionBy");

            migrationBuilder.CreateIndex(
                name: "IX_Requests_UserId",
                table: "Requests",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Requests_VehicleId",
                table: "Requests",
                column: "VehicleId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserId",
                table: "Notifications",
                column: "UserId");
        }
    }
}
