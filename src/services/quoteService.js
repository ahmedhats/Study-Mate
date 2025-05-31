const mockQuotes = [
    {
        content: "Stay positive, work hard, make it happen.",
        author: "Unknown",
        _id: "1"
    },
    {
        content: "Success is not the key to happiness. Happiness is the key to success.",
        author: "Albert Schweitzer",
        _id: "2"
    },
    {
        content: "The only way to do great work is to love what you do.",
        author: "Steve Jobs",
        _id: "3"
    },
    {
        content: "Believe you can and you're halfway there.",
        author: "Theodore Roosevelt",
        _id: "4"
    },
    {
        content: "You are never too old to set another goal or to dream a new dream.",
        author: "C.S. Lewis",
        _id: "5"
    },
    {
        content: "All our dreams can come true, if we have the courage to pursue them.",
        author: "Walt Disney",
        _id: "6"
    },
    {
        content: "The secret of getting ahead is getting started.",
        author: "Mark Twain",
        _id: "7"
    },
    {
        content: "I've missed more than 9,000 shots in my career. I've lost almost 300 games. 26 times I've been trusted to take the game winning shot and missed. I've failed over and over and over again in my life and that is why I succeed.",
        author: "Michael Jordan",
        _id: "8"
    },
    {
        content: "Don't limit yourself. Many people limit themselves to what they think they can do. You can go as far as your mind lets you. What you believe, remember, you can achieve.",
        author: "Mary Kay Ash",
        _id: "9"
    },
    {
        content: "The best time to plant a tree was 20 years ago. The second best time is now.",
        author: "Chinese Proverb",
        _id: "10"
    },
    {
        content: "Only the paranoid survive.",
        author: "Andy Grove",
        _id: "11"
    },
    {
        content: "It's hard to beat a person who never gives up.",
        author: "Babe Ruth",
        _id: "12"
    },
    {
        content: "I wake up every morning and think to myself, 'how far can I push this company in the next 24 hours.'",
        author: "Leah Busque",
        _id: "13"
    },
    {
        content: "If people are doubting how far you can go, go so far that you can't hear them anymore.",
        author: "Michele Ruiz",
        _id: "14"
    },
    {
        content: "We need to accept that we won't always make the right decisions, that we'll screw up royally sometimes.",
        author: "Arianna Huffington",
        _id: "15"
    },
    {
        content: "Write it. Shoot it. Publish it. Crochet it, sauté it, whatever. MAKE.",
        author: "Joss Whedon",
        _id: "16"
    },
    {
        content: "Some people want it to happen, some wish it would happen, others make it happen.",
        author: "Michael Jordan",
        _id: "17"
    },
    {
        content: "Great things are done by a series of small things brought together.",
        author: "Vincent Van Gogh",
        _id: "18"
    },
    {
        content: "If you want to lift yourself up, lift up someone else.",
        author: "Booker T. Washington",
        _id: "19"
    },
    {
        content: "Do what you can, with what you have, where you are.",
        author: "Theodore Roosevelt",
        _id: "20"
    },
    {
        content: "Life isn't about getting and having, it's about giving and being.",
        author: "Kevin Kruse",
        _id: "21"
    },
    {
        content: "Whatever the mind of man can conceive and believe, it can achieve.",
        author: "Napoleon Hill",
        _id: "22"
    },
    {
        content: "Strive not to be a success, but rather to be of value.",
        author: "Albert Einstein",
        _id: "23"
    },
    {
        content: "I attribute my success to this: I never gave or took any excuse.",
        author: "Florence Nightingale",
        _id: "24"
    },
    {
        content: "You miss 100% of the shots you don't take.",
        author: "Wayne Gretzky",
        _id: "25"
    },
    {
        content: "I've missed more than 9000 shots in my career. I've lost almost 300 games. 26 times, I've been trusted to take the game-winning shot and missed.",
        author: "Michael Jordan",
        _id: "26"
    },
    {
        content: "The most difficult thing is the decision to act, the rest is merely tenacity.",
        author: "Amelia Earhart",
        _id: "27"
    },
    {
        content: "Every strike brings me closer to the next home run.",
        author: "Babe Ruth",
        _id: "28"
    },
    {
        content: "Definiteness of purpose is the starting point of all achievement.",
        author: "W. Clement Stone",
        _id: "29"
    },
    {
        content: "We must balance conspicuous consumption with conscious capitalism.",
        author: "Kevin Kruse",
        _id: "30"
    },
    {
        content: "Life is what happens to you while you're busy making other plans.",
        author: "John Lennon",
        _id: "31"
    },
    {
        content: "We become what we think about.",
        author: "Earl Nightingale",
        _id: "32"
    },
    {
        content: "The mind is everything. What you think you become.",
        author: "Buddha",
        _id: "33"
    },
    {
        content: "An unexamined life is not worth living.",
        author: "Socrates",
        _id: "34"
    },
    {
        content: "Your time is limited, so don't waste it living someone else's life.",
        author: "Steve Jobs",
        _id: "35"
    },
    {
        content: "Winning isn't everything, but wanting to win is.",
        author: "Vince Lombardi",
        _id: "36"
    },
    {
        content: "Twenty years from now you will be more disappointed by the things that you didn't do than by the ones you did do.",
        author: "Mark Twain",
        _id: "37"
    },
    {
        content: "Life is 10% what happens to me and 90% of how I react to it.",
        author: "Charles Swindoll",
        _id: "38"
    },
    {
        content: "The most common way people give up their power is by thinking they don't have any.",
        author: "Alice Walker",
        _id: "39"
    },
    {
        content: "Eighty percent of success is showing up.",
        author: "Woody Allen",
        _id: "40"
    }
];

export const fetchRandomQuote = async () => {
    // Simulate network delay for UX
    await new Promise((resolve) => setTimeout(resolve, 400));
    const random = mockQuotes[Math.floor(Math.random() * mockQuotes.length)];
    return random;
};
