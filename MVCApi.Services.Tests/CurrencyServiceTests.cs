using Moq;
using MVCApi.Domain;
using MVCApi.Domain.Entites;
using MVCApi.Domain.Exceptions;
using MVCApi.Services.Exceptions;

namespace MVCApi.Services.Tests;

public class CurrencyServiceTests
{
    private Mock<IExchangeProvider> exchangeProvider = new();
    private Mock<IDomainRepository<Currency>> currencyRepository = new();
    private Mock<IDomainRepository<Product>> productRepository = new();
    private CurrencyService currencyService;

    public CurrencyServiceTests()
    {
        exchangeProvider.Setup(ep => ep.GetRate(It.IsAny<string>())).Throws(() => new InvalidCurrencyCodeException(string.Empty));
        exchangeProvider.Setup(ep => ep.GetRate("USD")).Returns(async () => (decimal?)3.5);
        exchangeProvider.Setup(ep => ep.GetRate("EUR")).Returns(async () => (decimal?)4.0);
        exchangeProvider.Setup(ep => ep.GetRate(string.Empty)).Returns(async () => (decimal?)null);
        exchangeProvider.Setup(ep => ep.GetRate(null)).Returns(async () => (decimal?)null);

        currencyRepository.Setup(cr => cr.GetAllAsync(x => x.Code == It.IsAny<string>())).Returns(async () => Enumerable.Empty<Currency>());
        currencyRepository.Setup(cr => cr.GetAllAsync(x => x.Code == "EUR")).Returns(async () => new[] { Currency.Create("EUR", 2) });
        currencyRepository.Setup(cr => cr.GetAllAsync(x => x.Code == "USD")).Returns(async () => new[] { Currency.Create("USD", 2) });

        currencyService = new(currencyRepository.Object, productRepository.Object, exchangeProvider.Object);
    }

    [Theory]
    [InlineData("USD", 2.0, 2.0 / 3.5)]
    [InlineData("EUR", 2.0, 2.0 / 4.0)]
    [InlineData("USD", 21.0, 21.0 / 3.5)]
    [InlineData("EUR", 21.0, 21.0 / 4.0)]
    public async Task GetConvertedValueReturnsConvertedValue(string currencyCode, decimal original, decimal expected)
    {
        var testProduct = Product.Create("Test", "Test", "Test", original, Currency.Create("PLN", 2));

        decimal actual = await currencyService.GetConvertedValue(testProduct, currencyCode);

        Assert.Equal(expected, actual, 2);
    }

    [Theory]
    [InlineData("InvalidCode", 21.0)]
    [InlineData("2Pz", 21.0)]
    [InlineData("Dttpwwss", 21.0)]
    public async Task GetConvertedValueThrowsWhenInvalidCurrencyCode(string currencyCode, decimal original)
    {
        var testProduct = Product.Create("Test", "Test", "Test", original, Currency.Create("PLN", 2));

        await Assert.ThrowsAsync<InvalidCurrencyCodeException>(async () => await currencyService.GetConvertedValue(testProduct, currencyCode));
    }

    [Fact]
    public async Task GetConvertedValueThrowsWithNullProduct()
    {
        await Assert.ThrowsAsync<PriceNotFoundException>(async () => await currencyService.GetConvertedValue(null, "USD"));
    }

    [Theory]
    [InlineData(null, 2.0)]
    [InlineData("", 2.0)]
    public async Task GetConvertedValueThrowsWhenNullCurrencyCode(string currencyCode, decimal original)
    {
        var testProduct = Product.Create("Test", "Test", "Test", original, Currency.Create("PLN", 2));

        await Assert.ThrowsAsync<NullCurrencyException>(async () => await currencyService.GetConvertedValue(testProduct, currencyCode));
    }

    [Theory]
    [InlineData("USD", 2.0, 2.0 / 3.5)]
    [InlineData("EUR", 2.0, 2.0 / 4.0)]
    [InlineData("USD", 21.0, 21.0 / 3.5)]
    [InlineData("EUR", 21.0, 21.0 / 4.0)]
    public async Task AddConversionAddsConversion(string currencyCode, decimal original, decimal expected)
    {
        var testProduct = Product.Create("Test", "Test", "Test", original, Currency.Create("PLN", 2));

        CurrencyProduct exchange = await currencyService.AddConversion(testProduct, currencyCode);

        Assert.NotNull(exchange);
        Assert.Equal(expected, exchange.Value, 2);
    }
    
    [Theory]
    [InlineData("InvalidCode", 21.0)]
    [InlineData("2Pz", 21.0)]
    [InlineData("Dttpwwss", 21.0)] 
    [InlineData(null, 2.0)]
    [InlineData("", 2.0)]
    public async Task AddConversionThrowsWhenInvalidCurrencyCode(string currencyCode, decimal original)
    {
        var testProduct = Product.Create("Test", "Test", "Test", original, Currency.Create("PLN", 2));

        await Assert.ThrowsAsync<CurrencyNotFoundException>(async () => await currencyService.AddConversion(testProduct, currencyCode));
    } 

    [Fact]
    public async Task AddConversionThrowsWithNullProduct()
    {
        await Assert.ThrowsAsync<PriceNotFoundException>(async () => await currencyService.AddConversion(null, "USD"));
    }
}