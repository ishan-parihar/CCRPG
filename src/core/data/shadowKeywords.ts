/**
 * Shadow keyword data — shared between CLI and WebUI via the AgenticOrchestrator.
 * ponytail: E — extracted from AgenticOrchestrator.ts (was 41 LOC of inline arrays).
 * Used for keyword-based shadow detection when the LLM doesn't return a shadow signal.
 */
export const SHADOW_KEYWORDS = {
  darkAddiction: [
    'attack', 'dominate', 'crush', 'enslave', 'destroy', 'conquer',
    'prove myself', 'beneath me', 'weakness', 'force', 'control', 'punish',
    'prove i', 'show them', 'better than', 'deserve', 'entitled',
    'i must win', 'defeat them', 'assert myself', 'take what', 'i deserve more',
    'no one tells me', 'i will not be controlled', 'my way or', 'crush them',
    'power over', 'eliminate the', 'crush all', 'dominate everything',
    'prove superiority', 'make them pay', 'zero tolerance', 'show no mercy',
  ],
  darkAversion: [
    'withdraw', 'resist', 'refuse', 'flee', 'avoid', 'ignore',
    'not worth', 'pointless', 'give up', "can't be bothered", 'not my problem',
    "don't care", 'whatever', 'numb',
    'whats the point', 'nothing matters', 'cant be fixed', 'why bother',
    'i dont want to', 'leave me alone', 'not my responsibility', 'someone else',
    'just leave it', 'not worth the effort', 'too tired', 'cant be bothered',
    'the world is broken', 'nothing will change', 'helpless', 'overwhelmed',
    'i shut down', 'turn off', 'cant feel', 'empty inside',
  ],
  goldenAddiction: [
    'transcend', 'bypass', 'enlighten', 'skip', 'higher self',
    "it's all good", 'everything happens', 'love and light', 'just positive',
    'no negative', 'spiritual', 'already awakened', 'beyond this', 'dissolve',
    'non-dual', 'pure awareness',
    'i must transcend', 'rise above', 'i am already', 'no need to', 'just let go',
    'all is illusion', 'none of this is real', 'i have evolved', 'beyond ego',
    'i am beyond', 'already enlightened', 'no suffering here', 'only love exists',
    'detach from', 'rising above', 'higher consciousness will', 'the ego is',
    'i am not this body', 'pure spirit', 'merge with the infinite',
  ],
  goldenAllergy: [
    'stay', 'safe', 'comfortable', 'never change', 'fine as i am',
    "don't need", 'good enough', 'why change', 'not ready', 'too much',
    'not now', 'later', 'tomorrow',
    'im fine the way', 'no need to grow', 'why would i change', 'perfectly fine',
    'good where i am', 'dont need help', 'no room to grow', 'already complete',
    'not the right time', 'too overwhelming', 'cant handle more', 'too much change',
    'i like how things', 'why fix what', 'not interested', 'too scary',
    'id rather not', 'the way i am', 'cant change me', 'wont work for me',
  ],
} as const;
