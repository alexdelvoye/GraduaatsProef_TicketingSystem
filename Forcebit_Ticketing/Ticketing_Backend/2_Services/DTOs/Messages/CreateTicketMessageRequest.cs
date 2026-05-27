
using System.ComponentModel.DataAnnotations;

namespace Services.DTOs.Messages
{
    public class CreateTicketMessageRequest
    {
        [Required]
        [StringLength(4000)]
        public string Message { get; set; } = string.Empty;
    }
}
