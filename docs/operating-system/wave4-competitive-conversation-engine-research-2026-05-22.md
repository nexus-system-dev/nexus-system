# Wave 4 Competitive Conversation Engine Research — 2026-05-22

מטרת המסמך:
- לבצע מחקר חיצוני ממוקד על builders ו־agents שמצליחים לקבל שפה חופשית ולבנות מהר בלי להרגיש כמו wizard
- לזהות מה באמת קורה אצלם ברמת המנוע והשיחה
- להחזיר את המסקנות לתוך `Wave 4` רק כמשימות קנוניות עם live proof

## Research Scope

נבדקו מקורות רשמיים ועדכניים עבור:
- Lovable
- v0
- Bolt.new
- Replit Agent
- Firebase Studio App Prototyping agent
- Windsurf Cascade

מקורות עיקריים:
- Lovable Prompting: https://docs.lovable.dev/prompting/prompting-one
- Lovable Knowledge: https://docs.lovable.dev/features/knowledge
- Lovable Plan Mode: https://docs.lovable.dev/features/plan-mode
- v0 Docs: https://v0.app/docs
- v0 Text Prompting: https://v0.app/docs/text-prompting
- v0 Quickstart: https://v0.app/docs/quickstart
- v0 Composite Model Family: https://vercel.com/blog/v0-composite-model-family
- v0 Prompting Blog: https://vercel.com/blog/how-to-prompt-v0
- Bolt Intro: https://support.bolt.new/building/intro-bolt
- Bolt QuickStart: https://support.bolt.new/building/quickstart
- Replit Agent Overview: https://docs.replit.com/references/agent/overview
- Replit Effective Prompting: https://docs.replit.com/learn/effective-prompting
- Replit Build With Agent: https://docs.replit.com/learn/build-with-agent
- Replit Plan vs Build: https://docs.replit.com/tutorials/plan-vs-build-mode
- Firebase Studio App Prototyping: https://firebase.google.com/docs/studio/get-started-ai
- Firebase Studio Prompting: https://firebase.google.com/docs/studio/prompting
- Windsurf Memories: https://docs.windsurf.com/windsurf/cascade/memories

## Core Finding

המתחרים לא “מבינים את המשתמש בקסם” ולא באמת פותרים כל דבר בלי שאלות המשך.

מה שהם עושים טוב יותר:
1. הם מתחילים מטיוטה ראשונה או spec hidden לפני שהם פותחים חקירה גלויה.
2. הם מחזיקים הקשר מתמשך מחוץ להודעות עצמן.
3. הם מסיקים ברירות־מחדל בשקט במקום לגרור את המשתמש דרך intake גלוי.
4. הם משתמשים ב־correction loops זולים ומהירים במקום לנסות לסגור הבנה מושלמת בכל הודעה.
5. הם שומרים את המבנה הפנימי נסתר, ואת השיחה מול המשתמש אנושית וקצרה.

## Comparative Patterns

### 1. Hidden structured state beats visible wizarding

v0 מתאר pipeline שבו כל הודעה עוברת:
- system prompt
- recent messages
- summaries of older messages
- retrieved context from docs, examples, project sources, and internal knowledge

Lovable קורא בכל הודעה:
- project knowledge
- workspace knowledge
- project code
- integration knowledge
- repo instruction files like `AGENTS.md`

Windsurf שומר `Memories` ו־`Rules`.

מסקנה:
- אצל המתחרים, המשתמש לא רואה את רוב איסוף ההקשר.
- Nexus כרגע מנסה להוציא יותר מדי מה־structured state לשיחה עצמה, ולכן השיחה נשמעת כמו intake shell.

### 2. They infer defaults before asking visible questions

Bolt, v0, Replit, ו־Firebase Studio מוכרים הבטחה של:
- prompt אחד
- build ראשון
- iteration afterwards

Firebase Studio אפילו עובר דרך `blueprint` גלוי לפני build, אבל עדיין לא מכריח את המשתמש למלא wizard שיטתי.

Lovable ו־Replit כן תומכים ב־Plan mode ו־clarifying questions, אבל כמצב בחירה או צעד ממוקד, לא כשפת ברירת־מחדל לכל שיחה.

מסקנה:
- המתחרים מעדיפים first draft + correction על פני over-clarification upfront.
- Nexus כרגע מגיב מוקדם מדי עם clarification גלוי, לפני שנוצר למשתמש רושם שהמערכת כבר “הבינה מספיק כדי להתחיל”.

### 3. They separate planning from user-facing tone

Replit:
- Plan mode
- Build mode
- checkpoints/rollback

Lovable:
- Plan mode
- Agent mode

Firebase Studio:
- blueprint
- codegen
- fix/debug loop

מסקנה:
- אצל המתחרים, החקירה המעמיקה קיימת, אבל יש לה גבול מוצרי ברור.
- Nexus כרגע מערבב בין internal planning לבין user-facing dialogue, ולכן “השיחה” יוצאת כמוזר של reasoning trace במקום partner talk.

### 4. They avoid robotic summaries by keeping actor models implicit

במוצרים שנבדקו, אין כמעט דוגמאות גלויות של:
- “הבנתי שהמשתמש הוא אני”
- restatement awkward בגוף לא נכון
- forcing role fields into user-visible phrasing

זה לא בגלל שיש להם NLP קסום יותר.

זה קורה כי:
- `speaker`
- `business owner`
- `end user`
- `operator`
- `team`

נשמרים בפנים כמודל תפקידים נפרד, ולא כטקסט חצי-מבושל שנשפך ישר ל־summary card.

מסקנה:
- Nexus חסר כרגע `actor-role graph` ו־`speaker perspective resolver` יציבים מספיק.

### 5. They ask fewer questions because they accept more build risk

המתחרים המהירים ביותר פועלים על policy של:
- infer the likely class
- generate a plausible default implementation
- let the user correct

ולא policy של:
- clarify every ambiguity before momentum exists

מסקנה:
- אם Nexus רוצה להרגיש פחות כמו wizard, הוא צריך לאמץ policy ברורה של:
  - מה מותר להניח בשקט
  - מה מחייב clarification גלוי
  - מתי first draft עדיף על עוד שאלה

## What This Means For Nexus

### What is actually missing

לא חסר רק “prompt טוב יותר”.

חסרים במנוע:
1. `speaker/perspective resolution`
2. `actor-role graph`
3. `hidden product brief` שמתעדכן מהשיחה בלי להישפך כמו־שהוא למסך
4. `default-assumption policy`
5. `product-family wrapper packs`
6. `tone/pacing contract`
7. `summary rewrite layer` שמתרגם structured truth לעברית אנושית

### Why competitors feel easier

הם בדרך כלל:
- מנחשים product family מוקדם
- מייצרים draft או plan מהר
- לא מנסחים כל inference בתור שאלה
- לא מסכמים כל state transition למשתמש
- מחזיקים memory מחוץ לשיחה
- נותנים correction path זול

### What Nexus must not copy blindly

Nexus לא צריך להפוך ל־one-shot generator טיפש.

מה לא להעתיק:
- black-box assumptions בלי trace
- build hallucination בלי bounded truth
- closing understanding just because a first draft exists

מה כן להעתיק:
- hidden structure
- visible momentum
- targeted clarification only where it changes product shape
- cheap correction
- human summaries

## Canonical Translation

כל pattern חיצוני חייב להיכנס רק דרך השרשרת הזו:

`external pattern`
-> `Nexus rule`
-> `product-family branch behavior`
-> `understood vs missing rule`
-> `closure blocker`
-> `live scenario`

אם הוא לא עובר דרך השרשרת הזו, הוא לא נכנס לקנון.

## Task Translation

### W4-AGENT-003 — Implement post-onboarding clarification and correction loop

המשימה הזאת צריכה עכשיו לכלול במפורש:
- `speaker/perspective correction`
- `owner vs end-user correction`
- rewrite של `מה הבנתי` ו־`מה חסר` בגוף נכון
- correction שמעדכן את אותו project-understanding chain
- no stale actor truth after refresh

דוגמאות חובה:
- user says `המשתמש זה אני`
- user says `לקוח שלי`
- user says `לא, זה לא המשתמש אלא אני בעל העסק`

### W4-AGENT-004 — Bring competitor and comparable-product intelligence into the live agent dialogue

המשימה הזאת צריכה עכשיו לכלול במפורש:
- pattern import ממוצרים דומים
- pacing heuristics
- clarification heuristics
- comparable wrapper decisions by product family
- bounded competitive suggestions inside dialogue

אבל:
- לא raw browsing dump
- לא static cards
- לא generic best-practices

### W4-AGENT-004A — Convert external product-conversation patterns into Nexus product-family wrapper packs

deliverable truth:
- לכל family יש:
  - core disambiguation questions
  - wrapper decisions
  - weak-answer traps
  - summary truth rules
  - closure blockers

families:
- storefront
- marketplace
- booking
- CRM
- internal tool
- SaaS
- ops/logistics
- services/content
- admin dashboard

### W4-AGENT-004B — Derive live conversational tone and pacing rules from external product intelligence

deliverable truth:
- one-question-at-a-time rhythm
- when to infer silently
- when to challenge
- when to apologize/reframe
- when to synthesize
- forbidden robotic phrasing
- summary rewrite rules from hidden structure to human Hebrew

## Ordering Truth

הסדר הקנוני הנכון כרגע:
1. `W4-AGENT-003`
2. `W4-AGENT-004`
3. `W4-AGENT-004A`
4. `W4-AGENT-004B`

אין הצדקה לפתוח lane חדש.

אין הצדקה לדלג על `W4-AGENT-003`.

`W4-AGENT-001A` לא צריך להיפתח מחדש כל עוד:
- בעיות ה־speaker/perspective
- correction truth
- tone/pacing import

יכולות להיסגר truthfully דרך `W4-AGENT-003` ו־`W4-AGENT-004*`.

## Final Strategic Conclusion

הפער של Nexus מול המתחרים הוא לא “המודל פחות חכם”.

הפער הוא מוצרי:
- יותר מדי structure גלוי למשתמש
- פחות מדי hidden structured understanding
- יותר מדי clarification לפני momentum
- פחות מדי default inference policy
- summary layer שעדיין לא מתרגם role truth לשפה אנושית

הדרך לסגור את הפער אינה:
- עוד copy tweak
- עוד prompt tweak

אלא:
- actor model
- hidden brief
- correction loop
- family wrapper packs
- tone/pacing contract
- live comparable-product import
