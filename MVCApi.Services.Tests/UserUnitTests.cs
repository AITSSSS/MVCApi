using MediatR;
using Microsoft.AspNetCore.Mvc;
using Moq;
using MVCApi.Application.Commands;
using MVCApi.Application.Dto;
using MVCApi.Application.Queries;
using MVCApi.Controllers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MVCApi.Services.Tests
{
    public class UserUnitTests
    {
        private readonly Mock<IMediator> _mediatorMock;
        private readonly UserController _controller;

        public UserUnitTests()
        {
            _mediatorMock = new Mock<IMediator>();
            _controller = new UserController(_mediatorMock.Object);
        }

        [Fact]
        public async Task CreateUser_ShouldReturnGuid()
        {
            var expected = Guid.NewGuid();
            _mediatorMock.Setup(m => m.Send(It.IsAny<CreateUser>(), It.IsAny<CancellationToken>()))
                         .ReturnsAsync(expected);

            var result = await _controller.CreateUser(new CreateUser());

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Equal(expected, ok.Value);
        }
        [Fact]
        public async Task SignIn_ShouldReturnAuthResponse()
        {
            var expected = new AuthResponseDto { Token = "abc123" };
            _mediatorMock.Setup(m => m.Send(It.IsAny<SignIn>(), It.IsAny<CancellationToken>()))
                         .ReturnsAsync(expected);

            var result = await _controller.SignIn(new SignIn());

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Equal(expected, ok.Value);
        }
        [Fact]
        public async Task CreateRole_ShouldReturnGuid()
        {
            var expected = Guid.NewGuid();
            _mediatorMock.Setup(m => m.Send(It.IsAny<CreateRole>(), It.IsAny<CancellationToken>()))
                         .ReturnsAsync(expected);

            var result = await _controller.CreateRole(new CreateRole());

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Equal(expected, ok.Value);
        }

    }
}
