import {expect, test} from '@playwright/test'

test.beforeEach(async ({page}, testInfo) => {
    await page.goto('http://uitestingplayground.com/ajax')
    await page.getByText('Button Triggering AJAX Request').click()
    testInfo.setTimeout(testInfo.timeout + 2000) // Increase timeout for this test by + 2 seconds
})  

test('Auto waiting', async ({page}) => {
    const successButton = page.locator('.bg-success')
    await successButton.click()

    // Not all methods contain auto waiting, for example textContent() does but not .allTextContents()
    // const text = await successButton.textContent()
    // This will wait for the element to be visible before getting the text
    // await successButton.waitFor({ state: 'visible' })
    // const text = await successButton.allTextContents()
    // expect(text).toContain('Data loaded with AJAX get request.')

    // This also will fail since it times out after 5 seconds, but you can add custom timeout
    await expect(successButton).toHaveText('Data loaded with AJAX get request.', { timeout: 20000 })
})

test('Alternative Waits', async ({page}) => { 
    const successButton = page.locator('.bg-success')

    // ____ Wait for element to be visible
    //await page.waitForSelector('.bg-success', { state: 'visible' })

    // ___ Wait for particular response
    await page.waitForResponse('http://uitestingplayground.com/ajaxdata')

    // ___ Wait for network calls to be completed ('NOT RECOMMENDED')
    await page.waitForLoadState('networkidle')

    const text = await successButton.allTextContents()
    expect(text).toContain('Data loaded with AJAX get request.')
})

test('Timeouts', async ({page}) => { 
    // Set timeout for this test to 20 seconds
    test.setTimeout(20000)
    // Multiply the default timeout by 3
    test.slow()
    const successButton = page.locator('.bg-success')
    // The custom timeout will override the default timeout set in playwright.config.ts, but not the test.timeout
    //await successButton.click({timeout: 16000}) // Custom timeout of 16 seconds
    await successButton.click()
})