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
        if (userRole == UserRole.Admin)
        {
            // Admins manage the full support workflow: Open, InProgress, Closed.
            return true;
        }

        if (userRole != UserRole.Client || ticket.ClientId != userId)
        {
            return false;
        }

        // Clients may close their own ticket when they consider the issue fixed,
        // and may reopen a closed ticket when the problem comes back. They may
        // not move tickets into InProgress because that is an internal support
        // workflow state.
        return newStatus == TicketStatus.Open || newStatus == TicketStatus.Closed;
    }

    public static bool ShouldMoveToInProgress(Ticket ticket, UserRole senderRole)
    {
        // An admin reply is the moment support has started handling the ticket.
        // Client replies should not move a new ticket into InProgress.
        return ticket.Status == TicketStatus.Open && senderRole == UserRole.Admin;
    }

    // API/frontends sometimes send readable values like "In Progress" or
    // "Technical Problem". The enum values are stored without spaces, so these
    // helpers normalize input before parsing.
    public static bool TryParseStatus(string value, out TicketStatus status)
    {
        // Removing spaces makes both "InProgress" and "In Progress" acceptable.
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
