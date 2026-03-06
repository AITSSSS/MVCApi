using System;

namespace MVCApi.Domain.Exceptions;

public class InvalidImageLinkException : Exception
{
    public string Image { get; init; }

    public InvalidImageLinkException(string image)
        : base($"Invalid link to image provided: {image}")
    {
        Image = image;
    }
}