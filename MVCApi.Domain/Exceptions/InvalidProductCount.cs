using System;

namespace MVCApi.Domain.Exceptions;

public class InvalidProductCount : Exception
{
    public InvalidProductCount()
        : base("Tried to add a product with invalid count.")
    {
        
    }   
}