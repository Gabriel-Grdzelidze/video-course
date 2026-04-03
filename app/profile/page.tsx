'use client'
import { useState, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useQuery, useMutation } from '@apollo/client/react'
import { gql } from '@apollo/client'
import {
  UPDATE_COURSE, PUBLISH_COURSE, UNPUBLISH_COURSE, DELETE_COURSE,
  CREATE_SECTION, DELETE_SECTION,
  CREATE_LESSON, DELETE_LESSON,
  UPDATE_LESSON,
} from '../../lib/graphql/mutations'

// ── queries ───────────────────────────────────────────────────────────────────
const GET_PROFILE = gql`
  query GetProfile($userId: ID!) {
    getUser(id: $userId) { id name email image }
    getInstructorByUser(userId: $userId) {
      id bio website expertise isApproved
      rating { average count }
      totalStudents
    }
    getEnrollmentsByUser(userId: $userId) {
      id paidAmount createdAt
      course { id title slug thumbnail topic level rating { average } }
    }
  }
`

const GET_INSTRUCTOR_COURSES = gql`
  query GetInstructorCourses {
    getCourses {
      id title slug description thumbnail topic level
      price isFree isPublished tags
      rating { average count }
      sections { id title order lessons { id title videoUrl duration order isFree isQuiz } }
    }
  }
`

// ── constants ─────────────────────────────────────────────────────────────────
const TOPICS = ['Development','Design','AI & ML','Marketing','Business','Data Science','Video']
const LEVELS = ['Beginner','Intermediate','Advanced']

const TOPIC_COLORS: Record<string,string> = {
  Development:  'bg-blue-500/15 text-blue-300 border-blue-500/25',
  Design:       'bg-pink-500/15 text-pink-300 border-pink-500/25',
  'AI & ML':    'bg-purple-500/15 text-purple-300 border-purple-500/25',
  Marketing:    'bg-orange-500/15 text-orange-300 border-orange-500/25',
  Business:     'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  'Data Science':'bg-cyan-500/15 text-cyan-300 border-cyan-500/25',
  Video:        'bg-red-500/15 text-red-300 border-red-500/25',
}

// ── types ─────────────────────────────────────────────────────────────────────
interface Lesson { id:string; title:string; videoUrl?:string; duration?:number; order:number; isFree:boolean; isQuiz:boolean }
interface Section { id:string; title:string; order:number; lessons:Lesson[] }
interface Course {
  id:string; title:string; slug:string; description:string; thumbnail?:string
  topic:string; level:string; price:number; isFree:boolean; isPublished:boolean; tags:string[]
  rating?:{average:number;count:number}
  sections?: Section[]
}

// ══ MAIN PAGE ════════════════════════════════════════════════════════════════
export default function ProfilePage() {
  const { data: session } = useSession()
  const userId = (session?.user as { id?: string })?.id
  const isInstructor = (session?.user as { role?: string })?.role === 'instructor'

  const { data, loading, refetch } = useQuery(GET_PROFILE, {
    variables: { userId },
    skip: !userId,
  })

  const [activeTab, setActiveTab] = useState<'courses'|'settings'>(isInstructor ? 'courses' : 'settings')
  const [drawerCourse, setDrawerCourse] = useState<Course | null>(null)

  const user = data?.getUser
  const instructor = data?.getInstructorByUser
  const enrollments = data?.getEnrollmentsByUser ?? []

  const initials = session?.user?.name
    ?.split(' ').map((n:string) => n[0]).join('').slice(0,2).toUpperCase() ?? '?'

  if (loading) return <ProfileSkeleton />

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-5xl mx-auto px-8 py-10">

        {/* ── profile header ── */}
        <div className="relative bg-[#12121a] border border-white/[0.07] rounded-2xl p-8 mb-8 overflow-hidden">
          <div className="absolute inset-0 opacity-[0.025]"
            style={{backgroundImage:'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',backgroundSize:'32px 32px'}}/>
          <div className="relative flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500 flex items-center justify-center text-2xl font-bold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <h1 className="text-xl font-bold tracking-tight">{session?.user?.name}</h1>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border
                  ${isInstructor
                    ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/25'
                    : 'bg-white/5 text-white/40 border-white/10'}`}>
                  {isInstructor ? 'Instructor' : 'Student'}
                </span>
                {isInstructor && instructor && (
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border
                    ${instructor.isApproved
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/25'}`}>
                    {instructor.isApproved ? 'Approved' : 'Pending'}
                  </span>
                )}
              </div>
              <p className="text-white/40 text-sm">{session?.user?.email}</p>
              {isInstructor && instructor?.bio && (
                <p className="text-white/55 text-sm mt-1.5 max-w-xl">{instructor.bio}</p>
              )}
              {isInstructor && instructor?.expertise?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {instructor.expertise.map((e:string) => (
                    <span key={e} className="text-[11px] bg-white/5 border border-white/8 text-white/45 px-2 py-0.5 rounded-full">{e}</span>
                  ))}
                </div>
              )}
            </div>
            {/* instructor stats */}
            {isInstructor && instructor && (
              <div className="shrink-0 flex items-center gap-6 text-center">
                <div><p className="text-xl font-bold">{instructor.totalStudents ?? 0}</p><p className="text-[12px] text-white/35 mt-0.5">Students</p></div>
                <div className="w-px h-8 bg-white/8"/>
                <div><p className="text-xl font-bold">{instructor.rating?.average?.toFixed(1) ?? '—'}</p><p className="text-[12px] text-white/35 mt-0.5">Rating</p></div>
              </div>
            )}
          </div>
        </div>

        {/* ── tabs ── */}
        <div className="flex border-b border-white/[0.07] mb-8">
          {(isInstructor
            ? [{ id:'courses', label:'My courses' }, { id:'settings', label:'Account' }]
            : [{ id:'settings', label:'Account' }, { id:'courses', label:'My learning' }]
          ).map(({ id, label }) => (
            <button key={id} onClick={() => setActiveTab(id as 'courses'|'settings')}
              className={`px-5 py-3 -mb-px text-sm font-medium border-b-2 transition-colors bg-transparent cursor-pointer
                ${activeTab === id ? 'border-indigo-500 text-white' : 'border-transparent text-white/35 hover:text-white/60'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* ── tab content ── */}
        {activeTab === 'courses' && isInstructor && (
          <InstructorCourses onEdit={(course) => setDrawerCourse(course)} refetchProfile={refetch} />
        )}

        {activeTab === 'courses' && !isInstructor && (
          <StudentCourses enrollments={enrollments} />
        )}

        {activeTab === 'settings' && (
          <AccountSettings user={user} instructor={instructor} isInstructor={isInstructor} />
        )}
      </div>

      {/* ── course editor drawer ── */}
      {drawerCourse && (
        <CourseEditorDrawer
          course={drawerCourse}
          onClose={() => setDrawerCourse(null)}
          onSaved={() => { setDrawerCourse(null) }}
        />
      )}
    </div>
  )
}

// ══ INSTRUCTOR COURSES ═══════════════════════════════════════════════════════
function InstructorCourses({ onEdit, refetchProfile }: { onEdit:(c:Course)=>void; refetchProfile:()=>void }) {
  const { data, loading, refetch } = useQuery(GET_INSTRUCTOR_COURSES)
  const [publishCourse] = useMutation(PUBLISH_COURSE)
  const [unpublishCourse] = useMutation(UNPUBLISH_COURSE)
  const [deleteCourse] = useMutation(DELETE_COURSE)

  const courses: Course[] = data?.getCourses ?? []

  const togglePublish = async (course: Course) => {
    if (course.isPublished) await unpublishCourse({ variables: { id: course.id } })
    else await publishCourse({ variables: { id: course.id } })
    refetch()
    refetchProfile()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this course? This cannot be undone.')) return
    await deleteCourse({ variables: { id } })
    refetch()
  }

  if (loading) return <div className="flex flex-col gap-3">{[...Array(3)].map((_,i)=><div key={i} className="h-24 bg-[#12121a] rounded-2xl animate-pulse"/>)}</div>

  if (!courses.length) return (
    <div className="flex flex-col items-center justify-center py-20 bg-[#12121a] border border-dashed border-white/[0.08] rounded-2xl">
      <p className="text-white/40 font-medium mb-4">No courses yet</p>
      <a href="/instructor/courses/new"
        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors">
        + Create first course
      </a>
    </div>
  )

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-white/35 text-sm">{courses.length} courses</span>
        <a href="/instructor/courses/new"
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[13px] px-4 py-2 rounded-xl transition-colors">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New course
        </a>
      </div>

      {courses.map((course) => {
        const tc = TOPIC_COLORS[course.topic] ?? 'bg-white/5 text-white/40 border-white/10'
        const lessonCount = course.sections?.reduce((s,sec)=>s+sec.lessons.length,0) ?? 0

        return (
          <div key={course.id} className="group flex items-center gap-4 bg-[#12121a] hover:bg-[#15151e] border border-white/[0.07] rounded-2xl p-4 transition-colors">
            {/* thumbnail */}
            <div className="w-28 h-16 rounded-xl overflow-hidden shrink-0 bg-[#1e1e2e] flex items-center justify-center">
              {course.thumbnail
                ? <img src={course.thumbnail} alt="" className="w-full h-full object-cover"/>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/15"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>}
            </div>

            {/* info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <h3 className="font-semibold text-sm truncate">{course.title}</h3>
                <span className={`shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border
                  ${course.isPublished ? 'bg-emerald-500/12 text-emerald-400 border-emerald-500/20' : 'bg-white/5 text-white/30 border-white/8'}`}>
                  {course.isPublished ? 'Live' : 'Draft'}
                </span>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`text-[11px] font-medium border px-2 py-0.5 rounded-full ${tc}`}>{course.topic}</span>
                <span className="text-[12px] text-white/25">{course.level}</span>
                <span className="text-[12px] text-white/25">{lessonCount} lessons</span>
                {course.rating && course.rating.count > 0 && (
                  <span className="flex items-center gap-1 text-[12px] text-amber-400">
                    ★ {course.rating.average.toFixed(1)}
                    <span className="text-white/20">({course.rating.count})</span>
                  </span>
                )}
              </div>
            </div>

            {/* price */}
            <div className="shrink-0 text-right">
              <span className="font-bold text-sm">{course.isFree ? <span className="text-emerald-400">Free</span> : `$${course.price}`}</span>
            </div>

            {/* actions — always visible on mobile, hover on desktop */}
            <div className="shrink-0 flex items-center gap-2">
              {/* publish toggle */}
              <button onClick={() => togglePublish(course)}
                className={`text-[12px] font-semibold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer
                  ${course.isPublished
                    ? 'bg-transparent border-white/10 text-white/35 hover:border-red-500/30 hover:text-red-400'
                    : 'bg-transparent border-white/10 text-white/35 hover:border-emerald-500/30 hover:text-emerald-400'}`}>
                {course.isPublished ? 'Unpublish' : 'Publish'}
              </button>

              {/* edit */}
              <button onClick={() => onEdit(course)}
                className="flex items-center gap-1.5 bg-white/5 hover:bg-indigo-500/15 border border-white/10 hover:border-indigo-500/30 text-white/60 hover:text-indigo-300 text-[13px] font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Edit
              </button>

              {/* delete */}
              <button onClick={() => handleDelete(course.id)}
                className="p-2 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer border-none bg-transparent"
                title="Delete course">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ══ STUDENT COURSES ═══════════════════════════════════════════════════════════
function StudentCourses({ enrollments }: { enrollments: {id:string;course:{id:string;title:string;slug:string;thumbnail?:string;topic:string;level:string;rating?:{average:number}}}[] }) {
  if (!enrollments.length) return (
    <div className="flex flex-col items-center justify-center py-20 bg-[#12121a] border border-dashed border-white/[0.08] rounded-2xl">
      <p className="text-white/40 font-medium mb-2">No courses yet</p>
      <p className="text-white/25 text-sm">Browse courses and start learning</p>
    </div>
  )

  return (
    <div className="grid grid-cols-2 gap-4">
      {enrollments.map(({ id, course }) => {
        const tc = TOPIC_COLORS[course.topic] ?? 'bg-white/5 text-white/40 border-white/10'
        return (
          <a key={id} href={`/courses/${course.slug}`}
            className="group bg-[#12121a] border border-white/[0.07] rounded-2xl overflow-hidden hover:border-white/15 transition-colors">
            <div className="aspect-video bg-[#1e1e2e] overflow-hidden">
              {course.thumbnail
                ? <img src={course.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                : <div className="w-full h-full flex items-center justify-center"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/15"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg></div>}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-sm mb-2 truncate">{course.title}</h3>
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-medium border px-2 py-0.5 rounded-full ${tc}`}>{course.topic}</span>
                <span className="text-[12px] text-white/30">{course.level}</span>
              </div>
            </div>
          </a>
        )
      })}
    </div>
  )
}

// ══ ACCOUNT SETTINGS ══════════════════════════════════════════════════════════
function AccountSettings({ user, instructor, isInstructor }: { user:{id:string;name:string;email:string;image?:string}; instructor:{bio?:string;website?:string;expertise?:string[]}; isInstructor:boolean }) {
  const [name, setName] = useState(user?.name ?? '')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    // wire to updateUser mutation
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-lg flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-semibold text-white/55 tracking-wide">Display name</label>
        <input value={name} onChange={(e) => setName(e.target.value)}
          className="bg-[#1a1a26] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50 transition-colors"/>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-semibold text-white/55 tracking-wide">Email</label>
        <input value={user?.email ?? ''} disabled
          className="bg-[#1a1a26] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/35 outline-none cursor-not-allowed"/>
        <p className="text-[12px] text-white/25">Email cannot be changed</p>
      </div>
      <div className="pt-2">
        <button onClick={handleSave}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-colors cursor-pointer">
          {saved ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Saved!</> : 'Save changes'}
        </button>
      </div>
    </div>
  )
}

// ══ COURSE EDITOR DRAWER ══════════════════════════════════════════════════════
function CourseEditorDrawer({ course, onClose, onSaved }: { course:Course; onClose:()=>void; onSaved:()=>void }) {
  const [tab, setTab] = useState<'details'|'content'>('details')
  const fileRef = useRef<HTMLInputElement>(null)

  // form state
  const [form, setForm] = useState({
    title: course.title,
    description: course.description,
    topic: course.topic,
    level: course.level,
    price: String(course.price),
    thumbnail: course.thumbnail ?? '',
  })
  const [preview, setPreview] = useState<string|null>(course.thumbnail ?? null)
  const [uploading, setUploading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [sections, setSections] = useState<Section[]>(course.sections ?? [])
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [addingLessonTo, setAddingLessonTo] = useState<string|null>(null)
  const [newSectionTitle, setNewSectionTitle] = useState('')
  const [addingSection, setAddingSection] = useState(false)
  const [lessonForm, setLessonForm] = useState({ title:'', videoUrl:'', duration:'', isFree:false })

  const [updateCourse] = useMutation(UPDATE_COURSE)
  const [createSection] = useMutation(CREATE_SECTION)
  const [deleteSection] = useMutation(DELETE_SECTION)
  const [createLesson] = useMutation(CREATE_LESSON)
  const [deleteLesson] = useMutation(DELETE_LESSON)
  const [updateLesson] = useMutation(UPDATE_LESSON)

  // ── thumbnail upload ──────────────────────────────────────────────────────
  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)
    setUploading(true)
    try {
      const data = new FormData(); data.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: data })
      const { url } = await res.json()
      setForm((f) => ({ ...f, thumbnail: url }))
    } catch {
      const r2 = new FileReader()
      r2.onload = (e) => setForm((f) => ({ ...f, thumbnail: e.target?.result as string }))
      r2.readAsDataURL(file)
    } finally { setUploading(false) }
  }, [])

  // ── save details ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    const price = parseFloat(form.price) || 0
    await updateCourse({
      variables: {
        id: course.id,
        title: form.title,
        description: form.description,
        thumbnail: form.thumbnail || null,
        topic: form.topic,
        level: form.level,
        price,
        isFree: price === 0,
      }
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  // ── sections ──────────────────────────────────────────────────────────────
  const handleAddSection = async () => {
    if (!newSectionTitle.trim()) return
    const { data } = await createSection({ variables: { title: newSectionTitle.trim(), order: sections.length, courseId: course.id } })
    setSections((prev) => [...prev, { ...data.createSection, lessons: [] }])
    setNewSectionTitle(''); setAddingSection(false)
  }

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm('Delete this section and all its lessons?')) return
    await deleteSection({ variables: { id: sectionId } })
    setSections((prev) => prev.filter((s) => s.id !== sectionId))
  }

  // ── lessons ───────────────────────────────────────────────────────────────
  const handleAddLesson = async (sectionId: string, order: number) => {
    if (!lessonForm.title.trim()) return
    const { data } = await createLesson({
      variables: {
        title: lessonForm.title.trim(),
        videoUrl: lessonForm.videoUrl || null,
        duration: lessonForm.duration ? parseInt(lessonForm.duration) : null,
        order,
        isFree: lessonForm.isFree,
        isQuiz: false,
        courseId: course.id,
        sectionId,
      }
    })
    setSections((prev) => prev.map((s) =>
      s.id === sectionId ? { ...s, lessons: [...s.lessons, data.createLesson] } : s
    ))
    setLessonForm({ title:'', videoUrl:'', duration:'', isFree:false })
    setAddingLessonTo(null)
  }

  const handleDeleteLesson = async (lessonId: string, sectionId: string) => {
    await deleteLesson({ variables: { id: lessonId } })
    setSections((prev) => prev.map((s) =>
      s.id === sectionId ? { ...s, lessons: s.lessons.filter((l) => l.id !== lessonId) } : s
    ))
  }

  const toggleFree = async (lesson: Lesson, sectionId: string) => {
    await updateLesson({ variables: { id: lesson.id, isFree: !lesson.isFree } })
    setSections((prev) => prev.map((s) =>
      s.id === sectionId ? { ...s, lessons: s.lessons.map((l) => l.id === lesson.id ? { ...l, isFree: !l.isFree } : l) } : s
    ))
  }

  const totalLessons = sections.reduce((s,sec) => s + sec.lessons.length, 0)

  return (
    <>
      {/* backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose}/>

      {/* drawer */}
      <div className="fixed right-0 top-0 h-full w-[560px] bg-[#0e0e16] border-l border-white/[0.08] z-50 flex flex-col shadow-2xl shadow-black/60"
        style={{animation:'slideIn .25s cubic-bezier(.4,0,.2,1)'}}>
        <style>{`@keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>

        {/* drawer header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07] shrink-0">
          <div className="min-w-0">
            <h2 className="font-bold text-base truncate">{course.title}</h2>
            <p className="text-[12px] text-white/35 mt-0.5">{totalLessons} lessons across {sections.length} sections</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/8 text-white/40 hover:text-white transition-colors cursor-pointer bg-transparent border-none ml-4 shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* drawer tabs */}
        <div className="flex border-b border-white/[0.07] px-6 shrink-0">
          {(['details','content'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`py-3 px-3 -mb-px text-sm font-medium border-b-2 transition-colors bg-transparent cursor-pointer capitalize
                ${tab===t ? 'border-indigo-500 text-white' : 'border-transparent text-white/35 hover:text-white/60'}`}>
              {t === 'content' ? `Content · ${totalLessons}` : 'Details'}
            </button>
          ))}
        </div>

        {/* drawer body */}
        <div className="flex-1 overflow-y-auto">

          {/* ── DETAILS TAB ── */}
          {tab === 'details' && (
            <div className="p-6 flex flex-col gap-5">

              {/* thumbnail */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-white/50 tracking-wide">Thumbnail</label>
                <div onClick={() => fileRef.current?.click()}
                  className="relative aspect-video rounded-xl overflow-hidden cursor-pointer border border-white/[0.08] bg-[#1a1a26] group hover:border-white/20 transition-colors flex items-center justify-center">
                  {preview
                    ? <>
                        <img src={preview} alt="" className="w-full h-full object-cover"/>
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-sm font-semibold">{uploading ? 'Uploading…' : 'Click to replace'}</span>
                        </div>
                      </>
                    : <div className="text-center p-6">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/20 mx-auto mb-2">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        <p className="text-sm text-white/35">{uploading ? 'Uploading…' : 'Click to upload'}</p>
                      </div>
                  }
                  <input ref={fileRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => { const f=e.target.files?.[0]; if(f) handleFile(f) }}/>
                </div>
              </div>

              {/* title */}
              <Field label="Title *">
                <input value={form.title} onChange={(e)=>setForm(f=>({...f,title:e.target.value}))}
                  className="bg-[#1a1a26] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50 transition-colors"/>
              </Field>

              {/* description */}
              <Field label="Description *">
                <textarea value={form.description} onChange={(e)=>setForm(f=>({...f,description:e.target.value}))}
                  rows={4}
                  className="bg-[#1a1a26] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50 transition-colors resize-y min-h-[100px]"/>
              </Field>

              {/* topic + level */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Topic">
                  <select value={form.topic} onChange={(e)=>setForm(f=>({...f,topic:e.target.value}))}
                    className="bg-[#1a1a26] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50 transition-colors cursor-pointer appearance-none"
                    style={{backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%23555' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,backgroundRepeat:'no-repeat',backgroundPosition:'right 12px center'}}>
                    {TOPICS.map(t=><option key={t} value={t} className="bg-[#1a1a26]">{t}</option>)}
                  </select>
                </Field>
                <Field label="Level">
                  <select value={form.level} onChange={(e)=>setForm(f=>({...f,level:e.target.value}))}
                    className="bg-[#1a1a26] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50 transition-colors cursor-pointer appearance-none"
                    style={{backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%23555' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,backgroundRepeat:'no-repeat',backgroundPosition:'right 12px center'}}>
                    {LEVELS.map(l=><option key={l} value={l} className="bg-[#1a1a26]">{l}</option>)}
                  </select>
                </Field>
              </div>

              {/* price */}
              <Field label="Price ($)">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 font-semibold pointer-events-none">$</span>
                  <input type="number" min="0" step="0.01" value={form.price}
                    onChange={(e)=>setForm(f=>({...f,price:e.target.value}))}
                    className="w-full bg-[#1a1a26] border border-white/[0.08] rounded-xl pl-8 pr-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50 transition-colors"/>
                </div>
                <div className="flex gap-2 mt-2">
                  {[0,29,49,79,99].map(p=>(
                    <button key={p} type="button" onClick={()=>setForm(f=>({...f,price:String(p)}))}
                      className={`px-3 py-1 rounded-full text-[12px] font-medium border transition-all cursor-pointer
                        ${form.price===String(p) ? 'bg-indigo-500/18 border-indigo-500 text-indigo-300' : 'bg-transparent border-white/8 text-white/30 hover:border-white/20 hover:text-white/55'}`}>
                      {p===0?'Free':`$${p}`}
                    </button>
                  ))}
                </div>
              </Field>

              <button onClick={handleSave}
                className="flex items-center gap-2 justify-center bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm py-3 rounded-xl transition-colors cursor-pointer mt-2">
                {saved ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Saved!</> : 'Save changes'}
              </button>
            </div>
          )}

          {/* ── CONTENT TAB ── */}
          {tab === 'content' && (
            <div className="p-6 flex flex-col gap-3">

              {sections.map((section, sIdx) => {
                const isExpanded = expandedSections.has(section.id)
                return (
                  <div key={section.id} className="bg-[#12121a] border border-white/[0.07] rounded-xl overflow-hidden">

                    {/* section header */}
                    <div className="flex items-center gap-3 px-4 py-3">
                      <button onClick={() => setExpandedSections(prev => { const s=new Set(prev); s.has(section.id)?s.delete(section.id):s.add(section.id); return s })}
                        className={`text-white/25 hover:text-white transition-all cursor-pointer bg-transparent border-none ${isExpanded?'rotate-90':''}`}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
                      </button>
                      <span className="text-[11px] font-bold text-white/20 w-4 shrink-0">{sIdx+1}</span>
                      <span className="flex-1 font-semibold text-sm truncate">{section.title}</span>
                      <span className="text-[11px] text-white/25 shrink-0">{section.lessons.length} lessons</span>
                      <button onClick={() => handleDeleteSection(section.id)}
                        className="p-1.5 rounded-lg text-white/15 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer bg-transparent border-none ml-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
                      </button>
                    </div>

                    {/* lessons */}
                    {isExpanded && (
                      <div className="border-t border-white/[0.05]">
                        {section.lessons.map((lesson, lIdx) => (
                          <div key={lesson.id} className="group flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.02] border-t border-white/[0.03] first:border-0 transition-colors">
                            <span className="text-[11px] text-white/20 w-4 text-center shrink-0">{lIdx+1}</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/20 shrink-0">
                              <circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>
                            </svg>
                            <span className="flex-1 text-sm truncate">{lesson.title}</span>
                            {lesson.duration && <span className="text-[11px] text-white/20 shrink-0">{Math.floor(lesson.duration/60)}m</span>}
                            {/* free toggle */}
                            <button onClick={() => toggleFree(lesson, section.id)}
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-colors cursor-pointer
                                ${lesson.isFree ? 'bg-emerald-500/12 text-emerald-400 border-emerald-500/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20' : 'bg-white/4 text-white/25 border-white/8 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20'}`}
                              title={lesson.isFree ? 'Click to make paid' : 'Click to make free'}>
                              {lesson.isFree ? 'Free' : 'Paid'}
                            </button>
                            <button onClick={() => handleDeleteLesson(lesson.id, section.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-white/20 hover:text-red-400 cursor-pointer bg-transparent border-none">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                          </div>
                        ))}

                        {/* add lesson */}
                        {addingLessonTo === section.id ? (
                          <div className="px-4 py-4 bg-[#14141e] border-t border-white/[0.04] flex flex-col gap-3">
                            <input autoFocus value={lessonForm.title}
                              onChange={(e)=>setLessonForm(f=>({...f,title:e.target.value}))}
                              placeholder="Lesson title *"
                              className="bg-[#1e1e2e] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-indigo-500/50 transition-colors"/>
                            <input value={lessonForm.videoUrl}
                              onChange={(e)=>setLessonForm(f=>({...f,videoUrl:e.target.value}))}
                              placeholder="Video URL (YouTube, Vimeo, direct...)"
                              className="bg-[#1e1e2e] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-indigo-500/50 transition-colors"/>
                            <div className="flex gap-3">
                              <input type="number" value={lessonForm.duration}
                                onChange={(e)=>setLessonForm(f=>({...f,duration:e.target.value}))}
                                placeholder="Duration (seconds)"
                                className="flex-1 bg-[#1e1e2e] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-indigo-500/50 transition-colors"/>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <div onClick={()=>setLessonForm(f=>({...f,isFree:!f.isFree}))}
                                  style={{width:28,height:16,borderRadius:8,background:lessonForm.isFree?'#6366f1':'rgba(255,255,255,0.1)',position:'relative',cursor:'pointer',transition:'background .2s'}}>
                                  <span style={{position:'absolute',top:2,left:2,width:12,height:12,borderRadius:'50%',background:'#fff',transition:'transform .2s',transform:lessonForm.isFree?'translateX(12px)':'translateX(0)'}}/>
                                </div>
                                <span className="text-[12px] text-white/45">Free</span>
                              </label>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={()=>handleAddLesson(section.id,section.lessons.length)}
                                disabled={!lessonForm.title.trim()}
                                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold text-sm px-5 py-2 rounded-xl transition-colors cursor-pointer">
                                Add lesson
                              </button>
                              <button onClick={()=>{setAddingLessonTo(null);setLessonForm({title:'',videoUrl:'',duration:'',isFree:false})}}
                                className="text-white/30 hover:text-white text-sm px-3 py-2 cursor-pointer bg-transparent border-none">
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="px-4 py-2.5 border-t border-white/[0.03]">
                            <button onClick={()=>{setAddingLessonTo(section.id);setExpandedSections(p=>new Set([...p,section.id]))}}
                              className="flex items-center gap-1.5 text-[12px] text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer bg-transparent border-none transition-colors">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                              Add lesson
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}

              {/* add section */}
              {addingSection ? (
                <div className="flex items-center gap-2 bg-[#12121a] border border-indigo-500/30 rounded-xl px-4 py-3">
                  <input autoFocus value={newSectionTitle}
                    onChange={(e)=>setNewSectionTitle(e.target.value)}
                    onKeyDown={(e)=>{if(e.key==='Enter')handleAddSection();if(e.key==='Escape')setAddingSection(false)}}
                    placeholder="Section title…"
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-white/20 outline-none"/>
                  <button onClick={handleAddSection} disabled={!newSectionTitle.trim()}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold text-[13px] px-4 py-1.5 rounded-lg transition-colors cursor-pointer">
                    Add
                  </button>
                  <button onClick={()=>setAddingSection(false)}
                    className="text-white/30 hover:text-white text-sm cursor-pointer bg-transparent border-none">×</button>
                </div>
              ) : (
                <button onClick={()=>setAddingSection(true)}
                  className="flex items-center justify-center gap-2 w-full bg-transparent border-2 border-dashed border-white/[0.07] hover:border-indigo-500/35 hover:bg-indigo-500/4 text-white/30 hover:text-indigo-400 text-sm font-medium py-3.5 rounded-xl transition-all cursor-pointer">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Add section
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ── helpers ───────────────────────────────────────────────────────────────────
function Field({ label, children }: { label:string; children:React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-semibold text-white/50 tracking-wide">{label}</label>
      {children}
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="max-w-5xl mx-auto px-8 py-10 flex flex-col gap-6 animate-pulse">
        <div className="h-40 bg-[#12121a] rounded-2xl"/>
        <div className="h-8 bg-[#12121a] rounded-xl w-48"/>
        {[...Array(4)].map((_,i)=><div key={i} className="h-20 bg-[#12121a] rounded-2xl"/>)}
      </div>
    </div>
  )
}