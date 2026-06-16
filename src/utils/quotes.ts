export interface Quote {
  text: string;
  author: string;
  category: string;
}

export const MOTIVATIONAL_QUOTES: Quote[] = [
  {
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain",
    category: "Action"
  },
  {
    text: "It always seems impossible until it's done.",
    author: "Nelson Mandela",
    category: "Perseverance"
  },
  {
    text: "Success is the sum of small efforts, repeated day in and day out.",
    author: "Robert Collier",
    category: "Consistency"
  },
  {
    text: "You don't have to be great to start, but you have to start to be great.",
    author: "Zig Ziglar",
    category: "Motivation"
  },
  {
    text: "Focus on being productive instead of busy.",
    author: "Tim Ferriss",
    category: "Focus"
  },
  {
    text: "There are no shortcuts to any place worth going.",
    author: "Beverly Sills",
    category: "Hard Work"
  },
  {
    text: "The expert in anything was once a beginner.",
    author: "Helen Hayes",
    category: "Growth"
  },
  {
    text: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt",
    category: "Mindset"
  },
  {
    text: "Strive for progress, not perfection.",
    author: "Unknown",
    category: "Action"
  },
  {
    text: "Your talent determines what you can do. Your motivation determines how much you are willing to do.",
    author: "Lou Holtz",
    category: "Attitude"
  },
  {
    text: "The beautiful thing about learning is that no one can take it away from you.",
    author: "B.B. King",
    category: "Education"
  },
  {
    text: "Today a reader, tomorrow a leader.",
    author: "Margaret Fuller",
    category: "Growth"
  }
];

export function getRandomQuote(): Quote {
  const index = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
  return MOTIVATIONAL_QUOTES[index];
}
