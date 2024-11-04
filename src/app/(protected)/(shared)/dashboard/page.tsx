import { Banner } from "./_components/banner";

export default function DashboardPage() {
  return (
    <>
      <div className="flex justify-center">
        <div className="hidden xl:block">
          <Banner />
        </div>
      </div>
    </>
  );
}
