using System;

namespace MVCApi.Services.Exceptions;

public class PriceNotFoundException : Exception
{
    public PriceNotFoundException()
        : base("Price not found.")
    {
        
    }   
}