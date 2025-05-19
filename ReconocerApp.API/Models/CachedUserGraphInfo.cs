using System;

namespace ReconocerApp.API.Models
{
    public class CachedUserGraphInfo
    {
        public int Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string JobTitle { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string ProfilePhotoBase64 { get; set; } = string.Empty;
        public DateTime LastUpdated { get; set; }
    }
}
