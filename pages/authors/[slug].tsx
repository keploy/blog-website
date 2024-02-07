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
        <div className="bg-accent-1">
        <Layout preview={preview} >
        <Header/>
        <Container>
        <h1 className="text-6xl font-bold mb-4 text-slate-900  bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:0px_10px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 hover:bg-[length:100%_10px] group-hover:bg-[length:100%_10px]">Author Details</h1>
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