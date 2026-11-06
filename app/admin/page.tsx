import {getChatGPTUser,chatGPTSignInPath} from '../chatgpt-auth';
import {isAdmin,readProjects} from '../server';
import Studio from './studio';
export const dynamic='force-dynamic';
export const metadata={title:'Studio — Syead Afridii',robots:{index:false,follow:false}};
export default async function Admin(){
 const user=await getChatGPTUser();
 if(!user)return <main className="studio-login"><a className="wordmark" href="/">syead<span>®</span></a><h1>Behind the scenes.</h1><p>Your space to curate projects, upload artwork and manage new enquiries.</p><a className="button lime" href={chatGPTSignInPath('/admin')} target="_top">Sign in to your studio ↗</a><a href="/">← Back to portfolio</a></main>;
 if(!await isAdmin())return <main className="studio-login"><h1>Private studio.</h1><p>This area is reserved for the portfolio owner. Sign in using the account that owns this website.</p><a className="button outline" href="/">Back to portfolio</a></main>;
 const projects=await readProjects(true);
 return <Studio initialProjects={projects}/>;
}