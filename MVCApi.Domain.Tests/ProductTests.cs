using Microsoft.VisualStudio.TestPlatform.ObjectModel;
using MVCApi.Domain.Entites;
using MVCApi.Domain.Exceptions;

namespace MVCApi.Domain.Tests;

public class ProductTests
{
    private static Currency VALID_CURRENCY = Currency.Create("PLN", 2);
    private const string VALID_NAME = "Valid Name";
    private const string VALID_DESCRIPTION = "Descriptive Description";
    private const string VALID_IMAGE = "https://image-hosting.org/image.png";
    private static Product VALID_PRODUCT = Product.Create(VALID_NAME, VALID_DESCRIPTION, VALID_IMAGE, 20.0m, VALID_CURRENCY);

    [Fact]
    public void ProductShouldBeCreated()
    {
        var product = Product.Create(VALID_NAME, VALID_DESCRIPTION, VALID_IMAGE, 20.0m, VALID_CURRENCY);

        Assert.NotNull(product);
    }

    [Theory]
    [InlineData("", VALID_DESCRIPTION, VALID_IMAGE, 20.0)]
    [InlineData(VALID_NAME, "", VALID_IMAGE, 20.0)]
    [InlineData(VALID_NAME, VALID_DESCRIPTION, "", 20.0)]
    [InlineData(VALID_NAME, VALID_DESCRIPTION, VALID_IMAGE, -10)]
    public void ProductWithInvalidDataShouldThrow(string name, string description, string imageUrl, decimal price)
    {
        Assert.ThrowsAny<Exception>(() => Product.Create(name, description, imageUrl, price, VALID_CURRENCY));
    }

    [Fact]
    public void ValidProductNameIsUpdated()
    {
        var product = VALID_PRODUCT;

        product.ChangeName("NEW NAME");

        Assert.Equal("NEW NAME", product.Name);
    }

    [Fact]
    public void ShortProductNameThrows()
    {
        var product = VALID_PRODUCT;

        Assert.Throws<LengthException>(() => product.ChangeName("dd"));
    }

    [Fact]
    public void LongProductNameThrows()
    {
        var product = VALID_PRODUCT;

        Assert.Throws<LengthException>(() => product.ChangeName(Enumerable.Range(0, 100).Select(x => 'x').ToString()));
    }

    [Fact]
    public void EmptyProductNameThrows()
    {
        var product = VALID_PRODUCT;

        Assert.Throws<NullFieldException>(() => product.ChangeName(string.Empty));
    }

    [Fact]
    public void NullProductNameThrows()
    {
        var product = VALID_PRODUCT;

        Assert.Throws<NullFieldException>(() => product.ChangeName(null));
    }

    [Fact]
    public void ValidDescriptionIsUpdated()
    {
        var product = VALID_PRODUCT;

        product.ChangeDescription("VALID LONG DESCRIPTION");

        Assert.Equal("VALID LONG DESCRIPTION", product.Description);
    }

    [Fact]
    public void ShortDescriptionThrows()
    {
        var product = VALID_PRODUCT;

        Assert.Throws<LengthException>(() => product.ChangeDescription("dd"));       
    }

    [Fact]
    public void LongDescriptionThrows()
    {
        var product = VALID_PRODUCT;

        Assert.Throws<LengthException>(() => product.ChangeDescription(Enumerable.Range(0, 10000).Select(x => 'x').ToString()));       
    }

    [Fact]
    public void EmptyDescriptionThrows()
    {
        var product = VALID_PRODUCT;

        Assert.Throws<NullFieldException>(() => product.ChangeDescription(string.Empty));
    }


    [Fact]
    public void NullDescriptionThrows()
    {
        var product = VALID_PRODUCT;

        Assert.Throws<NullFieldException>(() => product.ChangeDescription(null));
    }

    [Theory]
    [InlineData("http://host.org/image.png")]
    [InlineData("file://var/images/image.png")]
    [InlineData("file://C:/images/image.png")]
    public void ValidImageIsUpdated(string imageUrl)
    {
        var product = VALID_PRODUCT;

        product.ChangeImage(imageUrl);

        Assert.Equal(imageUrl, product.Image);
    }

    [Theory]
    [InlineData("invalid")]
    [InlineData("    ")]
    public void InvalidImageUrlThrows(string imageUrl)
    {
        var product = VALID_PRODUCT;

        Assert.Throws<InvalidImageLinkException>(() => product.ChangeImage(imageUrl));
    }

    [Fact]
    public void EmptyImageThrows()
    {
        var product = VALID_PRODUCT;

        Assert.Throws<NullFieldException>(() => product.ChangeImage(string.Empty));
    }


    [Fact]
    public void NullImageThrows()
    {
        var product = VALID_PRODUCT;

        Assert.Throws<NullFieldException>(() => product.ChangeImage(null));
    }

    [Fact]
    public void ValidPriceConversionIsAdded()
    {
        var product = VALID_PRODUCT;
        var conversion = new CurrencyProduct(product, Currency.Create("USD", 2), 20.0m);

        product.AddConversion(conversion);

        Assert.Contains(conversion, product.Prices);
    }

    [Fact]
    public void InvalidPriceConversionValueThrows()
    {
        var product = VALID_PRODUCT;
        var conversion = new CurrencyProduct(product, Currency.Create("USD", 2), 0.0m);

        Assert.Throws<InvalidPriceException>(() => product.AddConversion(conversion));
    }

    [Fact]
    public void DuplicatePriceConversionThrows()
    {
        var product = VALID_PRODUCT;
        var conversion = new CurrencyProduct(product, VALID_CURRENCY, 20.0m);

        Assert.Throws<DuplicateConversionException>(() => product.AddConversion(conversion));
    }
}