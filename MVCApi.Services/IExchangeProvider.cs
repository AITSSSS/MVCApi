using System.Threading.Tasks;

namespace MVCApi.Services;

public interface IExchangeProvider
{
    public Task<decimal?> GetRate(string currencyCode);
}