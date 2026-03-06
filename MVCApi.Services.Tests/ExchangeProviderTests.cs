using MVCApi.Domain.Exceptions;

namespace MVCApi.Services.Tests;

public class ExchangeProviderTests
{
    [Theory]
    [InlineData("USD")]
    [InlineData("CHF")]
    [InlineData("JPY")]
    [InlineData("CZK")]
    [InlineData("RUB")]
    public async Task ShouldReturnRateForValidCurrency(string currencyCode)
    {
        IExchangeProvider exchangeProvider = new ExchangeProvider();

        decimal? actual = await exchangeProvider.GetRate(currencyCode);

        Assert.IsType<decimal>(actual);
        Assert.NotNull(actual);
    }

    [Theory]
    [InlineData("LMAO")]
    [InlineData("Invalid_Data")]
    [InlineData("Pepega")]
    [InlineData("DRT")]
    [InlineData("ZPM")]
    public async Task ShouldThrowForInvalidCurrency(string currencyCode)
    {
        IExchangeProvider exchangeProvider = new ExchangeProvider();

        await Assert.ThrowsAsync<InvalidCurrencyCodeException>(async () => await exchangeProvider.GetRate(currencyCode));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    public async Task ShouldReturnNullForNullOrEmptyCurrency(string currencyCode)
    {
        IExchangeProvider exchangeProvider = new ExchangeProvider();

        decimal? actual = await exchangeProvider.GetRate(currencyCode);

        Assert.Null(actual);
    }
}