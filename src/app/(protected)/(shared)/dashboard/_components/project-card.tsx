import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { type SubjectLevel } from "@/db/enums";
import { useRouter } from "next/navigation";

interface ProjectCardProps {
  id: string;
  title: string;
  author: string;
  authorAvatar: string;
  projectUrl: string;
  votes: string | number | bigint;
  category: string;
  competition: string;
  subjectLevel: SubjectLevel;
  bannerImg: string;
}

const Tag = ({
  children,
  color,
}: {
  children: React.ReactNode;
  color: string;
}) => (
  <span className={`mr-2 rounded px-2.5 py-0.5 text-xs font-semibold ${color}`}>
    {children}
  </span>
);

export default function ProjectCard({
  id,
  title,
  author,
  authorAvatar,
  votes,
  category,
  competition,
  subjectLevel,
  bannerImg,
}: ProjectCardProps) {
  const router = useRouter();

  return (
    <Card
      className="min-w-0 overflow-hidden border-2 transition-all duration-300 hover:-translate-y-1 hover:cursor-pointer hover:shadow-lg"
      onClick={() => router.push(`/projects/${id}`)}
    >
      <CardHeader className="p-0">
        <img
          src={bannerImg}
          alt={title}
          className="h-28 w-full object-cover md:h-32"
        />
      </CardHeader>
      <CardContent className="p-3">
        <CardTitle className="mb-2 text-lg">{title}</CardTitle>
        <div className="mb-2 flex items-center space-x-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={authorAvatar} alt={author} />
            <AvatarFallback>{author[0]}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">{author}</span>
        </div>
        <div className="mb-2">
          <Tag color="bg-cyan-100 text-cyan-800">{category}</Tag>
          <Tag color="bg-green-100 text-green-800">{competition}</Tag>
          <Tag color={`bg-orange-100 text-orange-800`}>
            {subjectLevel.toUpperCase()}
          </Tag>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end p-4 pt-0">
        <div className="flex items-center space-x-1 text-muted-foreground">
          <span className="text-sm">{votes} Votes</span>
        </div>
      </CardFooter>
    </Card>
  );
}
