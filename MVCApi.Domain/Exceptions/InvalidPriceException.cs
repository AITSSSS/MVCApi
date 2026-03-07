using System;

namespace MVCApi.Domain.Exceptions;

public class InvalidPriceException : Exception
{
    public InvalidPriceException()
        : base("Price must be a positive number.")
    {
        
    }
}