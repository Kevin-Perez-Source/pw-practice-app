import {expect, test} from '@playwright/test'

test.beforeEach(async ({page}) => {
    await page.goto('http://localhost:4200/pages/iot-dashboard')
    await page.getByText('Forms').click()
    await page.getByText('Form Layouts').click()
})

test('locator syntax Rules', async ({page}) => {
    //By Tag name
    page.locator('input')

    //By ID
    await page.locator('#inputEmail1').click()

    //By Class name
    page.locator('.shape-rectangle')

    //By Attribute
    page.locator('[placeholder="Email"]')

    //By Class value (full)
    page.locator('[input-full-width size-medium status-basic shape-rectangle nb-transition]')

    //Combine different selectors (from above)
    page.locator('input[placeholder="Email"][nbinput]')

    //By XPath (Not recommended, not good practice in playwright)
    page.locator('//*[@id="inputEmail1"]')

    //By partial text match
    page.locator(':text("Using")')

    //By exact text match
    page.locator(':text("Using the Grid")')
})

test('User facing locators', async ({page}) => {
    // Get by the role of the element
    await page.getByRole('textbox', {name: "Email"}).first().click()
    await page.getByRole('button', {name: 'Sign in'}).first().click()

    // Label Name next to text box
    await page.getByLabel('Email').first().click()
    // Placeholder text used in text box
    await page.getByPlaceholder('Jane Doe').click()
    // Get by text
    await page.getByText('Using the Grid').click()
    // Some websites have dedicated ids for testing, you can search in code.
    await page.getByTestId('SignIn').click()
    // Get by title attribute
    await page.getByTitle('IoT Dashboard').click()
})

test('Locating child elements', async ({page}) => { 
    // The two below function the same way
    await page.locator('nb-card nb-radio :text-is("Option 1")').click()
    await page.locator('nb-card').locator('nb-radio').locator(':text-is("Option 2")').click()
    
    // You can combine nb-card locator with .getByRole
    await page.locator('nb-card').getByRole('button', {name: 'Sign in'}).first().click()
    
    // Avoid using this approach (nth) as order of elements can change in development
    // You can find nth element by inspecting element and filtering by <nb-card>
    // and counting the amount of results (starting from 0)
    await page.locator('nb-card').nth(3).getByRole('button').click()
})

test('Locating parent elements', async ({page}) => { 
    // Search the elements starting from the parent element (nb-card) using hasText
    await page.locator('nb-card', {hasText: 'Using the Grid'}).getByRole('textbox', {name: 'Email'}).click()
    // Search the elements starting from the parent element (nb-card) using has (and another locator, in this case #id)
    await page.locator('nb-card', {has: page.locator('#inputEmail1')}).getByRole('textbox', {name: 'Email'}).click()

    // Works the same as above but instead using a filter
    await page.locator('nb-card').filter({hasText: 'Basic Form'}).getByRole('textbox', {name: 'Email'}).click()
    // Selects all <nb-card> elements.
    // .filter({has: page.locator('.status-danger')}) narrows this down to only those nb-card elements that contain (anywhere inside them) an element with the class .status-danger (for example, a submit button).
    // .getByRole('textbox', {name: 'Password'}) then finds the Password textbox inside that same nb-card.
    // You’re not selecting the .status-danger element itself, but rather the nb-card that contains it. Once you have the correct nb-card, you can find any child element inside it, such as the Password textbox.
    await page.locator('nb-card').filter({has: page.locator('.status-danger')}).getByRole('textbox', {name: 'Password'}).click()

    // Found all nb cards, found nb card with checkbox, then found button with sign in. Since these 2 situations only happen in 1 nb-card, we can select that specific email textbox
    await page.locator('nb-card').filter({has: page.locator('nb-checkbox')}).filter({hasText: "Sign in"}).getByRole('textbox', {name: 'Email'}).click()
    // .locator('..') goes one level up to parent location
    await page.locator(':text-is("Using the Grid")').locator('..').getByRole('textbox', {name: 'Email'}).click()
})

test('Reusing the locators', async ({page}) => {
    // Instead of filling in the same code for each test, you can create a reusable locator
    const basicForm = page.locator('nb-card').filter({hasText: 'Basic Form'})
    const emailField = basicForm.getByRole('textbox', {name: 'Email'})
    
    await emailField.fill('test@test.com')
    await basicForm.getByRole('textbox', {name: 'Password'}).fill('Hello123')
    await basicForm.locator('nb-checkbox').click()
    await basicForm.getByRole('button').click()

    // Assertion, must import expect from '@playwright/test'
    await expect(emailField).toHaveValue('test@test.com')
})

test('Extracting values', async ({page}) => {
    // Single Text Value, use .textContent() to get the text value of an element
    const basicForm = page.locator('nb-card').filter({hasText: 'Basic Form'})
    const buttonText = await basicForm.getByRole('button').textContent()
    expect(buttonText).toEqual('Submit')

    // All Text Values, use .allTextContents() to get all text values in an array
    const allRadioButtonLabels = await page.locator('nb-radio').allTextContents()
    expect(allRadioButtonLabels).toContain('Option 1')

    // Find value of input field, use .inputValue() to get the value of an input field
    const emailField = basicForm.getByRole('textbox', {name: 'Email'})
    await emailField.fill('test@test.com')
    const emailValue = await emailField.inputValue()
    expect(emailValue).toEqual('test@test.com')

    // We want to check the placeholder value of the email field is 'email'
    const placeholderValue = await emailField.getAttribute('placeholder')
    expect(placeholderValue).toEqual('Email')
})

test('Assertions', async ({page}) => {
    // General Assertions
    const value = 5
    expect(value).toBe(5) // Check if value is equal to 5

    const basicFormButton = page.locator('nb-card').filter({hasText: 'Basic Form'}).locator('button')
    const text = await basicFormButton.textContent()
    expect(text).toBe('Submit') // Check if button text is 'Submit'

    // Locator Assertions, These can interact with the locator directly
    await expect(basicFormButton).toHaveText('Submit') // Check if button has text 'Submit'

    // Soft Assertions, will still execute the next line even if this assertion fails
    await expect.soft(basicFormButton).toHaveText('Submit5') // This will not stop the test if it fails, but will log the failure
    await basicFormButton.click() // This will still execute even if the soft assertion fails
})