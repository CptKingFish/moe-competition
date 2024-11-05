import { Banner } from "./_components/banner";
import { Separator } from "@/components/ui/separator";
import { ProjectList } from "./_components/project-list";

export default function DashboardPage() {
  return (
    <div>
      <div className="w-full">
        <Banner />
      </div>
      <Separator className="mb-6 mt-8" />
      <div className="w-full">
        <div className="mb-2 space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight">
            Featured Projects
          </h1>
          <p className="text-muted-foreground">
            Fun and Exciting Projects for you to play with!
          </p>
        </div>
        <ProjectList categoryOptions={frameworks} competitionOptions={frameworks} subjectOptions={frameworks}/>
      </div>
    </div>
  );
}

const frameworks = [
  {
    value: "next.js",
    label: "Next.js",
  },
  {
    value: "sveltekit",
    label: "SvelteKit",
  },
  {
    value: "nuxt.js",
    label: "Nuxt.js",
  },
  {
    value: "remix",
    label: "Remix",
  },
  {
    value: "astro",
    label: "Astro",
  },
];
