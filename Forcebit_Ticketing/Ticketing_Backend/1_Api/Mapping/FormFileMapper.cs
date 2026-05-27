using Services.DTOs.Attachments;

namespace Api.Mapping;

// API-only mapper for multipart uploads. ASP.NET exposes uploaded files as
// IFormFile, but the service layer should not depend on ASP.NET types. This
// mapper keeps that conversion in the API layer.
public static class FormFileMapper
{
    public static FileUploadRequest ToFileUploadRequest(IFormFile file)
    {
        // OpenReadStream is called here, inside the API layer, because IFormFile
        // is an ASP.NET type. The service layer only receives a normal Stream
        // plus metadata and does not need to reference ASP.NET Core packages.
        return new FileUploadRequest
        {
            FileName = file.FileName,
            ContentType = file.ContentType,
            Content = file.OpenReadStream(),
            Length = file.Length
        };
    }

    public static List<FileUploadRequest> ToFileUploadRequests(IFormFileCollection files)
    {
        return files
            .Select(ToFileUploadRequest)
            .ToList();
    }
}
