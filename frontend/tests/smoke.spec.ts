import { expect, test } from '@playwright/test';

test.describe('Duman testleri', () => {
  test('kimlik doğrulanmamış kullanıcıyı girişe yönlendirir', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('kimlik doğrulanmış kullanıcıyı panele yönlendirir', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('token', 'existing-token');
    });

    await page.goto('/');
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('giriş formunu gösterir', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /tekrar hoşgeldiniz/i })).toBeVisible();
    await expect(page.getByPlaceholder('Kullanıcı adınızı girin')).toBeVisible();
    await expect(page.getByPlaceholder('Şifrenizi girin')).toBeVisible();
    await expect(page.getByRole('button', { name: /giriş yap/i })).toBeVisible();
  });

  test('kayıt şifreleri uyuşmadığında uyarı gösterir', async ({ page }) => {
    await page.goto('/register');

    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toContain('Şifreler uyuşmuyor');
      await dialog.accept();
    });

    await page.getByPlaceholder('Ad', { exact: true }).fill('Test');
    await page.getByPlaceholder('Soyad', { exact: true }).fill('Kullanıcı');
    await page.getByPlaceholder('Bir kullanıcı adı seçin').fill('testuser');
    await page.getByPlaceholder('E-posta adresinizi girin').fill('test@example.com');
    await page.getByPlaceholder('Bir şifre oluşturun').fill('Password123!');
    await page.getByPlaceholder('Şifrenizi tekrar girin').fill('Password456!');

    await page.getByRole('button', { name: /hesap oluştur/i }).click();
  });

  test('başarılı giriş sonrası panele gider', async ({ page }) => {
    await page.route('**/auth-service/api/auth/token', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
        }),
      });
    });

    await page.goto('/login');
    await page.getByPlaceholder('Kullanıcı adınızı girin').fill('demo');
    await page.getByPlaceholder('Şifrenizi girin').fill('Password123!');
    await page.getByRole('button', { name: /giriş yap/i }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect
      .poll(async () => page.evaluate(() => localStorage.getItem('token')))
      .toBe('mock-access-token');
  });

  test('paneldeki işlem siparişlere yönlendirir', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('token', 'existing-token');
    });

    await page.route('**/auth-service/api/auth/refresh-token', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'existing-token',
          refresh_token: 'existing-refresh-token',
        }),
      });
    });

    await page.route('**/user-service/api/users', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      });
    });

    await page.route('**/place-service/api/places', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      });
    });

    await page.route('**/product-service/api/products', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      });
    });

    await page.route('**/order-service/api/orders', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      });
    });

    await page.route('**/order-service/api/orders/active', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      });
    });

    await page.route('**/order-service/api/orders/recent', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      });
    });

    await page.route('**/order-service/api/orders/dashboard/summary', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            activeOrderCount: 0,
            waitingPaymentCount: 0,
            completedOrderCount: 0,
            totalRevenue: 0,
            recentOrders: [],
          },
        }),
      });
    });

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard$/);
    await page.getByTestId('dashboard-new-order').click();
    await expect(page).toHaveURL(/\/orders$/);
  });

  test('panelde tüm ürünleri gör ürünler sayfasına yönlendirir', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('token', 'existing-token');
    });

    await page.route('**/auth-service/api/auth/refresh-token', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'existing-token',
          refresh_token: 'existing-refresh-token',
        }),
      });
    });

    await page.route('**/user-service/api/users', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      });
    });

    await page.route('**/place-service/api/places', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      });
    });

    await page.route('**/product-service/api/products', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      });
    });

    await page.route('**/order-service/api/orders', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      });
    });

    await page.route('**/order-service/api/orders/active', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      });
    });

    await page.route('**/order-service/api/orders/recent', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      });
    });

    await page.route('**/order-service/api/orders/dashboard/summary', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            activeOrderCount: 0,
            waitingPaymentCount: 0,
            completedOrderCount: 0,
            totalRevenue: 0,
            recentOrders: [],
          },
        }),
      });
    });

    await page.goto('/dashboard');
    await page.getByTestId('dashboard-view-all-products').click();
    await expect(page).toHaveURL(/\/products$/);
  });
});
