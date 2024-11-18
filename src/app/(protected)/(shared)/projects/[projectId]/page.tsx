interface pageProps {
  params: {
    projectId: string;
  };
}

const page = ({ params }: pageProps) => {
  return <div>{params.projectId}</div>;
};

export default page;
