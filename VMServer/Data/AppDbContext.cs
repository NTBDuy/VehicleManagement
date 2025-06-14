using Microsoft.EntityFrameworkCore;
using VMServer.Models.Entities;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Vehicle> Vehicles { get; set; }
    public DbSet<Request> Requests { get; set; }
    public DbSet<RequestLocation> RequestLocations { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<MaintenanceSchedule> MaintenanceSchedules { get; set; }
    public DbSet<Driver> Drivers { get; set; }
    public DbSet<Assignment> Assignments { get; set; }
    public DbSet<CheckPoint> CheckPoints { get; set; }
    public DbSet<CheckPointPhoto> CheckPointPhotos { get; set; }
    public DbSet<AppSetting> AppSettings { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Request>()
            .HasOne(r => r.User)
            .WithMany()
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Request>()
            .HasOne(r => r.Vehicle)
            .WithMany()
            .HasForeignKey(r => r.VehicleId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Assignment>()
            .HasOne(a => a.Request)
            .WithMany()
            .HasForeignKey(a => a.RequestId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Assignment>()
            .HasOne(a => a.Driver)
            .WithMany()
            .HasForeignKey(a => a.DriverId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<MaintenanceSchedule>()
            .HasOne(m => m.Vehicle)
            .WithMany()
            .HasForeignKey(m => m.VehicleId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Notification>()
            .HasOne(n => n.User)
            .WithMany()
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Username)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<Vehicle>()
            .HasIndex(v => v.LicensePlate)
            .IsUnique();

        modelBuilder.Entity<Driver>()
            .HasIndex(d => d.LicenseNumber)
            .IsUnique();

        modelBuilder.Entity<AppSetting>().HasData(
        new AppSetting
        {
            SettingId = 1,
            SettingKey = "CHECK_IN_RADIUS",
            SettingValue = "5",
            Description = "Bán kính check-in tính bằng KM",
            SettingType = "NUMBER",
            CreatedAt = new DateTime(2025, 06, 01),
            UpdatedAt = new DateTime(2025, 06, 01)
        }
        );

        modelBuilder.Entity<Request>()
            .HasIndex(r => new { r.Status, r.LastUpdateAt })
            .HasDatabaseName("IX_Request_Status_LastUpdateAt");

        modelBuilder.Entity<Request>()
            .HasIndex(r => new { r.UserId, r.Status })
            .HasDatabaseName("IX_Request_UserId_Status");

        modelBuilder.Entity<Request>()
            .HasIndex(r => new { r.VehicleId, r.Status })
            .HasDatabaseName("IX_Request_VehicleId_Status");

        modelBuilder.Entity<Request>()
            .HasIndex(r => new { r.Status, r.EndTime })
            .HasDatabaseName("IX_Request_Status_EndTime");

        modelBuilder.Entity<Assignment>()
            .HasIndex(a => a.RequestId)
            .HasDatabaseName("IX_Assignment_RequestId");

        modelBuilder.Entity<CheckPoint>()
            .HasIndex(c => new { c.RequestId, c.CheckPointId })
            .HasDatabaseName("IX_CheckPoint_RequestId_CheckPointId");

        modelBuilder.Entity<Notification>()
            .HasIndex(n => new { n.UserId, n.Type, n.CreatedAt })
            .HasDatabaseName("IX_Notification_UserId_Type_CreatedAt");

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Role)
            .HasDatabaseName("IX_User_Role");

        modelBuilder.Entity<Request>()
            .HasIndex(r => new { r.ActionBy, r.Status })
            .HasDatabaseName("IX_Request_ActionBy_Status");

        modelBuilder.Entity<Request>()
            .HasIndex(r => new { r.VehicleId, r.StartTime, r.EndTime })
            .HasDatabaseName("IX_Request_VehicleId_TimeRange");

        modelBuilder.Entity<Request>()
            .HasIndex(r => new { r.Status, r.StartTime, r.EndTime })
            .HasDatabaseName("IX_Request_Status_StartTime_EndTime")
            .IncludeProperties(r => r.VehicleId);

        modelBuilder.Entity<Request>()
            .HasIndex(r => new { r.VehicleId, r.Status, r.StartTime })
            .HasDatabaseName("IX_Request_VehicleId_Status_StartTime");

        modelBuilder.Entity<Vehicle>()
            .HasIndex(v => v.Status)
            .HasDatabaseName("IX_Vehicle_Status");

        modelBuilder.Entity<MaintenanceSchedule>()
            .HasIndex(m => new { m.VehicleId, m.Status })
            .HasDatabaseName("IX_MaintenanceSchedule_VehicleId_Status");

        modelBuilder.Entity<MaintenanceSchedule>()
            .HasIndex(m => m.VehicleId)
            .HasDatabaseName("IX_MaintenanceSchedule_VehicleId");

        base.OnModelCreating(modelBuilder);

    }
}