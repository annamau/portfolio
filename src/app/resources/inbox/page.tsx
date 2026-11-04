import type { Metadata } from "next";
import { resourceCollections } from "@/data/resources";
import ResourceInbox from "@/components/resources/ResourceInbox";
export const metadata:Metadata={title:"Private resource inbox",robots:{index:false,follow:false},alternates:{canonical:"/resources/inbox"}};
export default async function InboxPage({searchParams}:{searchParams:Promise<{add?:string;url?:string;folder?:string}>}){
  const query=await searchParams;
  const category=resourceCollections.find(({id})=>id===query.folder)?.id||"ideas";
  return <ResourceInbox key={`${query.add||""}:${query.url||""}`} initialAdd={query.add==="1"} initialUrl={query.url?.slice(0,2048)} initialCategory={category}/>;
}
