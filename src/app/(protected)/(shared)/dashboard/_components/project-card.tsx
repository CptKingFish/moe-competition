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

interface ProjectCardProps {
  title: string;
  author: string;
  authorAvatar: string;
  projectUrl: string;
  votes: number;
  category: string;
  competition: string;
  subjectLevel: SubjectLevel;
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
  title,
  author,
  authorAvatar,
  votes,
  category,
  competition,
  subjectLevel,
}: ProjectCardProps) {
  return (
    <Card className="w-full grow overflow-hidden border-2 transition-all duration-300 hover:-translate-y-1 hover:cursor-pointer hover:border-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] md:w-[12rem] lg:w-[17rem] xl:w-[22rem]">
      <CardHeader className="p-0">
        <img
          src={"Icon.svg"}
          alt={title}
          className="h-28 w-full object-cover md:h-32 lg:h-44"
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
          <Tag color="bg-purple-100 text-purple-800">{category}</Tag>
          <Tag color="bg-green-100 text-green-800">{competition}</Tag>
          <Tag color={`bg-blue-100 text-blue-800`}>
            {subjectLevel.toUpperCase()}
          </Tag>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end p-4 pt-0">
        <div className="flex items-center space-x-1 text-muted-foreground">
          <Star className="h-4 w-4 fill-current" />
          <span className="text-sm">{votes}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
