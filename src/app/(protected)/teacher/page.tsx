import { redirect } from "next/navigation";

const TeacherPanelPage = async () => {
  redirect("/teacher/submissions");
};

export default TeacherPanelPage;
