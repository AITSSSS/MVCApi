using System;
using System.Text;

namespace MVCApi.Domain.Exceptions;

public class LengthException : Exception
{
    public string Field { get; init; }
    public Type Class { get; init; }
    public int? Min { get; init; }
    public int? Max { get; init; }

    public LengthException(string field, Type _class, int? min, int? max)
    {
        Field = field;
        Class = _class;
        Min = min;
        Max = max;

        var sb = new StringBuilder($"Invalid length of {field} in {_class.Name}.");
        if (min.HasValue)
        {
            sb.Append($" Minimum: {min.Value}.");
        }

        if (max.HasValue)
        {
            sb.Append($" Maximum: {max.HasValue}");  
        }
    }
}
