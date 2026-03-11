using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using MVCApi.Application.Commands;
using MVCApi.Application.Dto;
using MVCApi.Application.Queries;
using MVCApi.Controllers;

namespace MVCApi.Tests;

public class OrderControllerTests
{
    private readonly Mock<IMediator> _mediatorMock;
    private readonly OrderController _controller;

    public OrderControllerTests()
    {
        _mediatorMock = new Mock<IMediator>();
        _controller = new OrderController(_mediatorMock.Object);
    }

    [Fact]
    public async Task CreateOrder_ShouldReturnGuid()
    {
        var expected = Guid.NewGuid();
        var command = new CreateOrder();
        _mediatorMock.Setup(m => m.Send(It.IsAny<CreateOrder>(), default))
            .ReturnsAsync(expected);

        var result = await _controller.CreateOrder(command);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Equal(expected, ok.Value);
    }

    [Fact]
    public async Task GetOrderById_ShouldReturnOrderDto()
    {
        var expected = new OrderDto();
        var id = Guid.NewGuid();
        var currencyCode = "USD";
        _mediatorMock.Setup(m =>
                m.Send(It.Is<GetOrderById>(q => q.OrderId == id && q.CurrencyCode == currencyCode), default))
            .ReturnsAsync(expected);

        var result = await _controller.GetOrderById(id, currencyCode);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Equal(expected, ok.Value);
    }

    [Fact]
    public async Task GetAllOrders_ShouldReturnList()
    {
        var expected = new List<OrderDto> { new OrderDto() };
        var currencyCode = "USD";
        _mediatorMock.Setup(m => m.Send(It.Is<GetAllOrders>(q => q.CurrencyCode == currencyCode), default))
            .ReturnsAsync(expected);

        var result = await _controller.GetAllOrders(currencyCode);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Equal(expected, ok.Value);
    }

    [Fact]
    public async Task GetOrdersInDateRange_ShouldReturnList()
    {
        var expected = new List<OrderDto> { new OrderDto() };
        var startDate = new DateTime(2023, 1, 1);
        var endDate = new DateTime(2023, 12, 31);
        var currencyCode = "USD";
        _mediatorMock.Setup(m => m.Send(It.Is<GetOrdersInDateRange>(q =>
                q.StartDate == startDate && q.EndDate == endDate && q.CurrencyCode == currencyCode), default))
            .ReturnsAsync(expected);

        var result = await _controller.GetOrdersInDateRange(startDate, endDate, currencyCode);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Equal(expected, ok.Value);
    }

    [Fact]
    public async Task ChangeState_ShouldReturnGuid()
    {
        var expected = Guid.NewGuid();
        var command = new ChangeOrderState();
        _mediatorMock.Setup(m => m.Send(It.IsAny<ChangeOrderState>(), default))
            .ReturnsAsync(expected);

        var result = await _controller.ChangeState(command);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Equal(expected, ok.Value);
    }
}