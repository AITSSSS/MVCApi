using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using MVCApi.Domain;
using MVCApi.Domain.Entites;
using MVCApi.Domain.Exceptions;

namespace MVCApi.Application.Commands
{
    public class AddProductToCart : IRequest<Guid>
    {
        public Guid CartId { get; init; }
        public Guid ProductId { get; init; }
        public int Count { get; init; }

        public class Handler : IRequestHandler<AddProductToCart, Guid>
        {
            private readonly IDomainRepository<ShoppingCart> _cartRepository;
            private readonly IDomainRepository<Product> _productRepository;

            public Handler(IDomainRepository<ShoppingCart> cartRepository, IDomainRepository<Product> productRepository)
            {
                _cartRepository = cartRepository;
                _productRepository = productRepository;
            }

            public async Task<Guid> Handle(AddProductToCart request, CancellationToken cancellationToken)
            {
                var product = await _productRepository.GetByIdAsync(request.ProductId);
                var cart = await _cartRepository.GetByIdAsync(request.CartId);

                try 
                {
                    cart.AddProduct(product, request.Count);
                }
                catch (ProductAlreadyInCartException)
                {
                    // TODO: Return error message to FE instead.
                    return cart.Id;   
                }
                catch (InvalidProductCount)
                {
                    return cart.Id;
                }

                await _cartRepository.EditAsync(cart);

                return cart.Id;
            }
        }
    }
}