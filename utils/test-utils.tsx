import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'

// Add in any providers here if needed:
// import { ThemeProvider } from 'my-ui-lib'
// import { TranslationProvider } from 'my-i18n-lib'

const customRender = (
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { ...options })

export * from '@testing-library/react'
export { customRender as render }
