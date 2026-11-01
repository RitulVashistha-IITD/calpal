const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "How did you get my number?",
    body: [
      "Short version: math. Cute math, but math.",
      "We take your height, weight, age and sex, run them through a formula from 1990 called Mifflin-St Jeor, and multiply by how much you're on your feet in a normal day. That's roughly what you burn just by being a person who exists. For most healthy adults it lands within about 10%, which is pretty decent for a formula that has never met you.",
      "Workouts you log are not in that number. They get added on top, so nothing is counted twice. Yes, you get full credit for the gym. You earned it.",
    ],
  },
  {
    title: "Why not just eat nothing until the trip?",
    body: [
      "Because you'd show up tired, grumpy and with less muscle. Iconic, but no.",
      "Most guidance lands on 0.5 to 1 kg a week as the sweet spot. Go much faster and you're more likely to lose muscle, miss nutrients, or get gallstones. Not the souvenir we're after.",
      "I also cap the pace at 1% of your body weight a week, so smaller bodies get a gentler ceiling. That 1% is my own rule, not an official one.",
      "If your date needs a faster pace than that, the app says so honestly and gives you the safe-pace budget instead. Think of it as a very supportive friend who refuses to lie to you.",
    ],
  },
  {
    title: "What's with the calorie floors?",
    body: [
      "1,200 for women and 1,500 for men are the numbers you'll see quoted as the lowest sensible intake without a professional involved. Below that, getting all your nutrients in gets really hard. For \"prefer not to say\" I used 1,350, which is literally just the middle. No source, just arithmetic and good intentions.",
      "Doctors can prescribe lower plans with supervision. This app is not your doctor, so it stays above the line.",
      "Also, it's a suggestion, not a locked door. You're the boss. Set any budget you like in Edit goal.",
    ],
  },
  {
    title: "The 7,700 calories per kg thing",
    body: [
      "Roughly 7,700 kcal makes a kilo of body weight. It's an old rule of thumb, and a decent one, but bodies aren't spreadsheets. They adapt as you lose weight, so long-range forecasts tend to be a little optimistic.",
      "I re-estimate your burn as your weight drops, which helps, but it isn't magic. So the forecast is a compass, not a promise.",
    ],
  },
  {
    title: "Why does it skip days I didn't log?",
    body: [
      "Because a day with no entries isn't a day of eating zero calories. It's a day of forgetting. If I counted those, you'd look like you were fasting like a monk and the forecast would be wildly cheerful.",
      "So it needs at least 3 logged days from the last week, and it leaves out today because the day isn't over yet. Log the snacks too. The forecast can tell.",
    ],
  },
  {
    title: "Which parts are solid, and which did you make up?",
    body: [
      "Solid-ish: the burn formula, the 0.5 to 1 kg a week range, the 1,200 and 1,500 floors, and BMI 18.5 as the line for underweight. BMI is a blunt tool that ignores muscle, so it only nudges you with a note and never blocks anything.",
      "Rule of thumb: the 7,700 kcal per kg.",
      "My own calls: the 1% cap, the 0.5 kg a week cap for gaining, the 1,350 floor, the age range of 18 to 90, and the 800 to 10,000 range the goal box accepts, which is only there to catch typos.",
      "Most of the sources I could find were health and calculator sites, not original studies, so treat these as widely repeated conventions and not gospel.",
    ],
  },
  {
    title: "What can't this know?",
    body: [
      "Your medical conditions, medications, pregnancy, eating-disorder history, how much muscle you carry, or how badly you slept. It's a calculator, not a clinician.",
      "It's for adults only. Teens, pregnancy and older age need an actual professional. If any of that is you, or you have a health condition, check with a doctor or dietitian before changing how you eat.",
      "And if tracking numbers ever starts feeling stressful or obsessive, it's totally fine to step away from it. You're doing great either way.",
    ],
  },
];

const Chevron = ({ className }: { className: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

export default function HowItWorks({ defaultOpen = false }: { defaultOpen?: boolean }) {
  return (
    <details open={defaultOpen} className="group/outer rounded-2xl border border-mist-200 bg-mist-50/60">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden">
        <span>
          <span className="block font-display text-lg font-bold">Wait, how does all this work?</span>
          <span className="text-sm text-mist-500">Open for the nerdy bits. Zero judgment, lots of cheering.</span>
        </span>
        <Chevron className="shrink-0 text-mist-500 transition group-open/outer:rotate-180" />
      </summary>

      <div className="space-y-2 px-3 pb-3">
        <p className="px-2 pb-1 text-sm text-mist-700">
          You showed up and you're logging your food. That already puts you ahead of most people's good intentions. Here's what's going on under the hood.
        </p>
        {SECTIONS.map((s) => (
          <details key={s.title} className="group/item rounded-xl bg-white">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-bold [&::-webkit-details-marker]:hidden">
              {s.title}
              <Chevron className="shrink-0 text-mist-500 transition group-open/item:rotate-180" />
            </summary>
            <div className="space-y-2 px-4 pb-4 text-sm leading-relaxed text-mist-700">
              {s.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </details>
        ))}
      </div>
    </details>
  );
}