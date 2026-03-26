# Nexus Working Priority List

מסמך עבודה מסודר לפי מה נכון לממש קודם בפועל, על בסיס ה־backlog הקיים מול מצב הקוד הנוכחי.

הערה:
- שמות הרכיבים והמשימות נשמרים כפי שהם ב־source of truth
- זה לא מחליף את [docs/backlog-source-of-truth.md](/Users/yogevlavian/Desktop/The%20Nexus/docs/backlog-source-of-truth.md)
- זה מסמך תעדוף לביצוע

## P0 — לעבוד עכשיו

1. `Task Result Ingestion`
- סטטוס: `חלקי`

2. `Scheduler`
- סטטוס: `חלקי`

3. `Memory` מתמשכת לפרויקט
- סטטוס: `חלקי`

4. `Create domain-specific task template loader`
- סטטוס: `חסר`

5. `Smart Defaults Engine`
- סטטוס: `חסר`
- `Create defaults rule engine`
- `Create stack recommendation module`
- `Create hosting and release defaults module`
- `Create default approval generator`

6. `Business Context Layer`
- סטטוס: `חסר`

7. `Decision Intelligence Layer`
- סטטוס: `חסר`

8. `Business Bottleneck Resolver`
- סטטוס: `חסר`

9. `Project Bootstrap Layer`
- סטטוס: `חסר`
- `Create bootstrap plan generator`
- `Create bootstrap task templates`
- `Create bootstrap dispatcher`
- `Create bootstrap execution runner`
- `Create bootstrap validation module`
- `Create bootstrap state updater`

10. `Approval System`
- סטטוס: `חסר`

11. `Policy Layer`
- סטטוס: `חסר`

## P1 — לעבוד מיד אחרי P0

12. `Cross-Functional Task Graph`
- סטטוס: `חסר`

13. `Growth & Marketing Planner`
- סטטוס: `חסר`

14. `Agent Runtime`
- סטטוס: `חלקי`

15. `agents אמיתיים`
- סטטוס: `חלקי`
- `docs`
- `ops`

16. סביבת הרצה בטוחה
- סטטוס: `חסר`
- `sandbox`
- `temp branch`
- `container`

17. יכולות execution אמיתיות
- סטטוס: `חסר`
- ליצור branch
- לערוך קוד
- לכתוב test
- להריץ build
- לפתוח PR

18. `Execution Feedback Layer`
- סטטוס: `חלקי`
- `Create execution event summarizer`
- `Create live progress model`
- `Create execution log formatter`
- `Create execution status API`
- `Create execution completion notifier`

19. `Diff Preview`
- סטטוס: `חסר`

## P2 — אחרי שיש execution אמיתי

20. `Delivery / Release Flow`
- סטטוס: `חסר`
- `Create release plan generator`
- `Create release pipeline orchestrator`
- `Create release validation module`
- `Create release state updater`

21. `Deployment & Hosting Orchestrator`
- סטטוס: `חסר`
- `Create hosting provider adapter contract`
- `Create environment provisioner`
- `Create env management module`
- `Create domain and routing provisioner`
- `Create deployment execution module`

22. `Build & Release System`
- סטטוס: `חסר`
- `Create build target resolver`
- `Create build runner`
- `Create artifact registry module`
- `Create versioning service`
- `Create packaging module`

23. `External Accounts Connector`
- סטטוס: `חסר`
- `Create external account registry`
- `Create provider connector contract`
- `Create account verification module`
- `Create account linking API`

24. `Credentials Management`
- סטטוס: `חסר`
- `Create credential vault interface`
- `Create credential encryption module`
- `Create credential access policy`
- `Create secret resolution module`

25. `Distribution Ownership Model`
- סטטוס: `חסר`
- `Create ownership policy model`
- `Create distribution authorization checks`
- `Create owner-consent recorder`
- `Create ownership-aware release guard`

26. `Release Status Tracking`
- סטטוס: `חסר`
- `Create release status state model`
- `Create store and provider status pollers`
- `Create release timeline builder`
- `Create rejection and failure mapper`
- `Create release tracking API`

## P3 — רק אחרי שהמערכת עובדת מקצה לקצה

27. `Cross-Project Memory`
- סטטוס: `חסר`

28. `Learning Layer`
- סטטוס: `חסר`

29. `Scalability`
- סטטוס: `חסר`

## מה כבר סגור מספיק כדי לא לגעת עכשיו

- `Onboarding Engine`
- סטטוס: `בוצע`
- `Universal Project Lifecycle`
- סטטוס: `בוצע`
- `Extend domain registry`
- סטטוס: `בוצע`
- `Create domain classification engine`
- סטטוס: `בוצע`
- `Create domain capability mapper`
- סטטוס: `בוצע`
- `Context Builder`
- סטטוס: `בוצע`
- `Canonical Schema`
- סטטוס: `בוצע`
- `Source Adapter Layer`
- סטטוס: `בוצע`
- `Confidence Metadata`
- סטטוס: `בוצע`
- `Domain-Aware Planner`
- סטטוס: `בוצע`
- `Deep Code Scanner`
- סטטוס: `בוצע`
- `Structured Analysis Pipeline`
- סטטוס: `בוצע`
- `AI Layer stability`
- סטטוס: `בוצע`
- `Document & knowledge ingestion`
- סטטוס: `בוצע`
- `GitHub/GitLab integration`
- סטטוס: `בוצע`
- `Runtime sources`
- סטטוס: `בוצע`
- `Project State`
- סטטוס: `בוצע`
- `Execution Graph`
- סטטוס: `בוצע`
