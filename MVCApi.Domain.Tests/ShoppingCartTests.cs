using MVCApi.Domain.Entites;
using MVCApi.Domain.Enums;

namespace MVCApi.Domain.Tests
{
    public class ShoppingCartTests
    {
        private static Currency VALID_CURRENCY = Currency.Create("PLN", 2);
        private const string VALID_NAME = "Produkt Testowny";
        private const string VALID_DESCRIPTION = "Opis wspaniały dla jego.";
        private const string VALID_IMAGE = "https://image-hosting.org/image.jpg";
        private const decimal VALID_PRICE = 20.0m;

        private Product CreateValidProduct()
        {
            return Product.Create(VALID_NAME, VALID_DESCRIPTION, VALID_IMAGE, VALID_PRICE, VALID_CURRENCY);
        }

        [Fact]
        public void Create_ShouldInitializeEmptyProductsAndOperableState()
        {
            //Act
            var cart = ShoppingCart.Create();
            //Assert
            Assert.NotNull(cart);
            Assert.Empty(cart.Products);
            Assert.Equal(ShoppingCartState.Operable, cart.State);
        }

        [Fact]
        public void AddProduct_WhenOperable_ShouldAddProductCartToCollection()
        {
            //Arrange
            var cart = ShoppingCart.Create();
            var product = CreateValidProduct();
            int count = 3;
            //Act
            cart.AddProduct(product, count);
            //Assert
            Assert.Single(cart.Products);
            var productCart = cart.Products.First();
            Assert.Equal(product, productCart.Product);
            Assert.Equal(cart, productCart.ShoppingCart);
            Assert.Equal(count, productCart.Count);
        }

        [Fact]
        public void AddProduct_WhenLocked_ShouldNotModifyCollection()
        {
            //Arrange
            var cart = ShoppingCart.Create();
            cart.Lock();
            var product = CreateValidProduct();
            int count = 3;
            //Act
            cart.AddProduct(product, count);
            //Assert
            Assert.Empty(cart.Products);
        }

        [Fact]
        public void RemoveProduct_WhenOperable_ShouldRemoveExistingProduct()
        {
            //Arrange
            var cart = ShoppingCart.Create();
            var product = CreateValidProduct();
            cart.AddProduct(product, 2);
            Assert.Single(cart.Products);
            //Act
            cart.RemoveProduct(product.Id);
            //Assert
            Assert.Empty(cart.Products);
        }

        [Fact]
        public void RemoveProduct_WhenLocked_ShouldNotModifyCollection()
        {
            //Arrange
            var cart = ShoppingCart.Create();
            var product = CreateValidProduct();
            cart.AddProduct(product, 2);
            cart.Lock();
            Assert.Single(cart.Products);
            //Act
            cart.RemoveProduct(product.Id);
            //Assert
            Assert.Single(cart.Products);
        }

        [Fact]
        public void RemoveProduct_WithNonExistentProduct_ShouldDoNothing()
        {
            //Arrange
            var cart = ShoppingCart.Create();
            var product = CreateValidProduct();
            cart.AddProduct(product, 2);
            var nonExistentId = Guid.NewGuid();
            //Act
            cart.RemoveProduct(nonExistentId);
            //Assert
            Assert.Single(cart.Products);
        }

        [Fact]
        public void ChangeProductCount_WhenOperable_ShouldUpdateCount()
        {
            //Arrange
            var cart = ShoppingCart.Create();
            var product = CreateValidProduct();
            int initialCount = 2;
            cart.AddProduct(product, initialCount);
            var productCart = cart.Products.First();
            Assert.Equal(initialCount, productCart.Count);
            //Act
            int newCount = 5;
            cart.ChangeProductCount(product.Id, newCount);
            //Assert
            Assert.Equal(newCount, productCart.Count);
        }

        [Fact]
        public void ChangeProductCount_WhenLocked_ShouldNotUpdateCount()
        {
            //Arrange
            var cart = ShoppingCart.Create();
            var product = CreateValidProduct();
            int initialCount = 2;
            cart.AddProduct(product, initialCount);
            cart.Lock();
            var productCart = cart.Products.First();
            //Act
            cart.ChangeProductCount(product.Id, 5);
            //Assert
            Assert.Equal(initialCount, productCart.Count);
        }

        [Fact]
        public void ChangeProductCount_WithNonExistentProduct_ShouldDoNothing()
        {
            //Arrange
            var cart = ShoppingCart.Create();
            var product = CreateValidProduct();
            cart.AddProduct(product, 2);
            var nonExistentId = Guid.NewGuid();
            //Act
            cart.ChangeProductCount(nonExistentId, 5);
            //Assert
            var productCart = cart.Products.First();
            Assert.Equal(2, productCart.Count);
        }

        [Fact]
        public void Clear_WhenOperable_ShouldEmptyProducts()
        {
            //Arrange
            var cart = ShoppingCart.Create();
            var product1 = CreateValidProduct();
            var product2 = CreateValidProduct();
            cart.AddProduct(product1, 1);
            cart.AddProduct(product2, 2);
            Assert.Equal(2, cart.Products.Count);
            //Act
            cart.Clear();
            //Assert
            Assert.Empty(cart.Products);
        }

        [Fact]
        public void Clear_WhenLocked_ShouldNotClear()
        {
            //Arrange
            var cart = ShoppingCart.Create();
            var product = CreateValidProduct();
            cart.AddProduct(product, 2);
            cart.Lock();
            Assert.Single(cart.Products);
            //Act
            cart.Clear();
            //Assert
            Assert.Single(cart.Products);
        }

        [Fact]
        public void Lock_ShouldChangeStateToLocked()
        {
            //Arrange
            var cart = ShoppingCart.Create();
            Assert.Equal(ShoppingCartState.Operable, cart.State);
            //Act
            cart.Lock();
            //Assert
            Assert.Equal(ShoppingCartState.Locked, cart.State);
        }
    }
}