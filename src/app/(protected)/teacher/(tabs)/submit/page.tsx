import { api } from "@/trpc/server";
import SubmitForm from "./components/submit-form";

const SubmissionsTab = async () => {
  const projectCategories = await api.projects.getProjectCategories();
  const competitions = await api.projects.getCompetitions();
  return (
    <SubmitForm
      projectCategories={projectCategories}
      competitions={competitions}
    />
  );
};

export default SubmissionsTab;
