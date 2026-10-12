import Alert from 'react-bootstrap/Alert'
import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import { useResults } from '../../hooks/useResults'
import { formatLabel, formatPercent } from '../../utils/format'

type AssessmentResultViewProps = {
  assessmentId: string
}

export function AssessmentResultView({ assessmentId }: AssessmentResultViewProps) {
  const { result } = useResults(assessmentId)

  if (!result) {
    return <Alert variant="secondary">Return to your dashboard to view the recorded test.</Alert>
  }

  const { assessment } = result

  return (
    <section>
      <h1 className="h3">{assessment.skillName}</h1>
      <p className="text-secondary">{assessment.subSkillName}</p>
      <Row className="g-3">
        <Col md={4}>
          <Card>
            <Card.Body>
              <div className="text-secondary">Score</div>
              <div className="h4 mb-0">{formatPercent(assessment.weightedPercent)}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <div className="text-secondary">Correct</div>
              <div className="h4 mb-0">
                {result.correctAnswers} / {result.totalQuestions}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <div className="text-secondary">Complexity</div>
              <div className="h4 mb-0">{formatLabel(assessment.complexity)}</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </section>
  )
}
