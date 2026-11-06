import Portfolio from './portfolio';
import {readProjects} from './server';
import {defaultProjects} from './data';
export const dynamic='force-dynamic';
export default async function Home(){let projects=defaultProjects;try{projects=await readProjects();}catch{}return <Portfolio initialProjects={projects}/>;}