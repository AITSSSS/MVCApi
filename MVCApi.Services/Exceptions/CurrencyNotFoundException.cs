using System;

namespace MVCApi.Services.Exceptions;

public class CurrencyNotFoundException : Exception
{
    public string CurrencyCode { get; init; }

    public CurrencyNotFoundException(string currencyCode)
        : base($"Currency not found in database: {currencyCode}")
    {
        CurrencyCode = currencyCode;
    }
}