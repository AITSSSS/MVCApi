using System;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using MVCApi.Application.Commands;
using MVCApi.Application.Dto;
using MVCApi.Application.Queries;
using MVCApi.Controllers;

namespace MVCApi.Tests;

public class CartControllerTests
{
    private readonly Mock<IMediator> _mediatorMock;
    private readonly CartController _controller;

    public CartControllerTests()
    {
        _mediatorMock = new Mock<IMediator>();
        _controller = new CartController(_mediatorMock.Object);
    }

    [Fact]
    public async Task AddProductToCart_ShouldReturnGuid()
    {
        var expected = Guid.NewGuid();
        var command = new AddProductToCart();
        _mediatorMock.Setup(m => m.Send(It.IsAny<AddProductToCart>(), default))
            .ReturnsAsync(expected);

        var result = await _controller.AddProductToCart(command);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Equal(expected, ok.Value);
    }

    [Fact]
    public async Task CreateCart_ShouldReturnGuid()
    {
        var expected = Guid.NewGuid();
        _mediatorMock.Setup(m => m.Send(It.IsAny<CreateCart>(), default))
            .ReturnsAsync(expected);

        var result = await _controller.CreateCart(new CreateCart());

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Equal(expected, ok.Value);
    }

    [Fact]
    public async Task GetCartById_ShouldReturnShoppingCartDto()
    {
        var expected = new ShoppingCartDto();
        var id = Guid.NewGuid();
        var currencyCode = "USD";
        _mediatorMock.Setup(m =>
                m.Send(It.Is<GetCartById>(q => q.CartId == id && q.CurrencyCode == currencyCode), default))
            .ReturnsAsync(expected);

        var result = await _controller.GetCartById(id, currencyCode);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Equal(expected, ok.Value);
    }

    [Fact]
    public async Task ChangeProductCount_ShouldReturnGuid()
    {
        var expected = Guid.NewGuid();
        var command = new ChangeProductCountInCart();
        _mediatorMock.Setup(m => m.Send(It.IsAny<ChangeProductCountInCart>(), default))
            .ReturnsAsync(expected);

        var result = await _controller.ChangeProductCount(command);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Equal(expected, ok.Value);
    }

    [Fact]
    public async Task RemoveProduct_ShouldReturnGuid()
    {
        var expected = Guid.NewGuid();
        var command = new RemoveProductFromCart();
        _mediatorMock.Setup(m => m.Send(It.IsAny<RemoveProductFromCart>(), default))
            .ReturnsAsync(expected);

        var result = await _controller.RemoveProduct(command);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Equal(expected, ok.Value);
    }
}