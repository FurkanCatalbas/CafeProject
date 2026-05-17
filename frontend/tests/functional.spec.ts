import { expect, test } from '@playwright/test';

test('temel sayfalar açılır ve kullanıcı oluşturma çalışır', async ({ page, request }) => {
  const ts = Date.now();
  const loginUsername = `e2e_user_${ts}`;
  const loginPassword = 'Password123!';

  const registerResponse = await request.post('http://127.0.0.1:10101/auth-service/api/auth/register', {
    data: {
      username: loginUsername,
      password: loginPassword,
      firstName: 'E2E',
      lastName: 'Runner',
      emailAddress: `${loginUsername}@example.com`,
      type: 1,
    },
  });
  expect(registerResponse.ok()).toBeTruthy();

  await page.goto('/login');
  await page.getByPlaceholder('Kullanıcı adınızı girin').fill(loginUsername);
  await page.getByPlaceholder('Şifrenizi girin').fill(loginPassword);
  await page.getByRole('button', { name: /giriş yap/i }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  await page.getByRole('link', { name: 'Panolar' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  await page.getByRole('link', { name: 'Çalışanlar' }).click();
  await expect(page).toHaveURL(/\/users$/);
  await expect(page.getByRole('heading', { name: 'Kullanıcılar' })).toBeVisible();

  const createdUsername = `ui_added_${ts}`;
  await page.getByTestId('users-open-create-modal').click();
  await page.getByPlaceholder('Ad', { exact: true }).fill('UI');
  await page.getByPlaceholder('Soyad', { exact: true }).fill('Oluşturulan');
  await page.getByPlaceholder('Kullanıcı Adı').fill(createdUsername);
  await page.getByPlaceholder('E-posta Adresi').fill(`${createdUsername}@example.com`);
  await page.getByPlaceholder('Şifre').fill('Password123!');
  await page.getByTestId('users-submit-create').click();
  await expect(page.getByText(`@${createdUsername}`)).toBeVisible();

  await page.getByRole('link', { name: 'Masa Yönetimi' }).click();
  await expect(page).toHaveURL(/\/tables$/);
  await expect(page.getByRole('heading', { name: 'Masalar' })).toBeVisible();

  await page.getByRole('link', { name: 'Ürünler' }).click();
  await expect(page).toHaveURL(/\/products$/);
  await expect(page.getByRole('heading', { name: 'Ürünler' })).toBeVisible();

  await page.getByRole('link', { name: 'Siparişler' }).click();
  await expect(page).toHaveURL(/\/orders$/);
  await expect(page.getByRole('heading', { name: 'Siparişler' })).toBeVisible();
});
