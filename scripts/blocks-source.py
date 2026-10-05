# Source for content/blocks/*.json. Original copy, drafted for owner review.
# Run: python3 scripts/blocks-source.py  (rewrites the JSON files)
import json, os

H = {
"love": {
1: ["The Moon lights up your own sign, so your feelings sit close to the surface. Let someone see the real you today. It is more attractive than any act.",
    "You feel more like yourself than you have all week. Lead with that ease. Someone notices how comfortable you are in your own skin.",
    "Today is about what you want, said plainly. If something in a relationship needs to change, you have the clarity to name it kindly."],
2: ["Small comforts speak loudly today. A shared meal or a thoughtful gesture says more than a big declaration.",
    "You may notice what you value in a partner more clearly now. Steadiness and kindness win over sparkle.",
    "Affection shows up in practical ways. Offer help without being asked, and notice who does the same for you."],
3: ["Conversation is your love language today. A light message or a long talk could shift something between you and someone special.",
    "Words come easily, so use them warmly. Ask a question you have been curious about and really listen to the answer.",
    "A playful exchange of messages sets the tone. Keep it light and let the conversation wander where it wants."],
4: ["Home feels like the heart of things today. Quiet time together means more than going out.",
    "Old feelings may surface, softly. Share a memory with someone close. It can bring you nearer to each other.",
    "You want to feel safe and settled. Say so. The right person will be glad to make room for that."],
5: ["Romance and fun are in the air. Say yes to something spontaneous, and let yourself be a little playful.",
    "Your warmth is easy to see today. Flirt a little, laugh a lot, and do not overthink it.",
    "A date, a game or a creative project shared with someone special could be the highlight of your day."],
6: ["Love lives in the small routines today. Making someone's day easier is its own kind of romance.",
    "Notice the everyday habits you share with a partner or friend. A tiny change could make both of you happier.",
    "Practical care counts. Cook, tidy or plan something together. Doing ordinary things side by side feels quietly close."],
7: ["Partnerships take centre stage. Meet people halfway and you may be surprised by how much they give back.",
    "One-to-one time matters most today. Give someone your full attention and the connection deepens.",
    "Today shows you how you work as a pair. Talk about what each of you needs, without keeping score."],
8: ["Feelings run deep today. A heartfelt conversation could build real trust between you and someone close.",
    "You may want more closeness than usual. Be honest about it, and let the other person meet you at their own pace.",
    "Something unspoken is ready to be shared. Choose a calm moment and say it gently."],
9: ["You are drawn to someone who widens your world. A conversation about big ideas can feel surprisingly romantic.",
    "Plan something new together, even if it is small. A different café or a new route home adds a little adventure.",
    "Curiosity is attractive today. Ask about someone's dreams and share one of your own."],
10: ["Your public life and your love life overlap a little today. Let a partner see what you are working toward.",
     "You may feel pulled between duty and affection. A short, sincere check-in keeps both sides happy.",
     "Respect is romantic today. Recognise what someone close has achieved, and say so out loud."],
11: ["Friendship and love blend nicely. Time with a group could bring a warm connection your way.",
     "Talk about the future with someone you care about. Shared hopes bring you closer.",
     "Easy, friendly energy suits you today. Keep plans relaxed and inclusive."],
12: ["You may want a little more privacy than usual. That is fine. Quiet closeness can be the most tender kind.",
     "Feelings are softer and harder to put into words today. Let actions do the talking.",
     "Take time to understand what you need before asking someone else for it. Clarity comes when you slow down."],
},
"career": {
1: ["You come across as confident and capable today. It is a good moment to put your own ideas forward.",
    "Take the lead on something you care about. People are ready to follow your direction.",
    "Fresh starts suit you now. Set one clear intention for your work and act on it."],
2: ["Focus on work that brings steady, practical results. Finishing one thing well beats starting three.",
    "You may see more clearly what your skills are worth. Let that quiet confidence guide how you present your work.",
    "A patient approach pays off today. Build on what is already working."],
3: ["Emails, calls and meetings go well today. Say what you mean clearly and you will be understood.",
    "A good day to write, pitch or explain. Your words land with more weight than usual.",
    "Short conversations open useful doors. Reach out to a colleague you have not spoken to in a while."],
4: ["Work may feel quieter, which gives you room to organise. Tidy your space and your plans.",
    "You may prefer working behind the scenes today. That is where the solid groundwork gets done.",
    "If you can, work somewhere comfortable. A calm setting helps you think things through."],
5: ["Creativity flows easily. Bring a playful idea to the table, even if it feels unusual.",
    "You enjoy your work more when you can put your own stamp on it. Look for that chance today.",
    "Let yourself experiment a little. A fresh approach could solve an old problem."],
6: ["Routine tasks go smoothly. Clear your to-do list and you will feel lighter by evening.",
    "Details matter today. Checking your work twice saves time later.",
    "A good day to improve how you work. One small change to your system can save hours this month."],
7: ["Teamwork is your strength today. Join forces with someone whose skills complement yours.",
    "A client, partner or colleague may need your attention. Listen first, then offer your view.",
    "Agreements and collaborations are favoured. Make sure everyone understands the plan."],
8: ["You may see what needs to change at work. Focus on what you can influence and let the rest settle.",
    "Shared projects need clear roles today. A frank, friendly talk clears the air.",
    "Look beneath the surface of a problem. The real cause is easier to fix than the symptoms."],
9: ["Learning something new gives your work fresh energy. A course, a book or a mentor could help.",
    "Think about the bigger picture. Where do you want your work to take you this year?",
    "Ideas from far away, or from a different field, could spark a useful solution."],
10: ["Your work is in the spotlight. Present your progress with quiet pride.",
     "A good day for goals. Take one concrete step toward something you want to achieve.",
     "People in charge may notice your effort. Keep doing steady, honest work."],
11: ["Networking feels natural today. A friendly chat could lead to something useful later.",
     "Group projects go well. Share credit generously and the whole team benefits.",
     "Think about where your work fits into your wider hopes. Small steps add up."],
12: ["You may prefer to work quietly and alone. Use the time to finish things and reflect.",
     "It is a good day to review rather than launch. Look back at what has worked so far.",
     "Rest your mind between tasks. The answer you need may come when you stop pushing."],
},
"money": {
1: ["You feel more in charge of your choices today. Think about what you truly want before you spend.",
    "Your personal style is calling, but the best purchase may be no purchase at all.",
    "A clear head helps with money matters. Make a simple plan for the week ahead."],
2: ["Money matters are in focus. Review your budget and notice where small amounts add up.",
    "It is a good day to think about what gives you real value, not just what is new.",
    "Steady habits beat quick wins. Keep an eye on everyday spending."],
3: ["Compare before you commit. A little research can save you more than you expect.",
    "Conversations about money go smoothly today. Ask the question you have been putting off.",
    "Paperwork and admin are easier than usual. Sort the small things while you can."],
4: ["Home costs may need attention. Sort out household plans calmly and early.",
    "Spending on comfort feels tempting. Choose what you will still enjoy next month.",
    "Family and money may overlap today. Keep conversations kind and clear."],
5: ["Treats are fine in moderation. Enjoy something small without guilt.",
    "Fun can be free. Look for pleasures that do not cost much.",
    "You may feel generous today. Give in a way that feels good and stays comfortable."],
6: ["Organise your accounts, receipts or bills. Order brings peace of mind.",
    "Everyday efficiency is your friend. One small saving repeated often makes a difference.",
    "A practical day for money. Tidy up the loose ends."],
7: ["Shared costs and agreements are in focus. Talk openly and keep things fair.",
    "A partner's view on money could be helpful. Listen with an open mind.",
    "Fair deals come from clear conversations. Agree on the details before you begin."],
8: ["Shared resources need care. Sort out who owes what, calmly and kindly.",
    "A good day to review long-term plans. Steady patience serves you best.",
    "Let go of an old money worry that no longer applies. Focus on what you can do today."],
9: ["Big plans need a budget. Dream freely, then add up the costs.",
    "Learning about money can be empowering. Read or ask before you decide.",
    "Travel or study costs may come up. Plan ahead and you will feel calmer."],
10: ["Your effort at work may connect to your income. Keep a record of what you achieve.",
     "Think long term today. Small, steady choices build security.",
     "Professional growth can be an investment in yourself. Consider what would help most."],
11: ["Group outings can add up. Suggest something everyone can afford.",
     "Your goals give your spending direction. Ask whether each purchase moves you closer.",
     "Friends may share a useful tip. Take what fits your situation and leave the rest."],
12: ["A quiet day for money. Avoid rushed decisions and wait for clarity.",
     "Notice any spending you do for comfort. Kind awareness is enough, no guilt needed.",
     "Reflect on what security means to you. Your answer may surprise you."],
},
"mood": {
1: ["You feel more like yourself today. Trust your instincts and take up a little more space.",
    "Energy is good and your mood is bright. Start something you have been meaning to do.",
    "Today is a good day to look after you first. A small act of self-care goes a long way."],
2: ["You crave calm and comfort. Slow down and enjoy simple pleasures.",
    "Steadiness suits you. A familiar routine helps you feel grounded.",
    "Notice what makes you feel secure, and give yourself a little more of it."],
3: ["Your mind is busy and curious. Write things down so ideas do not slip away.",
    "Chatting with others lifts your mood. Reach out to someone you enjoy talking to.",
    "A walk, a podcast or a good conversation helps you think clearly."],
4: ["You may feel more sensitive than usual. Be gentle with yourself.",
    "Home is your recharge station today. Spend time somewhere that feels safe.",
    "Old memories may visit. Let them pass through kindly."],
5: ["Your mood is playful and warm. Make time for something you love.",
    "Creative energy is high. Draw, write, cook or dance, just for the joy of it.",
    "Laughter comes easily today. Share it."],
6: ["A tidy space helps you feel calm. Small chores can be surprisingly satisfying.",
    "Simple routines steady your mood. Eat well, move a little and rest when you need to.",
    "You feel best when you are useful. Help someone with something small."],
7: ["Other people affect your mood more than usual. Choose company that feels kind.",
    "Balance is the theme. Give and receive in equal measure.",
    "A good chat with someone you trust leaves you feeling lighter."],
8: ["Your feelings run deep today. Give yourself room to process them.",
    "A good day to let go of something that no longer serves you.",
    "You may feel intense. Channel it into something focused and meaningful."],
9: ["Restlessness is a sign you want something new. Explore an idea, a place or a book.",
    "You feel optimistic. Let that hopeful mood carry you.",
    "Big questions are on your mind. Write down what you would like to learn."],
10: ["You feel driven. Use that energy wisely and remember to pause.",
     "A sense of purpose lifts your mood. Notice how far you have come.",
     "Pressure may feel higher. Take things one step at a time."],
11: ["Friendly energy lifts you up. Reach out to your people.",
     "You feel hopeful about the future. Dream a little.",
     "Being part of something bigger feels good today."],
12: ["You need more quiet than usual. Honour it.",
     "A reflective mood suits you. Journal, rest or simply be still.",
     "Recharge today so you can shine tomorrow."],
},
}

PHASE = {
"love": {
 "new": ["The new Moon favours fresh starts in matters of the heart.", "A quiet new Moon is a good time to set an intention for your relationships."],
 "waxing": ["The growing Moon supports building trust step by step.", "Momentum builds as the Moon grows. Small efforts in love add up."],
 "full": ["The full Moon can make feelings stronger. Pause before you react.", "Under the full Moon, something in a relationship becomes clear."],
 "waning": ["The waning Moon helps you release old hurts.", "As the Moon wanes, let go of expectations that weigh on you."],
},
"career": {
 "new": ["The new Moon is a good moment to plan a new project.", "Set one clear work goal while the Moon is new."],
 "waxing": ["The growing Moon supports steady progress on your plans.", "Keep building. The waxing Moon rewards consistent effort."],
 "full": ["The full Moon may bring a project to a finish line.", "Results become visible under the full Moon. Notice what is working."],
 "waning": ["The waning Moon is ideal for tidying up and finishing.", "Wrap up loose ends while the Moon wanes."],
},
"money": {
 "new": ["The new Moon is a good time to start a savings habit.", "Begin a fresh budget while the Moon is new."],
 "waxing": ["Steady habits grow stronger as the Moon waxes.", "Small, regular choices gather strength with the growing Moon."],
 "full": ["The full Moon may tempt you to overspend. Sleep on big decisions.", "Under the full Moon, take stock before you commit."],
 "waning": ["The waning Moon favours trimming what you no longer need.", "Clear out an old subscription or habit as the Moon wanes."],
},
"mood": {
 "new": ["The new Moon invites a quiet reset.", "Begin again, gently, under the new Moon."],
 "waxing": ["Your energy grows with the Moon.", "The waxing Moon brings a gradual lift."],
 "full": ["The full Moon can stir strong emotions. Breathe and stay present.", "Feelings peak with the full Moon. Be kind to yourself."],
 "waning": ["The waning Moon supports rest and release.", "Let things slow down as the Moon wanes."],
},
}

RETRO = {
 "mercury": {"topics": ["career", "money"], "text": ["Mercury is retrograde, so double-check messages and plans.", "With Mercury retrograde, review before you send or sign."]},
 "venus": {"topics": ["love", "money"], "text": ["Venus is retrograde, a good time to reflect on what you value.", "With Venus retrograde, revisit rather than rush in matters of the heart."]},
 "mars": {"topics": ["mood", "career"], "text": ["Mars is retrograde, so pace yourself and avoid needless conflict.", "With Mars retrograde, steady effort beats forcing things."]},
}

ELEMENT = {
 "fire": ["The Moon in a fire sign adds warmth and courage.", "Fire-sign energy from the Moon gives you a spark."],
 "earth": ["The Moon in an earth sign keeps you grounded.", "Earth-sign energy from the Moon favours practical steps."],
 "air": ["The Moon in an air sign makes ideas flow.", "Air-sign energy from the Moon helps you connect."],
 "water": ["The Moon in a water sign deepens feelings.", "Water-sign energy from the Moon invites empathy."],
}

out = os.path.join(os.path.dirname(__file__), "..", "content", "blocks")
os.makedirs(out, exist_ok=True)
for topic, houses in H.items():
    blocks = []
    for house, texts in houses.items():
        for i, t in enumerate(texts):
            blocks.append({"id": f"{topic}-h{house}-{i+1:02d}", "topic": topic, "kind": "base", "conditions": {"house": [house]}, "tone": "warm", "text": t})
    for phase, texts in PHASE[topic].items():
        for i, t in enumerate(texts):
            blocks.append({"id": f"{topic}-phase-{phase}-{i+1:02d}", "topic": topic, "kind": "modifier", "conditions": {"moonPhase": [phase]}, "tone": "warm", "text": t})
    for planet, spec in RETRO.items():
        if topic in spec["topics"]:
            for i, t in enumerate(spec["text"]):
                blocks.append({"id": f"{topic}-retro-{planet}-{i+1:02d}", "topic": topic, "kind": "modifier", "conditions": {"retrograde": [planet]}, "tone": "warm", "text": t})
    if topic == "mood":
        for el, texts in ELEMENT.items():
            for i, t in enumerate(texts):
                blocks.append({"id": f"mood-element-{el}-{i+1:02d}", "topic": "mood", "kind": "modifier", "conditions": {"moonElement": [el]}, "tone": "warm", "text": t})
    # English only (2026-10-05): blocks carry no text_km.
    target = os.path.join(out, f"{topic}.json")
    with open(target, "w") as f:
        json.dump(blocks, f, ensure_ascii=False, indent=1)
        f.write("\n")
    print(topic, len(blocks))
