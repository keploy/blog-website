import { render, screen } from '../utils/test-utils'
import PostCard from '../components/post-card'
import '@testing-library/jest-dom'

// Mock useInView from react-spring
jest.mock('@react-spring/web', () => ({
    animated: {
        div: ({ children, className }: any) => <div className={className}>{children}</div>
    },
    easings: {
        easeInCubic: jest.fn()
    },
    useInView: () => [
        { ref: { current: null } },
        { opacity: 1 }
    ]
}))

describe('PostCard Component (Dynamic Tests)', () => {
    // Define our test cases data
    const testCases = [
        {
            description: 'Technology Post with Author',
            props: {
                title: 'Tech Post',
                coverImage: { node: { sourceUrl: '/img.jpg' } },
                date: '2023-01-01',
                excerpt: 'Reading about tech',
                author: 'Jane Doe',
                slug: 'tech-post',
                isCommunity: false
            },
            expectedUrl: '/technology/tech-post',
            expectedAuthor: 'Jane Doe'
        },
        {
            description: 'Community Post without Author',
            props: {
                title: 'Community Story',
                coverImage: { node: { sourceUrl: '/img2.jpg' } },
                date: '2023-02-01',
                excerpt: 'Community gathering',
                author: null as any, // Cast to any to bypass strict type checks if needed, or null if allowed
                slug: 'community-story',
                isCommunity: true
            },
            expectedUrl: '/community/community-story',
            expectedAuthor: 'Anonymous'
        }
    ];

    // Run tests dynamically
    test.each(testCases)(
        'renders $description correctly',
        ({ props, expectedUrl, expectedAuthor }) => {
            render(<PostCard {...props} />)

            // Check Title
            // Use regex for flexible matching if needed, or check if it matches exactly
            expect(screen.getByText(new RegExp(props.title, 'i'))).toBeInTheDocument()

            // Check Author (or fallback)
            expect(screen.getByText(new RegExp(expectedAuthor, 'i'))).toBeInTheDocument()

            // Check Link URL construction
            // We expect 2 links: one for image, one for title. Both point to the same URL.
            const links = screen.getAllByRole('link')
            expect(links.length).toBeGreaterThan(0)
            expect(links[0]).toHaveAttribute('href', expectedUrl)
        }
    )
})
