---
name: landed
description: Post-merge verification — confirms the merged change is passing CI on main, deletes the now-merged local and remote feature branch, and reports a short confirmation. Use when the user runs /landed or says a PR has been merged and wants cleanup.
---

# /landed — Post-merge verification

1. Run `git fetch` and check the CI status of the latest commit on
   `main` (e.g. `gh run list --branch main --limit 1` or
   `gh pr checks` on the merge commit) to confirm it's passing.
2. Identify the feature branch that was just merged (ask the user if
   it's not obvious from context).
3. Confirm with the user before deleting anything, then:
   - Delete the local branch: `git branch -d <branch>`.
   - Delete the remote branch: `git push origin --delete <branch>`.
4. Report a short summary:

   ```
   CI on main: <passing/failing> (<commit sha>)
   Branch deleted: <branch> (local + remote)
   ```

5. If CI on main is failing, stop before deleting the branch and flag
   it to the user instead.
