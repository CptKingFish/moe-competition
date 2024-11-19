import { redirect } from "next/navigation";

const AdminPanelPage = async () => {
  redirect("/admin/users");
};

export default AdminPanelPage;
