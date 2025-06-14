using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VMServer.Migrations
{
    /// <inheritdoc />
    public partial class appsettingDefaultValue : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "AppSettings",
                columns: new[] { "SettingId", "CreatedAt", "Description", "SettingKey", "SettingType", "SettingValue", "UpdatedAt" },
                values: new object[] { 1, new DateTime(2025, 6, 14, 22, 59, 50, 95, DateTimeKind.Local).AddTicks(5430), "Bán kính check-in tính bằng KM", "CHECK_IN_RADIUS", "NUMBER", "5", new DateTime(2025, 6, 14, 22, 59, 50, 107, DateTimeKind.Local).AddTicks(700) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AppSettings",
                keyColumn: "SettingId",
                keyValue: 1);
        }
    }
}
