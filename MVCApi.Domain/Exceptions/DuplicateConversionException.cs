using System;

namespace MVCApi.Domain.Exceptions;

public class DuplicateConversionException : Exception
{
    public string CurrencyCode { get; init; }
    public DuplicateConversionException(string currencyCode)
        : base($"Product already has conversion for {currencyCode} registered.")
    {
        CurrencyCode = currencyCode;
    }
}