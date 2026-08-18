/* ===================================================================
 * 천재(강상구) 영어II Lesson 2 — 원문 정본 (ground truth)
 * ===================================================================
 * 원문 PDF(천재강 2과.pdf)에서 verbatim 전사. 문장 누락 검증의 기준.
 * ★ 이 파일은 원문이므로 임의 수정 금지.
 *
 * 원문 PDF 는 "1)~40)" 로 번호를 매기지만 한 항목에 2문장이 든 경우가 많다
 * (예: 2번, 7번, 10번, 14번 …). 여기서는 **실제 문장 단위**로 쪼갠다.
 *
 * 구성:
 *   Ch1~4 = 본문(Nudge) — 교과서 소제목 기준 4챕터
 *   Ch5   = 본문 외 지문(Dark Patterns)
 * =================================================================== */

export const SOURCE = [
  {
    no: 1,
    subtitle: '넛지란 무엇인가 (도입)',
    sentences: [
      "You have probably received a notification from your smartphone telling you that it is time to exercise or move.",
      "These devices lead people to move by sending notifications when they have been inactive for a set amount of time.",
      "You may not have realized it, but this is an example of a nudge.",
      "A nudge is an intervention that gently guides individuals toward a desired action, without forbidding any options.",
      "For example, if a school wants to reduce the amount of sugary drinks that students consume, then making them less visible than bottled water counts as a nudge, while banning them altogether does not.",
      "Having been studied in the domain of behavioral economics and marketing, nudging can be applied to inducing people to make better or ideal decisions.",
      "Here are some ways nudges have succeeded in bringing about positive changes by tweaking people's choices.",
    ],
  },
  {
    no: 2,
    subtitle: 'Through Designs — 디자인 활용',
    sentences: [
      "Changes in visual designs can markedly affect behaviors of people, especially on streets.",
      "Two artists, mother and daughter, painted a 3D crosswalk on several roads in Ahmedabad, India.",
      "To motorists, the painted lines look like roadblocks, causing them to slow down without braking too suddenly.",
      "The scheme was also adopted in Delhi, India.",
      "This, in turn, inspired Ralf Trylla, an environmental commissioner in Iceland, to head a similar project.",
      "As a result, drivers were being more careful at intersections, which reduced accidents and elevated the safety of pedestrians.",
      "The idea has been well received and mirrored in cities of China, the U.S., Canada, and the UK as well.",
      "Likewise, traffic engineers design pavement markings on the roads that drive people to change their behavior without realizing it.",
      "Chicago was one of the first U.S. cities to experiment with this idea.",
      "In 2006, it painted a series of lines across the road ahead of a dangerous curve on North Lake Shore Drive.",
      "The lines are spaced in such a way that as the road nears the curve, the gaps between the lines get smaller and smaller.",
      "This gives drivers approaching the curve an illusion that they are speeding up, which prompts them to step on the brakes.",
      "Chicago traffic engineers reported a 36% reduction in crashes at the North Lake Shore Drive curve in the first six months after painting the lines.",
      "Since then, the Chicago Department of Transportation has painted the gapped lines at similar curves.",
    ],
  },
  {
    no: 3,
    subtitle: 'Through Peer Pressure — 동조 압력 활용',
    sentences: [
      "If you are told what other people do, you might do it too, because you think it is probably a good idea to do what they do.",
      "And even if you aren't sure, you might not want to disobey social norms, so you will go along.",
      "Highlighting the right decisions of others can lead one to do the right thing.",
      "While the sign saying \"Take your trash home or get a $100 fine.\" pushes people, the one saying \"Take your trash home. Other people do.\" nudges them.",
      "Many people feel compelled to match their behavior with that of the majority.",
      "The decision is theirs, but they have been nudged.",
      "However, nudging people into making good choices does not always go as planned.",
      "For instance, in a study of household energy conservation, the researchers provided the residents with information about their neighbors' average energy use.",
      "As expected, those who had consumed more energy than the average reduced their use later; however, households with low levels of energy consumption increased their use after learning that their consumption had been lower than their neighbors'.",
      "The researchers inferred that the lack of a reminder about the environmental benefits of saving energy could have caused the information to have an opposite effect.",
      "Later, they added a smiley face to the information sent to those who used less energy than the average, and found that it neutralized the opposite effect.",
    ],
  },
  {
    no: 4,
    subtitle: 'Through Defaults — 디폴트 활용',
    sentences: [
      "A default is defined as an option that applies if the chooser does nothing.",
      "Of course, the chooser has the freedom to opt out of the default.",
      "Defaults are effective at nudging people toward more desirable behaviors.",
      "Human beings are subject to a powerful desire to stick with what they already have because making a change requires a conscious effort.",
      "Furthermore, because a default also gives the impression that someone is recommending this choice, if people choose to opt out, they might feel they are not being good citizens, particularly in the case of green defaults.",
      "Setting greener choices as defaults can automatically nudge people into more sustainable behaviors.",
      "In 2008, Rutgers University instituted a new student printing policy to save on paper waste: it established printing on both sides of paper as the default setting for all its printers.",
      "As a result of that simple change, the university saved about 62 million sheets of paper in about three years.",
      "Nudging through defaults can also apply to a food delivery app.",
      "A company recently announced an update for its app where it would change the default settings for the optional items, such as forks, spoons, and straws.",
      "Users would have to opt out of the default to get them.",
      "The company mentioned in an online post that having surveyed many of its customers, they found that more than 90% of them didn't really need disposable plastic items with their orders.",
      "Are you interested in changing certain people's behavior?",
      "Then why not nudge them in the right direction?",
      "There are many ways to subtly influence people to make better decisions.",
      "As we are all choice architects every now and then, it pays to know how to set people on the right path.",
    ],
  },
  {
    no: 5,
    subtitle: '본문 외 지문 · Dark Patterns (도입 + Forced Continuity)',
    sentences: [
      "Dark patterns are design elements or processes that companies use to manipulate consumer behavior.",
      "They come in a wide variety of forms.",
      "Sometimes they are harmless, but sometimes they are misleading.",
      "The following examples of dark patterns will help you recognize and deal with them properly in the future.",
      "If you have signed up for a streaming service recently, you have probably run into this dark pattern where your credit card is automatically charged as soon as a free trial comes to an end.",
      "While the companies that do this would argue that it enables users to continue to access their service uninterrupted, users receive no warning that their cards are about to be charged, often causing them to be billed unexpectedly.",
      "This method is used by many streaming platforms, but it is also common with other services that offer free trials.",
    ],
  },
  {
    no: 6,
    subtitle: '본문 외 지문 · Artificial Scarcity + Hidden Information',
    sentences: [
      "Artificial scarcity is used to stimulate purchases.",
      "This typically comes in three major forms: insufficient quantities, time, or availability.",
      "We make decisions more quickly under pressure.",
      "The decision is then often made quite automatically only on the basis of scarcity.",
      "After all, no one wants to miss out on a great offer.",
      "In this pattern, important information and options are hidden or displayed in such a way that they are hardly noticeable.",
      "To see the information, you have to click somewhere, look very closely, or actively search for it.",
      "Every newsletter must allow you to unsubscribe.",
      "But just because companies have to provide the option, it doesn't mean they have to make it easy for you to see!",
      "So the \"unsubscribe\" link is made almost invisible in the email.",
      "Gray print on a dark background is rather hard to read, as is very small print.",
      "Dark patterns are everywhere.",
      "It is always important to be aware that a company's goals don't always correspond with your own.",
      "To detect and resist dark patterns, you need to read carefully and think before you click on a button.",
    ],
  },
];
