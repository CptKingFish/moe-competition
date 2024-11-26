import * as React from "react";

import SelectSchoolForm from "./components/select-school-form";
import { api } from "@/trpc/server";

const SelectSchoolPage = async () => {
  const schools = await api.school.getAllSchoolNames();
  return <SelectSchoolForm schools={schools} />;
};

export default SelectSchoolPage;
