using Microsoft.AspNetCore.Mvc;
using ReconocerApp.API.Services.Graph;
using System.Threading.Tasks;

namespace ReconocerApp.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GraphTestController : ControllerBase
    {
        private readonly IGraphService _graphService;

        public GraphTestController(IGraphService graphService)
        {
            _graphService = graphService;
        }

        /// <summary>
        /// Test endpoint to fetch user information from Graph API
        /// </summary>
        /// <param name="userId">Graph API user ID</param>
        /// <returns>User information from Graph API</returns>
        [HttpGet("{userId}")]
        public async Task<IActionResult> GetUserInfo(string userId)
        {
            try
            {
                var userInfo = await _graphService.GetUserInfoAsync(userId);
                return Ok(new
                {
                    DisplayName = userInfo.DisplayName,
                    Email = userInfo.Email,
                    JobTitle = userInfo.JobTitle,
                    Department = userInfo.Department,
                    HasPhoto = !string.IsNullOrEmpty(userInfo.ProfilePhotoBase64)
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Error = $"Error fetching user info: {ex.Message}" });
            }
        }
    }
}
