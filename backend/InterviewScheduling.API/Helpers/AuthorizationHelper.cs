using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using InterviewScheduling.API.Data;

namespace InterviewScheduling.API.Helpers;

public static class AuthorizationHelper
{
    /// <summary>
    /// Get current user ID from token
    /// </summary>
    public static int? GetCurrentUserId(ControllerBase controller)
    {
        var authHeader = controller.Request.Headers["Authorization"].ToString();
        if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
            return null;

        try
        {
            var token = authHeader.Substring(7);
            var tokenData = System.Text.Encoding.UTF8.GetString(Convert.FromBase64String(token));
            var parts = tokenData.Split(':');
            if (parts.Length > 0 && int.TryParse(parts[0], out var userId))
                return userId;
        }
        catch { }

        return null;
    }

    /// <summary>
    /// Get current user role from database
    /// </summary>
    public static async Task<string?> GetCurrentUserRoleAsync(ControllerBase controller, ApplicationDbContext context)
    {
        var userId = GetCurrentUserId(controller);
        if (userId == null) return null;

        var user = await context.Users.FindAsync(userId);
        return user?.Role;
    }

    /// <summary>
    /// Check if current user has a specific role
    /// </summary>
    public static async Task<bool> IsUserInRoleAsync(ControllerBase controller, ApplicationDbContext context, string role)
    {
        var userRole = await GetCurrentUserRoleAsync(controller, context);
        return userRole == role;
    }

    /// <summary>
    /// Check if current user is Admin
    /// </summary>
    public static async Task<bool> IsAdminAsync(ControllerBase controller, ApplicationDbContext context)
    {
        return await IsUserInRoleAsync(controller, context, "Admin");
    }

    /// <summary>
    /// Check if current user is HR Manager
    /// </summary>
    public static async Task<bool> IsHrManagerAsync(ControllerBase controller, ApplicationDbContext context)
    {
        return await IsUserInRoleAsync(controller, context, "HR Manager");
    }

    /// <summary>
    /// Check if current user is Interviewer (Panel)
    /// </summary>
    public static async Task<bool> IsInterviewerAsync(ControllerBase controller, ApplicationDbContext context)
    {
        return await IsUserInRoleAsync(controller, context, "Interviewer");
    }
}
