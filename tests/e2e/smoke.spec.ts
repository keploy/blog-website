import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '.env.test') });

test('homepage loads successfully', async ({ page }) => {
    await page.goto(process.env.BASE_URL);
    await expect(page).toHaveTitle('Engineering | Keploy Blog');
});