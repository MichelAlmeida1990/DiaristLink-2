import dynamic from "next/dynamic"

const EmployerJobsPageContent = dynamic(() => import("./page-content"), {
  ssr: false,
})

export default function EmployerJobsPage() {
  return <EmployerJobsPageContent />
}


