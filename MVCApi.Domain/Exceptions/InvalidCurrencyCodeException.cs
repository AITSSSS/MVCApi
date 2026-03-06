using System;

namespace MVCApi.Domain.Exceptions
{
    public class InvalidCurrencyCodeException : Exception
    {
        public string CurrencyCode { get; init; }
        public InvalidCurrencyCodeException(string code)
            : base($"Currency code {code} is invalid")
        {
            CurrencyCode = code;
        }
    }
}