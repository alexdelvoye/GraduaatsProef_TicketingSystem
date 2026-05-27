
using System.ComponentModel.DataAnnotations;

namespace Services.DTOs.Tickets
{
    public class UpdateTicketStatusRequest
    {
        [Required]
        public string Status { get; set; } = string.Empty;
    }
}
