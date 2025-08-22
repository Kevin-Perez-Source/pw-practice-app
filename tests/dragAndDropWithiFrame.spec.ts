import {expect, test} from '@playwright/test'

test('drag and drop with iframe', async({page}) => {
    await page.goto('https://www.globalsqa.com/demo-site/draganddrop/')

    // Locator below wont work since the whole section is located inside an iframe
    // iframe is like and html within an html, so like a website inside a website
    // await page.locator('li', {hasText: "High Tatras 2"}).click()

    const frame = page.frameLocator('[rel-title="Photo Manager"] iframe')
    await frame.locator('li', {hasText: "High Tatras 2"}).dragTo(frame.locator('#trash'))
    
    // More precise control
    await frame.locator('li', {hasText: "High Tatras 4"}).hover()
    await page.mouse.down()
    await frame.locator('#trash').hover()
    await page.mouse.up()
    
    await expect(frame.locator('#trash li h5')).toHaveText(["High Tatras 2", "High Tatras 4"])
    await page.pause()
})