using Minio;
using Minio.Exceptions;
using Minio.DataModel.Args;

// Clase para representar una imagen con propiedades nombradas
public class ImageDto
{
    public string Name { get; set; } = string.Empty;
    public byte[] Content { get; set; } = Array.Empty<byte>();
}

public class MinioService
{
    private readonly IMinioClient _minioClient; // Changed to IMinioClient
    private readonly string _bucketName;

    public MinioService(IConfiguration configuration)
    {
        var endpoint = configuration["Minio:Endpoint"] ?? throw new ArgumentNullException(nameof(configuration), "Minio endpoint is not configured.");
        var accessKey = configuration["Minio:AccessKey"] ?? throw new ArgumentNullException(nameof(configuration), "Minio access key is not configured.");
        var secretKey = configuration["Minio:SecretKey"] ?? throw new ArgumentNullException(nameof(configuration), "Minio secret key is not configured.");
        _bucketName = configuration["Minio:BucketName"] ?? throw new ArgumentNullException(nameof(configuration), "Minio bucket name is not configured.");

        _minioClient = new MinioClient()
            .WithEndpoint(endpoint)
            .WithCredentials(accessKey, secretKey)
            .Build();
    }

    public async Task UploadImageAsync(string objectName, Stream fileStream, string contentType)
    {
        try
        {
            // Ensure the bucket exists
            var bucketExistsArgs = new BucketExistsArgs().WithBucket(_bucketName);
            bool found = await _minioClient.BucketExistsAsync(bucketExistsArgs);
            if (!found)
            {
                var makeBucketArgs = new MakeBucketArgs().WithBucket(_bucketName);
                await _minioClient.MakeBucketAsync(makeBucketArgs);
            }

            // Upload the file
            var putObjectArgs = new PutObjectArgs()
                .WithBucket(_bucketName)
                .WithObject(objectName)
                .WithStreamData(fileStream)
                .WithObjectSize(fileStream.Length)
                .WithContentType(contentType);

            await _minioClient.PutObjectAsync(putObjectArgs);
        }
        catch (Exception ex)
        {
            throw new ApplicationException("Error uploading image to MinIO", ex);
        }
    }

    public async Task<List<ImageDto>> GetImagesAsync(string prefix)
    {
        var images = new List<ImageDto>();

        try
        {
            var listArgs = new ListObjectsArgs()
                .WithBucket(_bucketName)
                .WithPrefix(prefix)
                .WithRecursive(true);

            await foreach (var item in _minioClient.ListObjectsEnumAsync(listArgs).ConfigureAwait(false))
            {
                if (!item.IsDir)
                {
                    var getObjectArgs = new GetObjectArgs()
                        .WithBucket(_bucketName)
                        .WithObject(item.Key)
                        .WithCallbackStream(stream =>
                        {
                            using var memoryStream = new MemoryStream();
                            stream.CopyTo(memoryStream);
                            
                            // Crear un objeto con propiedades nombradas en lugar de una tupla
                            images.Add(new ImageDto
                            {
                                Name = item.Key,
                                Content = memoryStream.ToArray()
                            });
                        });

                    // Ejecutar la operación de obtención del objeto sin lambda adicional
                    await _minioClient.GetObjectAsync(getObjectArgs).ConfigureAwait(false);
                }
            }
        }
        catch (Exception ex)
        {
            throw new ApplicationException("Error retrieving images from MinIO", ex);
        }

        return images;
    }

    public async Task DeleteImageAsync(string objectName)
    {
        var removeArgs = new RemoveObjectArgs()
            .WithBucket(_bucketName)
            .WithObject(objectName);

        await _minioClient.RemoveObjectAsync(removeArgs);
    }
}