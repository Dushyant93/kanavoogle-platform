import Alert from 'react-bootstrap/Alert'
import ListGroup from 'react-bootstrap/ListGroup'
import Spinner from 'react-bootstrap/Spinner'
import { useSkills } from '../../hooks/useSkills'

export function SkillCatalog() {
  const { skills, loading, error } = useSkills()

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading skills</span>
        </Spinner>
      </div>
    )
  }

  if (error) return <Alert variant="danger">{error}</Alert>

  return (
    <section>
      <h1 className="h3">Skills</h1>
      <ListGroup>
        {skills.map((skill) => (
          <ListGroup.Item key={skill.id}>
            <div className="fw-semibold">{skill.name}</div>
            <small className="text-secondary">
              {skill.subSkills.filter((subSkill) => subSkill.active).length} sub-skills
            </small>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </section>
  )
}
