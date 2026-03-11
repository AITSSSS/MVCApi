using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using MVCApi.Application.Commands;
using MVCApi.Application.Dto;
using MVCApi.Application.Queries;
using MVCApi.Controllers;
using MVCApi.Domain;

namespace MVCApi.Tests;

public class ProductControllerTests
{
    private readonly Mock<IMediator> _mediatorMock;
    private readonly ProductController _controller;

    public ProductControllerTests()
    {
        _mediatorMock = new Mock<IMediator>();
        _controller = new ProductController(_mediatorMock.Object);
    }

    [Fact]
    public async Task CreateProduct_ShouldReturnGuid()
    {
        var expected = Guid.NewGuid();
        var command = new CreateProduct();
        _mediatorMock.Setup(m => m.Send(It.IsAny<CreateProduct>(), default))
            .ReturnsAsync(expected);

        var result = await _controller.CreateProduct(command);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Equal(expected, ok.Value);
    }

    [Fact]
    public async Task GetProductById_ShouldReturnProductDto()
    {
        var expected = new ProductDto();
        var id = Guid.NewGuid();
        var currencyCode = "USD";
        _mediatorMock.Setup(m =>
                m.Send(It.Is<GetProductById>(q => q.ProductId == id && q.CurrencyCode == currencyCode), default))
            .ReturnsAsync(expected);

        var result = await _controller.GetProductById(id, currencyCode);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Equal(expected, ok.Value);
    }

    [Fact]
    public async Task GetAllProducts_ShouldReturnList()
    {
        var expected = new List<ProductDto> { new() };
        var currencyCode = "USD";
        _mediatorMock.Setup(m => m.Send(It.Is<GetAllProducts>(q => q.CurrencyCode == currencyCode), default))
            .ReturnsAsync(expected);

        var result = await _controller.GetAllProducts(currencyCode);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Equal(expected, ok.Value);
    }

    [Fact]
    public async Task GetPaginatedProducts_ShouldReturnPaginatedList()
    {
        var expected = new Mock<IPaginatedList<ProductDto>>().Object;
        var pageNumber = 1;
        var pageSize = 10;
        var currencyCode = "USD";
        _mediatorMock.Setup(m => m.Send(It.Is<GetProductsPaginated>(q =>
                q.PageNumber == pageNumber && q.PageSize == pageSize && q.CurrencyCode == currencyCode), default))
            .ReturnsAsync(expected);

        var result = await _controller.GetPaginatedProducts(pageNumber, pageSize, currencyCode);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Equal(expected, ok.Value);
    }

    [Fact]
    public async Task GetPaginatedProductsByCategory_ShouldReturnPaginatedList()
    {
        var expected = new Mock<IPaginatedList<ProductDto>>().Object;
        var pageNumber = 1;
        var pageSize = 10;
        var currencyCode = "USD";
        var categoryId = Guid.NewGuid();
        _mediatorMock.Setup(m => m.Send(It.Is<GetProductsPaginatedByCategory>(q =>
                q.PageNumber == pageNumber && q.PageSize == pageSize &&
                q.CurrencyCode == currencyCode && q.CategoryId == categoryId), default))
            .ReturnsAsync(expected);

        var result = await _controller.GetPaginatedProductsByCategory(pageNumber, pageSize, currencyCode, categoryId);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Equal(expected, ok.Value);
    }

    [Fact]
    public async Task EditProduct_ShouldReturnGuid()
    {
        var expected = Guid.NewGuid();
        var id = Guid.NewGuid();
        var command = new EditProduct();
        _mediatorMock.Setup(m => m.Send(It.Is<EditProduct>(c => c.ProductId == id), default))
            .ReturnsAsync(expected);

        var result = await _controller.EditProduct(id, command);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Equal(expected, ok.Value);
    }
}