using System;

namespace MVCApi.Domain.Exceptions;

public class ProductAlreadyInCartException : Exception
{
    public Guid CartId { get; init; }
    public Guid ProductId { get; init; }

    public ProductAlreadyInCartException(Guid cartId, Guid productId)
        : base($"{productId} is already in cart {cartId}")
    {
        CartId = cartId;
        ProductId = productId;
    }
}