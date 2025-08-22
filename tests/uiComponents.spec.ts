import {expect, test} from '@playwright/test'

test.beforeEach(async ({page}) => {
    await page.goto('http://localhost:4200/pages/iot-dashboard')
})

test.describe('Form Layouts Page', () => { 
    test.beforeEach(async ({page}) => {
        await page.getByText('Forms').click()
        await page.getByText('Form Layouts').click()
    })

    test('Input Fields', async ({page}) => {
        const usingTheGridEmailInput = page.locator('nb-card', {hasText: 'Using the Grid'}).getByRole('textbox', {name: 'Email'})
        
        await usingTheGridEmailInput.fill('test@test.com')
        await usingTheGridEmailInput.clear()
        await usingTheGridEmailInput.pressSequentially('test2@test.com', {delay: 500})

        // Generic Assertion
        const InputValue = await usingTheGridEmailInput.inputValue()
        expect(InputValue).toEqual('test2@test.com')

        //Locator Assertion
        await expect(usingTheGridEmailInput).toHaveValue('test2@test.com')
    })

    test('Radio Buttons', async ({page}) => { 
        const usingTheGridForm = page.locator('nb-card', {hasText: 'Using the Grid'})
        // Need to use force true since the radio button is not visible
        //await usingTheGridEmailInput.getByLabel('Option 1').check({force: true})
        await usingTheGridForm.getByRole('radio', {name: 'Option 1'}).check({force: true})
        // Assertion 1
        const radioStatus = await usingTheGridForm.getByRole('radio', {name: 'Option 1'}).isChecked()
        expect(radioStatus).toBeTruthy()
        // Assertion 2
        await expect(usingTheGridForm.getByRole('radio', {name: 'Option 1'})).toBeChecked()

        // Check that option 1 is unchecked and option is checked
        await usingTheGridForm.getByRole('radio', {name: 'Option 2'}).check({force: true})
        expect(await usingTheGridForm.getByRole('radio', {name: 'Option 1'}).isChecked()).toBeFalsy()
        expect(await usingTheGridForm.getByRole('radio', {name: 'Option 2'}).isChecked()).toBeTruthy()
    })
})

test('checkboxes', async({page}) => { 
    await page.getByText('Modal & Overlays').click()
    await page.getByText('Toastr').click()
    // force true since it is hidden, Check will only check and not uncheck
    await page.getByRole('checkbox', {name: "Hide on click"}).uncheck({force: true})
    await page.getByRole('checkbox', {name: "Prevent arising of duplicate toast"}).check({force: true})

    // Create varaible that can contain all checkboxes in the page
    const allBoxes = page.getByRole('checkbox')
    // We need to add .all() to make the checkboxes to return as an array. since .all is a promise we need to add await
    for(const box of await allBoxes.all()) {
        await box.check({force: true})
        expect(await box.isChecked()).toBeTruthy()
    }
})

test('lists and dropdown', async({page}) => {
    const dropDownMenu = page.locator('ngx-header nb-select')
    await dropDownMenu.click()

    page.getByRole('list') // When the list had a UL tag
    page.getByRole('listitem') // When the list had LI tag

    // These two do the same thing
    // const optionList = page.getByRole('list').locator('nb-option')
    const optionList = page.locator('nb-option-list nb-option')
    await expect(optionList).toHaveText(["Light", "Dark", "Cosmic", "Corporate"])
    await optionList.filter({hasText: "Cosmic"}).click()
    const header = page.locator('nb-layout-header')
    await expect(header).toHaveCSS('background-color', 'rgb(50, 50, 89)')

    const colors = {
        "Light": "rgb(255, 255, 255)",
        "Dark": "rgb(34, 43, 69)",
        "Cosmic": "rgb(50, 50, 89)",
        "Corporate": "rgb(255, 255, 255)"
    }

    await dropDownMenu.click()
    for(const color in colors) {
        await optionList.filter({hasText: color}).click()
        await expect(header).toHaveCSS('background-color', colors[color])
        if(color != "Corporate")
            await dropDownMenu.click()
    }
})

test('tooltips', async({page}) => {
    await page.getByText('Modal & Overlays').click()
    await page.getByText('Tooltip').click()

    const toolTipCard = page.locator('nb-card', {hasText: "Tooltip Placements"})
    await toolTipCard.getByRole('button', {name: "Top"}).hover()

    // How normally it's done
    page.getByRole('tooltip') // Only works if you have a role tooltip created
    const tooltip = await page.locator('nb-tooltip').textContent()
    expect(tooltip).toEqual('This is a tooltip')
})

test('dialog box', async({page}) => {
    await page.getByText('Tables & Data').click()
    await page.getByText('Smart Table').click()

    // We use this so that playwright is able to click 'yes/ok' on the pop up browser dialog box
    // This is put before the click since its like an instruction for playwright on what it should do
    // when the dialog pops up
    page.on('dialog', dialog => {
        expect(dialog.message()).toEqual('Are you sure you want to delete?')
        dialog.accept()
    })

    await page.getByRole('table').locator('tr', {hasText: "mdo@gmail.com"}).locator('.nb-trash').click()
    // Assertion to check that "first" row got deleted. We use .nth(2) since it is actually the 3rd row in the table
    await expect(page.locator('table tr').nth(2)).not.toHaveText('mdo@gmail.com')
})

test('web tables', async({page}) => { 
    await page.getByText('Tables & Data').click()
    await page.getByText('Smart Table').click()

    // 1. How to get the row by any text in that row
    const targetRow = page.getByRole('row', {name: "twitter@outlook.com"})
    await targetRow.locator('.nb-edit').click()
    // Locator above wont work when table row is in 'edit' mode
    await page.locator('input-editor').getByPlaceholder('Age').clear()
    await page.locator('input-editor').getByPlaceholder('Age').fill('35')
    // Click Checkmark to confirm change
    await page.locator('.nb-checkmark').click()

    // 2. Get the row based on the value in that specific column
    await page.locator('.ng2-smart-pagination-nav').getByText('2').click()
    // There's 2 11 in the page 2 table, so find the row with an 11 but filter with locator of 
    // td (column) of nth(1), so 2nd column with value of 11
    const targetRowById = page.getByRole('row', {name: '11'}).filter({has: page.locator('td').nth(1).getByText('11')})
    await targetRowById.locator('.nb-edit').click()
    await page.locator('input-editor').getByPlaceholder('E-mail').clear()
    await page.locator('input-editor').getByPlaceholder('E-mail').fill('test@test.com')
    await page.locator('.nb-checkmark').click()
    await expect(targetRowById.locator('td').nth(5)).toHaveText('test@test.com')

    // 3. Test the filter that can be used in the table
    const ages = ["20", "30", "40", "200"]

    for( let age of ages) {
        await page.locator('input-filter').getByPlaceholder('Age').clear()
        await page.locator('input-filter').getByPlaceholder('Age').fill(age)
        // Playwright is faster than the website so we put half a second delay to let the site load up
        await page.waitForTimeout(500)
        // Locator to get all rows in the table
        const ageRows = page.locator('tbody tr')

        // Loop to use assertion to make sure we get expected values
        for( let row of await ageRows.all()) {
            const cellValue = await row.locator('td').last().textContent()
            if(age == "200") {
                expect(await page.getByRole('table').textContent()).toContain('No data found')
            } else {
                expect(cellValue).toEqual(age)
            }
        }
    }
})

test('datepicker', async({page}) => { 
    await page.getByText('Forms').click()
    await page.getByText('Datepicker').click()

    const calendarInputField = page.getByPlaceholder('Form Picker')
    await calendarInputField.click()

    // [class="day-cell ng-star-inserted"] is used here since it uses an attribute seletor to match
    // elements whose classs atribute exactly equal day-cell ng-star-inteserted
    // .day-cell ng-star-inserted is a class selector that matches elements that have both
    // day-cell and ng-star-inserted, regardless of the order of presence of additional classes

    // Additionally .getByText does partial match so it will find every number with a 1 in it,
    // so we add 'exact'
    await page.locator('[class="day-cell ng-star-inserted"]').getByText('1', {exact: true}).click()
    await expect(calendarInputField).toHaveValue('Aug 1, 2025')
})

test('datepicker2', async({page}) => { 
    await page.getByText('Forms').click()
    await page.getByText('Datepicker').click()

    const calendarInputField = page.getByPlaceholder('Form Picker')
    await calendarInputField.click()

    // JS Object that can perform operations with date and time 
    let date = new Date()
    // date.getDate() with no paramenter returns current date, the +1 for next day
    // Current date 8/21/2025
    date.setDate(date.getDate() + 14)
    const expectedDate = date.getDate().toString()
    const expectedMonthShort = date.toLocaleString('En-US', {month: 'short'})
    const expectedMonthLong = date.toLocaleString('En-US', {month: 'long'})
    const expectedYear = date.getFullYear()
    const dateToAssert = `${expectedMonthShort} ${expectedDate}, ${expectedYear}`

    let calendarMonthAndYear = await page.locator('nb-calendar-view-mode').textContent()
    const expectedMonthAndYear = ` ${expectedMonthLong} ${expectedYear}`
    // While website's calendarMonthAndYear does not include expectedMonthAndYear Loop
    while(!calendarMonthAndYear?.includes(expectedMonthAndYear)) {
        await page.locator('nb-calendar-pageable-navigation [data-name="chevron-right"]').click()
        calendarMonthAndYear = await page.locator('nb-calendar-view-mode').textContent()
    }


    await page.locator('[class="day-cell ng-star-inserted"]').getByText(expectedDate, {exact: true}).click()
    await expect(calendarInputField).toHaveValue(dateToAssert)
})

test('sliders', async({page}) => { 
    // Update Attribute
    // const temperatureGauge = page.locator('[tabtitle="Temperature"] ngx-temperature-dragger circle')
    // await temperatureGauge.evaluate( node => {
    //     node.setAttribute('cx', '231.703')
    //     node.setAttribute('cy', '231.703')
    // })
    // // Need to do the click on the slider, if not the 'blue bar' wont follow it
    // await temperatureGauge.click()

    // Mouse Movement
    const temperatureBox = page.locator('[tabtitle="Temperature"] ngx-temperature-dragger')
    await temperatureBox.scrollIntoViewIfNeeded()

    const box = await temperatureBox.boundingBox()
    // We want to start from the middle so we start from x = 0, y = 0 (top left corner)
    const x = box.x + box.width / 2
    const y = box.y + box.height / 2
    // Placing mouse cursor on coordinates
    await page.mouse.move(x,y)
    // Simulate left button press
    await page.mouse.down()
    await page.mouse.move(x + 100, y)
    await page.mouse.move(x + 100, y + 100)
    await page.mouse.up()
})