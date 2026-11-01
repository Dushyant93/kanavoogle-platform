export type SubSkill = {
  id: string
  name: string
  active: boolean
}

export type Skill = {
  id: string
  code: string
  name: string
  description?: string
  active: boolean
  subSkills: SubSkill[]
}
