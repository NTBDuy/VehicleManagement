using Microsoft.EntityFrameworkCore;
using VMServer.Models.Entities;

namespace VMServer.Jobs
{
    public class RequestExpiryJob
    {
        private readonly AppDbContext _dbContext;

        public RequestExpiryJob(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task RunAsync()
        {
            var today = DateTime.Now.Date;

            var requests = await _dbContext.Requests
                .Where(r => r.EndTime.Date < today &&
                            (r.Status == RequestStatus.Pending || r.Status == RequestStatus.Approved))
                .ToListAsync();

            foreach (var request in requests)
            {
                request.Status = RequestStatus.Cancelled;
                request.CancelOrRejectReason = "Expired request";
            }

            await _dbContext.SaveChangesAsync();
        }
    }
}
