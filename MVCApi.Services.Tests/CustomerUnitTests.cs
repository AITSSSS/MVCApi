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
    public class CustomerUnitTests
    {
        private readonly Mock<IMediator> _mediatorMock;
        private readonly CustomerController _controller;

        public CustomerUnitTests()
            {
            _mediatorMock = new Mock<IMediator>();
            _controller = new CustomerController(_mediatorMock.Object);
        }
        [Fact]
        public async Task CreateUser_ShouldReturnGuid()
        {
            var expected = Guid.NewGuid();
            _mediatorMock.Setup(m => m.Send(It.IsAny<CreateCustomer>(), default))
                         .ReturnsAsync(expected);

            var result = await _controller.CreateCustomer(new CreateCustomer());

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Equal(expected, ok.Value);

        }
        [Fact]
        public async Task GetCustomerById_ShouldReturnCategory()
        {
            var expected = new CustomerDto();
            var id = Guid.NewGuid();
            _mediatorMock.Setup(m => m.Send(It.Is<GetCustomerById>(q => q.CustomerId == id), default))
                         .ReturnsAsync(expected);

            var result = await _controller.GetCustomerById(id);

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Equal(expected, ok.Value);
        }
        [Fact]
        public async Task AddAddress_ReturnsGuid()
        {
            var expected = Guid.NewGuid();

            _mediatorMock
                .Setup(x => x.Send(It.IsAny<AddAddress>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(expected);

            var result = await _controller.AddAddress(new AddAddress());

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Equal(expected, ok.Value);
        }
        [Fact]
        public async Task AddContactInfo_ReturnsGuid()
        {
            var expected = Guid.NewGuid();

            _mediatorMock
                .Setup(x => x.Send(It.IsAny<AddContactInfo>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(expected);

            var result = await _controller.AddContactInfo(new AddContactInfo());

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Equal(expected, ok.Value);
        }
        [Fact]
        public async Task EditCustomer_ShouldReturnGuid()
        {
            var id = Guid.NewGuid();
            var expected = Guid.NewGuid();

            _mediatorMock
                .Setup(x => x.Send(It.IsAny<EditCustomer>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(expected);

            var command = new EditCustomer();

            var result = await _controller.EditCustomer(id, command);

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Equal(expected, ok.Value);
        }
        [Fact]
        public async Task GetAllCustomers_ShouldReturnList()
        {
            var expected = new List<CustomerDto> { new CustomerDto() };
            _mediatorMock
    .Setup(m => m.Send(It.IsAny<GetAllCustomers>(), It.IsAny<CancellationToken>()))
    .ReturnsAsync(expected);

            var result = await _controller.GetAllCustomers();

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Equal(expected, ok.Value);
        }


    }


}
