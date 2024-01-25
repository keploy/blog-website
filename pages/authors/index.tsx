import { GetStaticProps } from "next";
import { getAllAuthors } from "../../lib/api";
import Layout from "../../components/layout";
import Header from "../../components/header";
import Container from "../../components/container";
import AuthorMapping from "../../components/AuthorMapping";

export default function authors({AllAuthors:{edges},preview}){
    const authorNameArray = Array.from(new Set(edges.map(item =>item.node.ppmaAuthorName)));
    // console.log(authorNameArray);
    return(
        <Layout preview={preview}>
        <Header/>
        <Container>
            <h1 className="text-3xl font-bold mb-4">Authors Page</h1>
            <AuthorMapping AuthorArray={authorNameArray}/>
        </Container>
        </Layout>
    );
}

export const getStaticProps:GetStaticProps = async({preview=false}) =>{
    const AllAuthors = await getAllAuthors();
    return{
        props:{AllAuthors,preview},
        revalidate:10,
    };
};
