const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4000;

function loadFixture(name) {
    const filePath = path.join(__dirname, 'fixtures', name);
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

const technologyPosts = loadFixture('technology-posts.json');
const singlePost = loadFixture('single-post.json');
const searchSuccess = loadFixture('search-success-response.json');
const emptySearch = loadFixture('empty-search-response.json');
const errorResponse = loadFixture('error-response.json');

const tagsResponse = {
    data: {
        tags: {
            edges: [
                { node: { name: 'testing' } },
                { node: { name: 'api' } },
                { node: { name: 'golang' } },
                { node: { name: 'javascript' } },
                { node: { name: 'devops' } },
                { node: { name: 'ci-cd' } },
                { node: { name: 'docker' } },
                { node: { name: 'kubernetes' } }
            ],
            pageInfo: {
                hasNextPage: false,
                endCursor: null
            }
        }
    }
};

const allAuthorsResponse = {
    data: {
        posts: {
            edges: [
                {
                    node: {
                        ppmaAuthorName: 'Tech Author One',
                        ppmaAuthorImage: '/blog/favicon/Group.png',
                        author: {
                            node: {
                                name: 'Tech Author One',
                                firstName: 'Tech',
                                lastName: 'Author One',
                                avatar: { url: '/blog/favicon/Group.png' }
                            }
                        }
                    }
                },
                {
                    node: {
                        ppmaAuthorName: 'Tech Author Two',
                        ppmaAuthorImage: '/blog/favicon/Group.png',
                        author: {
                            node: {
                                name: 'Tech Author Two',
                                firstName: 'Tech',
                                lastName: 'Author Two',
                                avatar: { url: '/blog/favicon/Group.png' }
                            }
                        }
                    }
                },
                {
                    node: {
                        ppmaAuthorName: 'DevOps Contributor',
                        ppmaAuthorImage: '/blog/favicon/Group.png',
                        author: {
                            node: {
                                name: 'DevOps Contributor',
                                firstName: 'DevOps',
                                lastName: 'Contributor',
                                avatar: { url: '/blog/favicon/Group.png' }
                            }
                        }
                    }
                }
            ],
            pageInfo: {
                hasNextPage: false,
                endCursor: null
            }
        }
    }
};

const authorPostsResponse = {
    data: {
        posts: {
            edges: [
                {
                    node: {
                        title: 'Understanding API Testing with Keploy',
                        excerpt: '<p>Learn how Keploy simplifies API testing.</p>',
                        slug: 'understanding-api-testing-with-keploy',
                        date: '2024-06-15T10:00:00',
                        postId: 2001,
                        featuredImage: { node: { sourceUrl: '/blog/favicon/Group.png' } },
                        author: {
                            node: {
                                name: 'Tech Author One',
                                firstName: 'Tech',
                                lastName: 'Author One',
                                avatar: { url: '/blog/favicon/Group.png' }
                            }
                        },
                        ppmaAuthorName: 'Tech Author One',
                        categories: { edges: [{ node: { name: 'technology' } }] },
                        seo: {
                            metaDesc: 'Learn how Keploy simplifies API testing.',
                            title: 'Understanding API Testing with Keploy'
                        }
                    }
                }
            ]
        }
    }
};

const postContentResponse = {
    data: {
        postBy: {
            content: '<h2>Introduction</h2><p>API testing is a critical part of software development.</p>'
        }
    }
};

const tagPostsResponse = {
    data: {
        posts: {
            edges: [
                {
                    node: {
                        title: 'Understanding API Testing with Keploy',
                        excerpt: '<p>Learn how Keploy simplifies API testing.</p>',
                        slug: 'understanding-api-testing-with-keploy',
                        date: '2024-06-15T10:00:00',
                        featuredImage: { node: { sourceUrl: '/blog/favicon/Group.png' } },
                        author: { node: { name: 'Tech Author One' } },
                        ppmaAuthorName: 'Tech Author One',
                        categories: { edges: [{ node: { name: 'technology' } }] }
                    }
                }
            ]
        }
    }
};

const reviewAuthorResponse = {
    data: {
        users: {
            edges: [{
                node: {
                    name: 'Mock Reviewer',
                    email: 'reviewer@mock.test',
                    avatar: { url: '/blog/favicon/Group.png' },
                    description: 'A mock reviewer for testing.'
                }
            }]
        }
    }
};

function handleGraphQL(body) {
    const query = body.query || '';
    const variables = body.variables || {};

    if (query.includes('AllTags')) {
        return tagsResponse;
    }

    if (query.includes('tag: $tagName') || (query.includes('AllPosts') && variables.tagName)) {
        return tagPostsResponse;
    }

    if (query.includes('getAllAuthors')) {
        return allAuthorsResponse;
    }

    if (query.includes('PostsByAuthorName')) {
        return authorPostsResponse;
    }

    if (query.includes('getContent') || query.includes('postBy')) {
        return postContentResponse;
    }

    if (query.includes('AuthorDetailsByName')) {
        return reviewAuthorResponse;
    }

    if (query.includes('AllPostsForCategory') || query.includes('categoryName: "technology"')) {
        return technologyPosts;
    }

    if (query.includes('CommunityPosts') || query.includes('categoryName: "community"')) {
        return technologyPosts;
    }

    if (query.includes('PostBySlug')) {
        return singlePost;
    }

    if (query.includes('AllPostsForSearch')) {
        return searchSuccess;
    }

    if (query.includes('MorePosts')) {
        return technologyPosts;
    }

    if (query.includes('query Posts')) {
        return technologyPosts;
    }

    if (query.includes('PostsWithTags') || query.includes('PostsWithoutTags')) {
        return technologyPosts;
    }

    if (query.includes('PreviewPost')) {
        return { data: { post: { databaseId: 1, slug: 'mock-post', status: 'publish' } } };
    }

    if (query.includes('AllPosts')) {
        return technologyPosts;
    }

    console.log('[MockServer] Unmatched query:', query.substring(0, 100));
    return { data: { posts: { edges: [], pageInfo: { hasNextPage: false, endCursor: null } } } };
}

const server = http.createServer((req, res) => {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok' }));
        return;
    }

    if (req.method === 'POST' && req.url === '/graphql') {
        let rawBody = '';
        req.on('data', chunk => { rawBody += chunk; });
        req.on('end', () => {
            try {
                const body = JSON.parse(rawBody);
                const response = handleGraphQL(body);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(response));
            } catch (err) {
                console.error('Mock server error:', err.message);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(errorResponse));
            }
        });
        return;
    }

    res.writeHead(404);
    res.end('Not found');
});

server.listen(PORT, () => {
    console.log(`Mock GraphQL server running at http://localhost:${PORT}/graphql`);
});
