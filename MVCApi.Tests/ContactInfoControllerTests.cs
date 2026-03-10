using System;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using MVCApi.Application.Commands;
using MVCApi.Application.Dto;
using MVCApi.Application.Queries;
using MVCApi.Controllers;

namespace MVCApi.Tests;

public class ContactInfoControllerTests
{
    private readonly Mock<IMediator> _mediatorMock;
    private readonly ContactInfoController _controller;

    public ContactInfoControllerTests()
    {
        _mediatorMock = new Mock<IMediator>();
        _controller = new ContactInfoController(_mediatorMock.Object);
    }

    [Fact]
    public async Task GetContactInfoById_ShouldReturnContactInfoDto()
    {
        var expected = new ContactInfoDto();
        var id = Guid.NewGuid();
        _mediatorMock.Setup(m => m.Send(It.Is<GetContactInfoById>(q => q.ContactInfoId == id), default))
            .ReturnsAsync(expected);

        var result = await _controller.GetContactInfoById(id);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Equal(expected, ok.Value);
    }

    [Fact]
    public async Task EditContactInfo_ShouldReturnGuid()
    {
        var expected = Guid.NewGuid();
        var id = Guid.NewGuid();
        var command = new EditContactInfo();
        _mediatorMock.Setup(m => m.Send(It.Is<EditContactInfo>(c => c.ContactInfoId == id), default))
            .ReturnsAsync(expected);

        var result = await _controller.EditContactInfo(id, command);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Equal(expected, ok.Value);
    }
}