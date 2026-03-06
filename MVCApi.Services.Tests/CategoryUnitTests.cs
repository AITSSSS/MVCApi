using MediatR;
using Microsoft.AspNetCore.Mvc;
using Moq;
using MVCApi.Application.Commands;
using MVCApi.Application.Dto;
using MVCApi.Application.Queries;
using MVCApi.Controllers;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

public class CategoryControllerTests
{
    private readonly Mock<IMediator> _mediatorMock;
    private readonly CategoryController _controller;

    public CategoryControllerTests()
    {
        _mediatorMock = new Mock<IMediator>();
        _controller = new CategoryController(_mediatorMock.Object);
    }

    [Fact]
    public async Task CreateCategory_ShouldReturnGuid()
    {
        var expected = Guid.NewGuid();
        _mediatorMock.Setup(m => m.Send(It.IsAny<CreateCategory>(), default))
                     .ReturnsAsync(expected);

        var result = await _controller.CreateCategory(new CreateCategory());

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Equal(expected, ok.Value);
    }

    [Fact]
    public async Task CreateSubcategory_ShouldReturnGuid()
    {
        var expected = Guid.NewGuid();
        _mediatorMock.Setup(m => m.Send(It.IsAny<CreateSubcategory>(), default))
                     .ReturnsAsync(expected);

        var result = await _controller.CreateSubcategory(new CreateSubcategory());

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Equal(expected, ok.Value);
    }

    [Fact]
    public async Task GetAllCategories_ShouldReturnList()
    {
        var expected = new List<CategoryDto> { new CategoryDto() };
        _mediatorMock.Setup(m => m.Send(It.IsAny<GetAllCategories>(), default))
                     .ReturnsAsync(expected);

        var result = await _controller.GetAllCategories();

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Equal(expected, ok.Value);
    }

    [Fact]
    public async Task GetCategoryById_ShouldReturnCategory()
    {
        var expected = new CategoryDto();
        var id = Guid.NewGuid();
        _mediatorMock.Setup(m => m.Send(It.Is<GetCategoryById>(q => q.CategoryId == id), default))
                     .ReturnsAsync(expected);

        var result = await _controller.GetCategoryById(id);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Equal(expected, ok.Value);
    }

    [Fact]
    public async Task GetRootCategories_ShouldReturnList()
    {
        var expected = new List<CategoryDto> { new CategoryDto() };
        _mediatorMock.Setup(m => m.Send(It.IsAny<GetRootCategories>(), default))
                     .ReturnsAsync(expected);

        var result = await _controller.GetRootCategories();

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Equal(expected, ok.Value);
    }

    [Fact]
    public async Task AddProductToCategory_ShouldReturnGuid()
    {
        var expected = Guid.NewGuid();
        _mediatorMock.Setup(m => m.Send(It.IsAny<AddProductToCategory>(), default))
                     .ReturnsAsync(expected);

        var result = await _controller.AddProductToCategory(new AddProductToCategory());

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Equal(expected, ok.Value);
    }

    [Fact]
    public async Task GetRootCategory_ShouldReturnCategory()
    {
        var expected = new CategoryDto();
        var id = Guid.NewGuid();
        _mediatorMock.Setup(m => m.Send(It.Is<GetRootCategory>(q => q.CategoryId == id), default))
                     .ReturnsAsync(expected);

        var result = await _controller.GetRootCategory(id);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Equal(expected, ok.Value);
    }
}