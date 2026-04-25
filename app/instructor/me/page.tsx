'use client'
import { useSession } from "next-auth/react";
import { useQuery, useMutation } from "@apollo/client/react";
import Link from "next/link";
import { GET_INSTRUCTOR_INFO, GET_MY_COURSES } from "../../../lib/graphql/queries";
import { DELETE_COURSE } from "../../../lib/graphql/mutations";

const TOPIC_COLORS: Record<string, string> = {
  "Development":  "bg-blue-500/15 text-blue-300 border-blue-500/25",
  "Design":       "bg-pink-500/15 text-pink-300 border-pink-500/25",
  "AI & ML":      "bg-purple-500/15 text-purple-300 border-purple-500/25",
  "Marketing":    "bg-orange-500/15 text-orange-300 border-orange-500/25",
  "Business":     "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
  "Data Science": "bg-cyan-500/15 text-cyan-300 border-cyan-500/25",
  "Video":        "bg-red-500/15 text-red-300 border-red-500/25",
};

interface Course {
  id: string;
  title: string;
  slug: string;
  topic: string;
  level: string;
  price: number;
  isFree: boolean;
  isPublished: boolean;
  thumbnail?: string;
  rating?: { average: number; count: number };
}

export default function InstructorDashboard() {
  const { data: session } = useSession();
  const userId = (session?.user as { id?: string })?.id;

  const { data: instructorData, loading: l1 } = useQuery(GET_INSTRUCTOR_INFO, {
    variables: { userId },
    skip: !userId,
  });

  const { data: coursesData, loading: l2, refetch } = useQuery(GET_MY_COURSES);

  const instructor = instructorData?.getInstructorByUser;
  const courses: Course[] = coursesData?.getInstructorCourses ?? [];
  const loading = l1 || l2;

  const published = courses.filter((c) => c.isPublished).length;
  const totalStudents = instructor?.totalStudents ?? 0;
  const avgRating = instructor?.rating?.average?.toFixed(1) ?? "—";

  const userImage = session?.user?.avatar;
  const initials = session?.user?.name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "?";

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-6xl mx-auto px-8 py-10">

        <div className="relative bg-[#12121a] border border-white/[0.07] rounded-2xl p-8 mb-8 overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "32px 32px" }}
          />
          <div className="relative flex items-start justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500 flex items-center justify-center text-2xl font-bold shrink-0 overflow-hidden border border-white/10">
                {userImage ? (
                  <img 
                    src={userImage} 
                    alt={session?.user?.name ?? "Profile"} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold tracking-tight">{session?.user?.name}</h1>
                  {instructor?.isApproved ? (
                    <span className="text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 px-2 py-0.5 rounded-full">Approved</span>
                  ) : (
                    <span className="text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/25 px-2 py-0.5 rounded-full">Pending approval</span>
                  )}
                </div>
                <p className="text-white/40 text-sm">{session?.user?.email}</p>
                {instructor?.bio && (
                  <p className="text-white/60 text-sm mt-2 max-w-xl">{instructor.bio}</p>
                )}
                {instructor?.expertise?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {instructor.expertise.map((e: string) => (
                      <span key={e} className="text-[12px] bg-white/5 border border-white/10 text-white/50 px-2.5 py-0.5 rounded-full">{e}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <Link
              href="/addcourse"
              className="shrink-0 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              New course
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total courses", value: courses.length, icon: <BookIcon />, color: "indigo" },
            { label: "Published",     value: published,       icon: <CheckIcon />, color: "emerald" },
            { label: "Total students",value: totalStudents,   icon: <UsersIcon />, color: "blue" },
            { label: "Avg rating",    value: avgRating,       icon: <StarIcon />,  color: "amber" },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="bg-[#12121a] border border-white/[0.07] rounded-2xl p-5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-4 ${
                color === "indigo"  ? "bg-indigo-500/15 text-indigo-400"  :
                color === "emerald" ? "bg-emerald-500/15 text-emerald-400" :
                color === "blue"    ? "bg-blue-500/15 text-blue-400"      :
                                      "bg-amber-500/15 text-amber-400"
              }`}>{icon}</div>
              <p className="text-2xl font-bold tracking-tight">{value}</p>
              <p className="text-white/40 text-[13px] mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold tracking-tight">My courses</h2>
            <span className="text-white/35 text-sm">{courses.length} total</span>
          </div>
          {courses.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="flex flex-col gap-3">
              {courses.map((course) => (
                <CourseRow key={course.id} course={course} onDeleted={refetch} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function CourseRow({ course, onDeleted }: { course: Course, onDeleted: () => void }) {
  const [deleteCourse] = useMutation(DELETE_COURSE);
  const topicColor = TOPIC_COLORS[course.topic] ?? "bg-white/5 text-white/50 border-white/10";

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      try {
        await deleteCourse({ variables: { id: course.id } });
        onDeleted();
      } catch (err) {
        alert("Failed to delete course");
      }
    }
  };

  return (
    <div className="group flex items-center gap-4 bg-[#12121a] hover:bg-[#16161f] border border-white/[0.07] rounded-2xl p-4 transition-colors">
      <div className="w-24 h-14 rounded-xl overflow-hidden shrink-0 bg-[#1e1e2e] flex items-center justify-center">
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/20">
            <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
          </svg>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-sm truncate">{course.title}</h3>
          {course.isPublished ? (
            <span className="shrink-0 text-[10px] font-semibold bg-emerald-500/12 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">Live</span>
          ) : (
            <span className="shrink-0 text-[10px] font-semibold bg-white/5 text-white/30 border border-white/10 px-1.5 py-0.5 rounded-full">Draft</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-[11px] font-medium border px-2 py-0.5 rounded-full ${topicColor}`}>{course.topic}</span>
          <span className="text-[12px] text-white/30">{course.level}</span>
          {course.rating && course.rating.count > 0 && (
            <span className="flex items-center gap-1 text-[12px] text-amber-400">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              {course.rating.average.toFixed(1)}
              <span className="text-white/25">({course.rating.count})</span>
            </span>
          )}
        </div>
      </div>

      <div className="shrink-0 text-right mr-2">
        {course.isFree
          ? <span className="text-emerald-400 text-sm font-semibold">Free</span>
          : <span className="text-white text-sm font-semibold">${course.price}</span>
        }
      </div>

      <div className="shrink-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link
          href={`/editCourse/${course.id}`}
          className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-[13px] font-medium px-3 py-1.5 rounded-lg transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Edit
        </Link>
        <button
          onClick={handleDelete}
          className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 text-[13px] font-medium px-3 py-1.5 rounded-lg transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
          Delete
        </button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-[#12121a] border border-dashed border-white/[0.08] rounded-2xl">
      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/30">
          <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
        </svg>
      </div>
      <p className="text-white/50 font-medium mb-1">No courses yet</p>
      <p className="text-white/25 text-sm mb-6">Create your first course to get started</p>
      <Link
        href="/addcourse"
        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Create a course
      </Link>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="max-w-6xl mx-auto px-8 py-10 flex flex-col gap-6 animate-pulse">
        <div className="h-40 bg-[#12121a] rounded-2xl" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-[#12121a] rounded-2xl" />)}
        </div>  
        <div className="flex flex-col gap-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-[#12121a] rounded-2xl" />)}
        </div>
      </div>
    </div>
  );
}

const BookIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>);
const CheckIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>);
const UsersIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>);
const StarIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>);