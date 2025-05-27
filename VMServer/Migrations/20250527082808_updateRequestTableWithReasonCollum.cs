using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VMServer.Migrations
{
    /// <inheritdoc />
    public partial class updateRequestTableWithReasonCollum : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "CancellationReason",
                table: "Requests",
                newName: "CancelOrRejectReason");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "CancelOrRejectReason",
                table: "Requests",
                newName: "CancellationReason");
        }
    }
}
