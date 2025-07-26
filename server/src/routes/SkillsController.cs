using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace VTT.Server.Routes
{
    [ApiController]
    [Route("api/[controller]")]
    public class SkillsController : ControllerBase
    {
        private readonly ILogger<SkillsController> _logger;

        public SkillsController(ILogger<SkillsController> logger)
        {
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetSkills()
        {
            try
            {
                string skillsFilePath = Path.Combine(Directory.GetCurrentDirectory(), "data", "skills.json");
                
                if (!System.IO.File.Exists(skillsFilePath))
                {
                    _logger.LogError($"Skills file not found at path: {skillsFilePath}");
                    return NotFound("Skills file not found");
                }

                string jsonContent = await System.IO.File.ReadAllTextAsync(skillsFilePath);
                return Content(jsonContent, "application/json");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reading skills data");
                return StatusCode(500, "Error reading skills data");
            }
        }
    }
}