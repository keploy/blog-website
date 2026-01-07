import Container from "./container";
import Header from "./header";
import Layout from "./layout";
import { HeroPostSkeleton, MoreStoriesSkeleton } from "./skeletons";

export default function PageLoadingSkeleton() {
  return (
    <Layout
      preview={false}
      featuredImage=""
      Title="Loading..."
      Description="Loading blog posts..."
    >
      <Header />
      <Container>
        <HeroPostSkeleton />
        <section>
          <h2 className="bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:100%_20px] bg-no-repeat bg-left-bottom w-max mb-8 text-4xl heading1 md:text-4xl font-bold tracking-tighter leading-tight">
            More Stories
          </h2>
          <MoreStoriesSkeleton count={6} />
        </section>
      </Container>
    </Layout>
  );
}
