using MVCApi.Domain.Consts;
using MVCApi.Domain.Entites;
using MVCApi.Domain.Exceptions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MVCApi.Services.Tests
{
    public class EntitiesUnitTests
    {

        [Fact]
        public void CreateAddress_ShouldSetAllProperties()
        {
            var address = Address.Create("Polska", "Warszawa", "Wiejska", "1", "00-001");

            Assert.Equal("Polska", address.Country);
            Assert.Equal("Warszawa", address.City);
            Assert.Equal("Wiejska", address.Street);
            Assert.Equal("1", address.StreetNumber);
            Assert.Equal("00-001", address.PostCode);
        }
        [Fact]
        public void ChangeCountry_ShouldUpdateCountry()
        {
            var address = Address.Create("Polska", "Warszawa", "Wiejska", "1", "00-001");

            address.ChangeCountry("Niemcy");

            Assert.Equal("Niemcy", address.Country);
        }
        [Fact]
        public void ChangeCity_ShouldUpdateCity()
        {
            var address = Address.Create("Polska", "Warszawa", "Wiejska", "1", "00-001");

            address.ChangeCity("Gdańsk");

            Assert.Equal("Gdańsk", address.City);
        }
        [Fact]
        public void ChangeStreet_ShouldUpdateStreet()
        {
            var address = Address.Create("Polska", "Warszawa", "Wiejska", "1", "00-001");

            address.ChangeStreet("Miejska");

            Assert.Equal("Miejska", address.Street);
        }
        [Fact]
        public void ChangeStreetNumber_ShouldUpdateStreetNumber()
        {
            var address = Address.Create("Polska", "Warszawa", "Wiejska", "1", "00-001");

            address.ChangeStreetNumber("10A");

            Assert.Equal("10A", address.StreetNumber);
        }
        [Fact]
        public void ChangePostCode_ShouldUpdatePostCode()
        {
            var address = Address.Create("Polska", "Warszawa", "Wiejska", "1", "00-001");

            address.ChangePostCode("11-111");

            Assert.Equal("11-111", address.PostCode);
        }
        [Fact]
        public void CreateCategory_ShouldSetAllProperties()
        {
            var category = Category.Create("Jedzenie");
            Assert.Equal("Jedzenie", category.Name);
            Assert.Empty(category.Children);
            Assert.Empty(category.Products);
            Assert.Null(category.Parent);
            Assert.Null(category.ParentId);
        }
        [Fact]
        public void CreateCategory_WithParent_ShouldSetParentAndParentId()
        {
            var parent = Category.Create("Jedzenie");
            var child = Category.Create("Owoce", parent);

            Assert.Equal("Owoce", child.Name);
            Assert.Equal(parent.Id, child.ParentId);
            Assert.Equal(parent, child.Parent);
            Assert.Empty(child.Children);
            Assert.Empty(child.Products);
        }
        [Fact]
        public void CreateContactInfo_ShouldSetAllProperties()
        {
            var contactInfo = ContactInfo.Create("ola@poczta.com", "123123123");
            Assert.Equal("ola@poczta.com", contactInfo.Email);
            Assert.Equal("123123123", contactInfo.PhoneNumber);
        }
        [Fact]
        public void ChangeEmail_ShouldUpdateEmail()
        {
            var contactInfo = ContactInfo.Create("ola@poczta.com", "123123123");

            contactInfo.ChangeEmail("aleksandra@poczta.com");

            Assert.Equal("aleksandra@poczta.com", contactInfo.Email);
        }
        [Fact]
        public void ChangePhone_ShouldUpdatePhone()
        {
            var contactInfo = ContactInfo.Create("ola@poczta.com", "123123123");

            contactInfo.ChangePhoneNumber("456456456");

            Assert.Equal("456456456", contactInfo.PhoneNumber);
        }
        [Fact]
        public void CreateCurrency_ShouldSetAllProperties()
        {
            var currency = Currency.Create("PLN", 2);
            Assert.Equal("PLN", currency.Code);
            Assert.Equal(2, currency.DecimalPlaces);

        }
        [Fact]
        public void CreateCustomer_ShouldSetAllProperties()
        {
            var address = Address.Create("Poland", "Bialystok", "Wiejska", "45", "15-350");
            var contact = ContactInfo.Create("jan@poczta.wp.pl", "123456789");
            var customer = Customer.Create("Jan", "Kowalski", new DateTime(1998, 1, 1), address, contact);
            Assert.Equal("Jan", customer.FirstName);
            Assert.Equal("Kowalski", customer.LastName);
            Assert.Equal(new DateTime(1998, 1, 1), customer.DateOfBirth);

            Assert.Single(customer.Addresses);

            Assert.Single(customer.ContactInfos);
        }
        [Fact]
        public void ChangeLastName_ShouldUpdateLastName()
        {
            var address = Address.Create("Poland", "Bialystok", "Wiejska", "45", "15-350");
            var contact = ContactInfo.Create("jan@poczta.wp.pl", "123456789");
            var customer = Customer.Create("Jan", "Kowalski", new DateTime(1998, 1, 1), address, contact);

            customer.ChangeLastName("Nowak");

            Assert.Equal("Nowak", customer.LastName);
        }

    }

}
