# GitHub collaboration workflow

1. Create Issues for tasks and assign one owner.
2. Create branches such as `feat/csv-export`, `fix/crossing-observable`, `docs/team-roles`.
3. Commit focused changes with messages such as `fix: define vertical crossing observable`.
4. Open a Pull Request to `main`; link the Issue and describe validation.
5. A teammate reviews and requests changes if needed; author resolves comments.
6. Require passing CI and one approving review in branch protection before merge.
7. Delete merged branches and use Releases/tags for submitted versions.

Repository settings to configure manually:
- Settings → Rules → Rulesets (or Branches → Branch protection rules) → protect `main`.
- Require a pull request before merging, at least one approval, and status checks from CI.
- Disable force pushes and branch deletion on `main`.
- Settings → Collaborators (or Manage access) → invite the real team members with appropriate permissions.
- Settings → Actions → General → allow the required GitHub Actions workflow.
- Do not share a team mailbox/password. Each contributor should use their own GitHub account and configure their own commit email.

Important: GitHub cannot retroactively prove historical individual work. Use future branches, PRs, reviews and issue links as genuine evidence. Never fabricate authorship or reviews.
