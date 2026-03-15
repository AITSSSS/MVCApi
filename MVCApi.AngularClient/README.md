# Eshop

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.1.2.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

## UX foundation implemented

The frontend now includes a global UX feedback layer:

- Angular Material top navigation shell and global loading indicator.
- HTTP interceptor-level error notifications for failed requests.
- Snackbar success/error messaging via a shared UI feedback service.
- Confirm dialog for destructive actions (for example, removing product from cart and canceling order).
- Light/Dark theme toggle in the top bar (default startup theme is always light).

## Quick verification

Run targeted tests used for the current UX/theme implementation:

```bash
npm test -- --watch=false --browsers=ChromeHeadless --include src/app/theme.service.spec.ts --include src/app/ui-feedback.service.spec.ts --include src/app/products/products.component.spec.ts --include src/app/checkout/checkout.component.spec.ts --include src/app/order/order.component.spec.ts
```

Note: current `npm run build` script uses `--localize`. If `@angular/localize` is not installed in your environment, use `npx ng build --configuration development` for local compile checks.
