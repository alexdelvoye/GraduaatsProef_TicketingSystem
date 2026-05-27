using System;

using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

using Persistence.Data;

#nullable disable

namespace _3_Persistence.Migrations
{
    /// <inheritdoc />
    [DbContext(typeof(AppDbContext))]
    [Migration("20260527030000_MoveTicketDescriptionToInitialMessage")]
    public partial class MoveTicketDescriptionToInitialMessage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Existing databases still have Tickets.Description. Before dropping
            // that column, copy each description into TicketMessages so the
            // original client text becomes the first conversation message.
            migrationBuilder.Sql(
                """
                INSERT INTO TicketMessages (Id, TicketId, SenderId, Message, CreatedAt)
                SELECT UUID(), Id, ClientId, Description, CreatedAt
                FROM Tickets
                WHERE Description IS NOT NULL AND Description <> ''
                """);

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Tickets");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Tickets",
                type: "varchar(3000)",
                maxLength: 3000,
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");

            // If the migration is rolled back, rebuild Description from the
            // first message in the conversation.
            migrationBuilder.Sql(
                """
                UPDATE Tickets t
                SET Description = COALESCE((
                    SELECT tm.Message
                    FROM TicketMessages tm
                    WHERE tm.TicketId = t.Id
                    ORDER BY tm.CreatedAt
                    LIMIT 1
                ), '')
                """);
        }
    }
}
