# Team roles and contribution record

> Replace the placeholders with the real names and agreed responsibilities. Do not claim work or reviews that did not happen.

| Role | Participant | Responsibility | Evidence (issues/PRs/commits) |
|---|---|---|---|
| Team lead / integrator | TBD | Scope, issue triage, integration, release checklist | TBD |
| Core / model | TBD | Lattice, clusters, observables, tests | TBD |
| View / UX | TBD | Canvas, controls, accessibility, export UI | TBD |

## Collaboration agreement
- Work is tracked in GitHub Issues.
- Each feature is developed on a short-lived branch and merged via Pull Request.
- At least one teammate reviews each PR; author does not self-approve.
- PRs must link an Issue, explain the change, and include test evidence.
- CI must pass before merge.
- Record actual review comments and integration decisions in the PR; this document is not proof of past contributions.

## Definition of Done
- [ ] Observable has a clear mathematical definition and units.
- [ ] Model logic is independent of DOM.
- [ ] Tests cover normal and boundary cases.
- [ ] UI labels match what the algorithm actually computes.
- [ ] Export includes parameters, seed, schema version and uncertainty where applicable.
- [ ] README/docs are updated.
- [ ] CI passes and a teammate has reviewed the PR.
