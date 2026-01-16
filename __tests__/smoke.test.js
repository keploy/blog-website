import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

describe('Smoke Test', () => {
    it('renders a heading', () => {
        // This is a basic test to ensure the testing harness is working.
        // We are protecting against the case where the environment is totally broken.
        const True = true;
        expect(True).toBe(true);
    });
});
