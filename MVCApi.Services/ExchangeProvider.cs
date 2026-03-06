using System.IO;
using System.Net.Http;
using System.Security.Cryptography.X509Certificates;
using System.Threading.Tasks;
using MVCApi.Domain.Exceptions;
using Newtonsoft.Json;

namespace MVCApi.Services;

public class ExchangeProvider : IExchangeProvider
{
    public async Task<decimal?> GetRate(string currencyCode)
    {
        if (string.IsNullOrEmpty(currencyCode))
        {
            return null;
        }

        HttpClient client = new HttpClient();
        try
        {
            var response = await client.GetStreamAsync($"http://api.nbp.pl/api/exchangerates/rates/a/{currencyCode.ToLower()}/?format=json");
            decimal rate;
            using (var reader = new StreamReader(response))
            {
                var serializer = JsonSerializer.Create();
                var jsonReader = new JsonTextReader(reader);
                dynamic json = serializer.Deserialize(jsonReader);
                rate = json.rates[0].mid;
            }

            return rate;
        } 
        catch (HttpRequestException ex)
        {
            if (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                throw new InvalidCurrencyCodeException(currencyCode);
            }

            throw ex;
        }
    }
}