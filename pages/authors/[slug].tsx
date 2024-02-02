import { useRouter } from "next/router"
import Layout from "../../components/layout";
import Header from "../../components/header";
import Container from "../../components/container";
import { getAllAuthors, getPostsByAuthor } from "../../lib/api";
import { GetStaticPaths, GetStaticProps } from "next";
import { isStringLiteral } from "typescript";
import PostByAuthorMapping from "../../components/postByAuthorMapping";
export default function authorPage({preview,filteredPosts}){
    const router = useRouter();
    const {slug} = router.query;
    return(
        <div className="authormapping">
        <Layout preview={preview} >
        <Header/>
        <Container>
        <h1 className="text-6xl font-bold mb-4 text-slate-200">Author Details</h1>
        <PostByAuthorMapping 
        filteredPosts = {filteredPosts}
        />
        </Container>
        </Layout>
        </div>
    )

}
export const getStaticPaths:GetStaticPaths = async({})=>{
    const AllAuthors = await getAllAuthors();
    return {
        paths: AllAuthors.edges.map(({node}) => `/authors/${node.ppmaAuthorName}`) || [],
        fallback:true
    }
}


export const getStaticProps:GetStaticProps = async({
    preview=false,
    params
})=>{
    const { slug } = params;
    const postsByAuthor = await getPostsByAuthor();
    const filteredPosts = postsByAuthor.edges.filter((item) => item.node.ppmaAuthorName === slug);
    return{
        props:{preview,filteredPosts},
        revalidate:10,
    }
}  