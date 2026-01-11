// AIModified:2026-01-11T16:22:15Z
using Microsoft.EntityFrameworkCore;
using InterviewScheduling.API.Models;

namespace InterviewScheduling.API.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<InterviewerProfile> InterviewerProfiles { get; set; }
    public DbSet<Skill> Skills { get; set; }
    public DbSet<InterviewerSkill> InterviewerSkills { get; set; }
    public DbSet<AvailabilitySlot> AvailabilitySlots { get; set; }
    public DbSet<Interviewee> Interviewees { get; set; }
    public DbSet<Interview> Interviews { get; set; }
    public DbSet<InterviewType> InterviewTypes { get; set; }
    public DbSet<InterviewRequirement> InterviewRequirements { get; set; }
    public DbSet<OpenPosition> OpenPositions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            entity.Property(e => e.PasswordHash).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Role).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Name).HasMaxLength(255);
            entity.Property(e => e.ProfilePictureUrl).HasMaxLength(500);
        });

        // InterviewerProfile configuration
        modelBuilder.Entity<InterviewerProfile>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.User)
                .WithOne(e => e.InterviewerProfile)
                .HasForeignKey<InterviewerProfile>(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Skill configuration
        modelBuilder.Entity<Skill>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Name).IsUnique();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
        });

        // InterviewerSkill configuration
        modelBuilder.Entity<InterviewerSkill>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.InterviewerProfile)
                .WithMany(e => e.InterviewerSkills)
                .HasForeignKey(e => e.InterviewerProfileId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Skill)
                .WithMany(e => e.InterviewerSkills)
                .HasForeignKey(e => e.SkillId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // AvailabilitySlot configuration
        modelBuilder.Entity<AvailabilitySlot>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.InterviewerProfile)
                .WithMany(e => e.AvailabilitySlots)
                .HasForeignKey(e => e.InterviewerProfileId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // OpenPosition configuration
        modelBuilder.Entity<OpenPosition>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.Department).HasMaxLength(100);
        });

        // Interviewee configuration
        modelBuilder.Entity<Interviewee>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            entity.HasIndex(e => e.Email);
            entity.HasOne(e => e.Position)
                .WithMany(e => e.Interviewees)
                .HasForeignKey(e => e.PositionId)
                .OnDelete(DeleteBehavior.SetNull);
            entity.HasIndex(e => e.PositionId);
        });

        // InterviewType configuration
        modelBuilder.Entity<InterviewType>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
        });

        // Interview configuration
        modelBuilder.Entity<Interview>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.InterviewerProfile)
                .WithMany(e => e.Interviews)
                .HasForeignKey(e => e.InterviewerProfileId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.Interviewee)
                .WithMany(e => e.Interviews)
                .HasForeignKey(e => e.IntervieweeId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.InterviewType)
                .WithMany(e => e.Interviews)
                .HasForeignKey(e => e.InterviewTypeId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.CreatedByUser)
                .WithMany()
                .HasForeignKey(e => e.CreatedByUserId)
                .OnDelete(DeleteBehavior.SetNull);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(50);
        });

        // InterviewRequirement configuration
        modelBuilder.Entity<InterviewRequirement>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Interview)
                .WithMany(e => e.InterviewRequirements)
                .HasForeignKey(e => e.InterviewId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Skill)
                .WithMany(e => e.InterviewRequirements)
                .HasForeignKey(e => e.SkillId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
