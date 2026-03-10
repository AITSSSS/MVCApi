using System;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using MVCApi.Application.Commands;
using MVCApi.Application.Dto;
using MVCApi.Application.Queries;
using MVCApi.Controllers;

namespace MVCApi.Tests;

public class AddressControllerTests
{
    private readonly Mock<IMediator> _mediatorMock;
    private readonly AddressController _controller;

    public AddressControllerTests()
    {
        _mediatorMock = new Mock<IMediator>();
        _controller = new AddressController(_mediatorMock.Object);
    }

    [Fact]
    public async Task GetAddressById_ShouldReturnAddressDto()
    {
        var expected = new AddressDto();
        var id = Guid.NewGuid();
        _mediatorMock.Setup(m => m.Send(It.Is<GetAddressById>(q => q.AddressId == id), default))
            .ReturnsAsync(expected);

        var result = await _controller.GetAddressById(id);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Equal(expected, ok.Value);
    }

    [Fact]
    public async Task EditAddress_ShouldReturnGuid()
    {
        var expected = Guid.NewGuid();
        var id = Guid.NewGuid();
        var command = new EditAddress();
        _mediatorMock.Setup(m => m.Send(It.Is<EditAddress>(c => c.Id == id), default))
            .ReturnsAsync(expected);

        var result = await _controller.EditAddress(id, command);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Equal(expected, ok.Value);
    }
}
