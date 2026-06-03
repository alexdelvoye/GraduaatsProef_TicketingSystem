using Domain.Entities;
using Domain.Enums;

namespace Domain.Rules;

// Domain rules are business rules that do not depend on ASP.NET, EF Core,
// controllers, or DTOs. This keeps the core ticket behavior reusable and easy
// to explain: "a client can only access their own ticket; an admin can access all".
public static class TicketRules
{
    public static bool CanAccess(Ticket ticket, Guid userId, UserRole userRole)
    {
        // Admins have global support access. Clients are limited to tickets
        // where the ClientId matches their authenticated user id.
        return userRole == UserRole.Admin || ticket.ClientId == userId;
    }

    public static bool CanReply(Ticket ticket, Guid userId, UserRole userRole)
    {
        // Closed tickets are read-only. The access check is still required so a
        // different client cannot reply to someone else's open ticket.
        return ticket.Status != TicketStatus.Closed && CanAccess(ticket, userId, userRole);
    }

    public static bool CanUploadAttachment(Ticket ticket, Guid userId, UserRole userRole)
    {
        // Uploading is allowed for anyone who may access the ticket. More
        // detailed file rules live in FileStorageOptions/LocalFileStorageService.
        return CanAccess(ticket, userId, userRole);
    }

    public static bool CanChangeStatus(
        Ticket ticket,
        Guid userId,
        UserRole userRole,
        TicketStatus newStatus)
    {
        if (newStatus == TicketStatus.New)
        {
            // New is assigned only when a ticket is created. Once the ticket
            // has a conversation history, users should not move it back to New.
            return false;
        }

        if (userRole == UserRole.Admin)
        {
            // Admins can move tickets between active discussion and resolved.
            // New is intentionally excluded because it is creation-only.
            return true;
        }

        if (userRole != UserRole.Client || ticket.ClientId != userId)
        {
            return false;
        }

        if (newStatus == TicketStatus.Closed)
        {
            // Clients may close their own ticket when they consider the issue fixed.
            return ticket.Status != TicketStatus.Closed;
        }

        if (newStatus == TicketStatus.Open)
        {
            // Reopening should not make the ticket look brand new again. It
            // moves back to the active Open conversation state instead.
            return ticket.Status == TicketStatus.Closed;
        }

        // Clients cannot set New because that status is only for newly created,
        // not-yet-handled tickets.
        return false;
    }

    public static bool ShouldMoveToOpen(Ticket ticket, UserRole senderRole)
    {
        // An admin reply is the moment support has started handling a new
        // ticket, so the ticket moves into the active Open conversation state.
        return ticket.Status == TicketStatus.New && senderRole == UserRole.Admin;
    }

    // API/frontends sometimes send readable values like "Technical Problem".
    // The enum values are stored without spaces, so these helpers normalize
    // input before parsing.
    public static bool TryParseStatus(string value, out TicketStatus status)
    {
        return Enum.TryParse(value.Replace(" ", string.Empty), true, out status);
    }

    public static bool TryParseCategory(string value, out TicketCategory category)
    {
        // ignoreCase=true keeps the API tolerant of casing differences.
        return Enum.TryParse(value.Replace(" ", string.Empty), true, out category);
    }

    public static bool TryParseSubject(string value, out TicketSubject subject)
    {
        // Unknown strings safely return false instead of throwing.
        return Enum.TryParse(value.Replace(" ", string.Empty), true, out subject);
    }
}
