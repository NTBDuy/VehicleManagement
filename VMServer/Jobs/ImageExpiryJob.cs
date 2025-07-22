using System.Globalization;

namespace VMServer.Jobs
{
    public class ImageExpiryJob
    {
        public async Task RunAsync()
        {
            var rootPath = Path.Combine("uploads", "checkPoint");
            if (!Directory.Exists(rootPath))
                return;

            var now = DateTime.Now;

            var yearFolders = Directory.GetDirectories(rootPath);
            foreach (var yearFolder in yearFolders)
            {
                var yearName = Path.GetFileName(yearFolder);
                if (!int.TryParse(yearName, out int year)) continue;

                var monthFolders = Directory.GetDirectories(yearFolder);
                foreach (var monthFolder in monthFolders)
                {
                    var monthName = Path.GetFileName(monthFolder);
                    if (!int.TryParse(monthName, out int month)) continue;

                    try
                    {
                        var folderDate = new DateTime(year, month, 1);
                        var ageInDays = (now - folderDate).TotalDays;

                        if (ageInDays >= 60)
                        {
                            Directory.Delete(monthFolder, true);
                            Console.WriteLine($"Đã xoá thư mục: {monthFolder}");
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Không thể xoá {monthFolder}: {ex.Message}");
                    }
                }
            }

            await Task.CompletedTask;
        }
    }
}
