import CourseGrid from "./components/CourseGrid";
import FilterBar from "./components/FilterBar";
import Header from "./components/Header";
import Foooter from "./components/Foooter";

export default function CoursesPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0F]">
      <Header />
      <FilterBar />
      <CourseGrid />
      <Foooter />
    </main>
  );
}