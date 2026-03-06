using System;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using MVCApi.Application;
using MVCApi.Application.Commands;
using MVCApi.Domain;
using MVCApi.Services;
using MVCApi.Services.Exceptions;

namespace MVCApi
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            var dbConnectionString = Configuration.GetConnectionString("eshopdb");

            services.AddControllers();

            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "MVCApi", Version = "v1" });
                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    In = ParameterLocation.Header,
                    Description = "JWT Token",
                    Name = "Bearer",
                    Type = SecuritySchemeType.Http,
                    Scheme = "bearer",
                    BearerFormat = "JWT"
                });
                c.AddSecurityRequirement(new OpenApiSecurityRequirement {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        new string[] {}
                    }
                });
            });

            services.AddDbContext<EShopContext>(options =>
                options.UseLazyLoadingProxies()
                    .UseSqlServer(Configuration.GetConnectionString("eshopdb"),
                        b => b.MigrationsAssembly("MVCApi")));

            services.AddMediatR(typeof(CreateCustomer));

            services.AddScoped(typeof(IDomainRepository<>), typeof(DomainRepository<>));

            services.Configure<IdentityOptions>(options =>
            {
                options.Password.RequireDigit = true;
                options.Password.RequireLowercase = true;
                options.Password.RequireNonAlphanumeric = true;
                options.Password.RequireUppercase = true;
                options.Password.RequiredLength = 8;
                options.Password.RequiredUniqueChars = 1;

                options.User.AllowedUserNameCharacters =
                    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789~`!@#$%^&*()_-+={[}]|\\:;\"'<,>.?/";
                options.User.RequireUniqueEmail = true;
            });

            services.AddHttpContextAccessor();

            services.AddScoped(typeof(IUserService), typeof(UserService));

            services.AddIdentity<ApplicationUser, IdentityRole<Guid>>()
                .AddEntityFrameworkStores<EShopContext>()
                .AddRoles<IdentityRole<Guid>>()
                .AddDefaultTokenProviders();

            services.AddCors(options =>
            {
                options.AddPolicy("cors_policy",
                    builder =>
                    {
                        builder.SetIsOriginAllowed(_ => true)
                            .AllowAnyHeader().AllowAnyMethod().AllowCredentials();
                    });
            });

            services.AddAutoMapper(typeof(MappingProfile).Assembly);

            services.AddScoped<ICurrencyService, CurrencyService>();
            services.AddScoped<IExchangeProvider, ExchangeProvider>();

            var jwtSettings = Configuration.GetSection("JwtSettings");
            services.AddAuthentication(opt =>
            {
                opt.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                opt.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = false,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtSettings.GetSection("validIssuer").Value,
                    ValidAudience = jwtSettings.GetSection("validAudience").Value,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.GetSection("securityKey").Value))
                };
            });

            services.AddAuthorization(opt =>
            {
                var defaultAuthorizationPolicyBuilder = new AuthorizationPolicyBuilder(
                                JwtBearerDefaults.AuthenticationScheme);

                defaultAuthorizationPolicyBuilder =
                    defaultAuthorizationPolicyBuilder.RequireAuthenticatedUser();

                opt.DefaultPolicy = defaultAuthorizationPolicyBuilder.Build();
            });

            services.AddScoped<JwtHandler>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public async void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.UseCors("cors_policy");

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "MVCApi v1"));
            }

            app.UseRouting();

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints => { endpoints.MapControllers(); });

            await CreateAdmin(app.ApplicationServices);
        }

        private async Task CreateAdmin(IServiceProvider services)
        {
            using var scope = services.CreateScope();
            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

            if (!(await roleManager.RoleExistsAsync("Admin")))
            {
                var result = await roleManager.CreateAsync(new IdentityRole<Guid> { Name = "Admin" });
                if (!result.Succeeded)
                    throw new IdentityException(result.Errors.Select(x => x.Description));
            }

            if (await userManager.FindByEmailAsync(Configuration["SiteAdminEmail"]) == null)
            {
                var user = new ApplicationUser
                {
                    UserName = Configuration["SiteAdminName"],
                    Email = Configuration["SiteAdminEmail"]
                };

                var result = await userManager.CreateAsync(user, Configuration["SiteAdminPassword"]);

                if (!result.Succeeded)
                    throw new IdentityException(result.Errors.Select(x => x.Description));

                result = await userManager.AddToRoleAsync(user, "Admin");

                if (!result.Succeeded)
                    throw new IdentityException(result.Errors.Select(x => x.Description));
            }
        }
    }
}