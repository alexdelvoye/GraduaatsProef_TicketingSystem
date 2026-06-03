using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

using Persistence.Data;

#nullable disable

namespace _3_Persistence.Migrations
{
    /// <inheritdoc />
    [DbContext(typeof(AppDbContext))]
    [Migration("20260603020000_RenameTicketWorkflowStatuses")]
    public partial class RenameTicketWorkflowStatuses : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Status is stored as a string enum value. The schema stays the
            // same, but existing rows need to follow the new workflow wording:
            // old Open becomes New, old InProgress becomes Open.
            migrationBuilder.Sql(
                """
                UPDATE Tickets
                SET Status = 'New'
                WHERE Status = 'Open'
                """);

            migrationBuilder.Sql(
                """
                UPDATE Tickets
                SET Status = 'Open'
                WHERE Status = 'InProgress'
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Rollback restores the old stored enum values.
            migrationBuilder.Sql(
                """
                UPDATE Tickets
                SET Status = 'InProgress'
                WHERE Status = 'Open'
                """);

            migrationBuilder.Sql(
                """
                UPDATE Tickets
                SET Status = 'Open'
                WHERE Status = 'New'
                """);
        }
    }
}
