using System;

namespace MVCApi.Services.Exceptions;

public class NullCurrencyException : Exception
{
    public NullCurrencyException()
        : base("Null or empty currency given.")
    {
        
    }
    
}