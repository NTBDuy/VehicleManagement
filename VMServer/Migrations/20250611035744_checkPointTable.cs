using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VMServer.Migrations
{
    /// <inheritdoc />
    public partial class checkPointTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CheckPoints",
                columns: table => new
                {
                    CheckPointId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RequestId = table.Column<int>(type: "int", nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    Latitude = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Longitude = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Note = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedBy = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CheckPoints", x => x.CheckPointId);
                });

            migrationBuilder.CreateTable(
                name: "CheckPointPhotos",
                columns: table => new
                {
                    PhotoId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CheckPointId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FilePath = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CheckPointPhotos", x => x.PhotoId);
                    table.ForeignKey(
                        name: "FK_CheckPointPhotos_CheckPoints_CheckPointId",
                        column: x => x.CheckPointId,
                        principalTable: "CheckPoints",
                        principalColumn: "CheckPointId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CheckPointPhotos_CheckPointId",
                table: "CheckPointPhotos",
                column: "CheckPointId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CheckPointPhotos");

            migrationBuilder.DropTable(
                name: "CheckPoints");
        }
    }
}
