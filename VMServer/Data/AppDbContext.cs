using Microsoft.EntityFrameworkCore;
using VMServer.Models.Entities;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Vehicle> Vehicles { get; set; }
    public DbSet<Request> Requests { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<MaintenanceSchedule> MaintenanceSchedules { get; set; }
    public DbSet<Driver> Drivers { get; set; }
    public DbSet<Assignment> Assignments { get; set; }
    public DbSet<CheckPoint> CheckPoints { get; set; }
    public DbSet<CheckPointPhoto> CheckPointPhotos { get; set; }

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

        base.OnModelCreating(modelBuilder);
    }
}