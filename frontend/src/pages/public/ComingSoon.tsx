import { useCurrentStudent } from '../../hooks/useAssessmentFlow'
import { Footer } from '../../layout/Footer'
import { Header } from '../../layout/Header'
import '../../styles/style.css'

type ComingSoonProps = {
  /** Name of the feature, e.g. "Export ledger". */
  title: string
  /** True for pages reached from inside the student area, so the student header stays. */
  signedIn?: boolean
}

function goBack() {
  if (window.history.length > 1) window.history.back()
  else window.location.assign('/')
}

/** Placeholder for links whose pages aren't built yet. The list of paths is in App.tsx. */
export function ComingSoon({ title, signedIn = false }: ComingSoonProps) {
  const student = useCurrentStudent()

  return (
    <>
      <Header user={signedIn ? student : null} />
      <main className="login">
        <section className="login__card" aria-labelledby="coming-soon-title">
          <h1 id="coming-soon-title" className="login__title">
            {title} is coming soon
          </h1>
          <p className="mb-4">This feature isn't available yet. We're still building it.</p>
          <button type="button" className="login__submit btn btn-primary" onClick={goBack}>
            Go back
          </button>
        </section>
      </main>
      <Footer />
    </>
  )
}
