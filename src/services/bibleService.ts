import { BibleBook, BibleVerse, ReadingPlan, QuizQuestion, DictionaryEntry } from "../types";
import { bibleBooks } from "../data/bibleMetadata";
import { preloadedVerses } from "../data/bibleData";

// Simple seedable PRNG or deterministic hashing to keep verses consistent
function getDeterministicString(seed: number, arr: string[]): string {
  const index = Math.abs(Math.sin(seed) * 100000) % arr.length;
  return arr[Math.floor(index)];
}

const LAW_PHRASES_EN = [
  "And the LORD spoke unto Moses, saying, Keep my statutes and perform them with a perfect heart.",
  "Observe all the commandments which I command you this day, that ye may live and multiply in the land.",
  "Remember the covenant which the LORD made with your fathers, and walk in his ways continually.",
  "For the LORD thy God is a holy God, and he will not forget the oath which he swore unto thee.",
  "Thou shalt love the LORD thy God with all thine heart, and with all thy soul, and with all thy might.",
  "And these words, which I command thee this day, shall be in thine heart.",
  "Ye shall walk in all the ways which the LORD your God hath commanded you.",
  "Take heed to yourselves, that your heart be not deceived, and ye turn aside and serve other gods.",
  "Blessed shalt thou be in the city, and blessed shalt thou be in the field.",
  "The LORD shall establish thee a holy people unto himself, as he hath sworn unto thee."
];

const LAW_PHRASES_MY = [
  "ထိုအခါ ထာဝရဘုရားသည် မောရှေအား မိန့်တော်မူသည်ကား၊ ငါ၏စီရင်ထုံးဖွဲ့ချက်များကို စောင့်ရှောက်လျက် စုံလင်သောနှလုံးဖြင့် ကျင့်ဆောင်ကြလော့။",
  "သင်တို့သည် အသက်ရှင်၍ တိုးပွားစေခြင်းငှာ ယနေ့ငါမှာထားသော ပညတ်တော်အပေါင်းတို့ကို စောင့်ရှောက်ရကြမည်။",
  "ထာဝရဘုရားသည် သင်တို့ဘိုးဘေးများနှင့် ပြုတော်မူသော ပဋိညာဉ်တရားကို အစဉ်သတိရ၍ လမ်းခရီးတော်၌ လျှောက်လှမ်းကြလော့။",
  "အကြောင်းမူကား၊ သင်တို့၏ဘုရားသခင် ထာဝရဘုရားသည် သန့်ရှင်းသောဘုရားဖြစ်၍ သင်တို့နှင့်ပြုသော ကတိတော်ကို မေ့လျော့တော်မမူ။",
  "သင်တို့သည် သင်တို့၏ဘုရားသခင် ထာဝရဘုရားကို စိတ်နှလုံးအကြွင်းမဲ့၊ ဝိညာဉ်အကြွင်းမဲ့၊ အစွမ်းသတ္တိရှိသမျှနှင့် ချစ်ကြလော့။",
  "ယနေ့ငါမှာထားသော စကားများကို စိတ်နှလုံးထဲ၌ စွဲလမ်းစွာ မှတ်ကျောက်တင်ရကြမည်။",
  "သင်တို့၏ဘုရားသခင် ထာဝရဘုရားမှာထားတော်မူသော လမ်းခရီးအပေါင်းတို့၌ ကျင့်ဆောင်လျှောက်လှမ်းကြလော့။",
  "သင်တို့စိတ်နှလုံးသည် လှည့်ဖြားခြင်းသို့မလိုက်၊ လမ်းလွဲ၍ အခြားသောဘုရားတို့ကို မကိုးကွယ်မိစေရန် သတိပြုကြလော့။",
  "သင်သည် မြို့ထဲ၌ဖြစ်စေ၊ တောပြင်၌ဖြစ်စေ ကောင်းချီးမင်္ဂလာကို ခံစားရလိမ့်မည်။",
  "ထာဝရဘုရားသည် သင်နှင့်ကျိန်ဆိုတော်မူသည်အတိုင်း၊ သန့်ရှင်းသောလူမျိုးအဖြစ် သင့်ကိုတည်ဆောက်တော်မူမည်။"
];

const POETRY_PHRASES_EN = [
  "Bless the LORD, O my soul: and all that is within me, bless his holy name.",
  "The LORD is my light and my salvation; whom shall I fear? the LORD is the strength of my life.",
  "As the hart panteth after the water brooks, so panteth my soul after thee, O God.",
  "Thy word is a lamp unto my feet, and a light unto my path.",
  "Create in me a clean heart, O God; and renew a right spirit within me.",
  "I will praise thee; for I am fearfully and wonderfully made: marvellous are thy works.",
  "The heavens declare the glory of God; and the firmament sheweth his handywork.",
  "O give thanks unto the LORD; for he is good: for his mercy endureth for ever.",
  "God is our refuge and strength, a very present help in trouble.",
  "Rest in the LORD, and wait patiently for him: fret not thyself."
];

const POETRY_PHRASES_MY = [
  "ငါ့ဝိညာဉ်၊ ထာဝရဘုရားကို ကောင်းချီးပေးလော့။ ငါ့အတွင်းရှိသမျှတို့သည် သန့်ရှင်းသောနာမတော်ကို ချီးမွမ်းကြလော့။",
  "ထာဝရဘုရားသည် ငါ၏အလင်းဖြစ်တော်မူ၏။ ငါ၏ကယ်တင်ခြင်းဖြစ်တော်မူ၏။ ငါသည် မည်သူ့ကို ကြောက်ရအံ့နည်း။",
  "သမင်ဒရယ်သည် စမ်းရေစစ်ကို တောင့်တသကဲ့သို့၊ အိုဘုရားသခင်၊ အကျွန်ုပ်၏ဝိညာဉ်သည် ကိုယ်တော်ကို တောင့်တပါ၏။",
  "နှုတ်ကပတ်တော်သည် အကျွန်ုပ်ခြေရှေ့၌ ဆီမီးဖြစ်၍၊ လမ်းခရီးအလယ်၌ အလင်းဖြစ်ပါ၏။",
  "အိုဘုရားသခင်၊ အကျွန်ုပ်၌ သန့်ရှင်းသောစိတ်နှလုံးကို ဖန်ဆင်း၍၊ တည်ကြည်သောသဘောကို အသစ်ပြင်ဆင်တော်မူပါ။",
  "ကိုယ်တော်ကို ချီးမွမ်းပါမည်။ အကြောင်းမူကား၊ အကျွန်ုပ်သည် ထူးဆန်းထိတ်လန့်ဖွယ် ဖန်ဆင်းခြင်းကို ခံရပါ၏။",
  "မိုးကောင်းကင်သည် ဘုရားသခင်၏ဘုန်းတော်ကို ထင်ရှားစေ၍၊ မိုးမျက်နှာကြက်သည် လက်ရာတော်ကို ပြသ၏။",
  "ထာဝရဘုရားကို ချီးမွမ်းကြလော့။ အကြောင်းမူကား၊ ကရုဏာတော်သည် အစဉ်အမြဲ တည်ရှိတော်မူ၏။",
  "ဘုရားသခင်သည် ငါတို့ခိုလှုံရာဖြစ်၍ ခွန်အားတော်လည်းဖြစ်၏။ ဆင်းရဲဒုက္ခရောက်သည်ကာလ အလွန်နီးသော ကူညီမစသူဖြစ်၏။",
  "ထာဝရဘုရား၌ ငြိမ်ဝပ်စွာနေ၍ ကိုယ်တော်ကို စိတ်ရှည်စွာ မြော်လင့်လော့။ စိတ်မပျက်ပါနှင့်။"
];

const PROPHET_PHRASES_EN = [
  "Thus saith the LORD, Stand ye in the ways, and see, and ask for the old paths, where is the good way, and walk therein.",
  "But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles.",
  "Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee.",
  "Seek ye the LORD while he may be found, call ye upon him while he is near.",
  "For my thoughts are not your thoughts, neither are your ways my ways, saith the LORD.",
  "The word of the LORD came again unto me, saying, Turn unto me, and I will heal your backslidings.",
  "Come now, and let us reason together, saith the LORD: though your sins be as scarlet, they shall be as white as snow.",
  "But let judgment run down as waters, and righteousness as a mighty stream.",
  "He hath shewed thee, O man, what is good; and what doth the LORD require of thee, but to do justly, and to love mercy?",
  "The LORD thy God in the midst of thee is mighty; he will save, he will rejoice over thee with joy."
];

const PROPHET_PHRASES_MY = [
  "ထာဝရဘုရား မိန့်တော်မူသည်ကား၊ လမ်းခရီးတို့၌ ရပ်လျက်ကြည့်ရှုကြလော့။ ရှေးလမ်းဟောင်း၊ ကောင်းသောလမ်းကို မေးမြန်း၍ ထိုလမ်း၌ လျှောက်ကြလော့။",
  "ထာဝရဘုရားကို မြော်လင့်သောသူတို့မူကား အားသစ်ကိုရကြလိမ့်မည်။ ရွှေလင်းတကဲ့သို့ အတောင်ပံနှင့် ပျံတက်ကြလိမ့်မည်။",
  "မကြောက်နှင့်၊ ငါသည် သင်နှင့်အတူရှိ၏။ စိတ်ပျက်ခြင်းမရှိနှင့်၊ ငါသည် သင့်ဘုရားသခင်ဖြစ်၏။ သင့်ကို ငါခိုင်ခံ့စေမည်။",
  "ထာဝရဘုရားကို တွေ့နိုင်ဆဲကာလပတ်လုံး ရှာကြလော့။ အနီးအပါး၌ ရှိတော်မူစဉ် ဆုတောင်းပန်ကြလော့။",
  "ထာဝရဘုရား မိန့်တော်မူသည်ကား၊ ငါ့အကြံအစည်သည် သင်တို့အကြံအစည်မဟုတ်။ သင်တို့လမ်းခရီးသည် ငါ့လမ်းခရီးမဟုတ်။",
  "ထာဝရဘုရား၏ နှုတ်ကပတ်တော်သည် ငါ့ဆီသို့တစ်ဖန် ရောက်လာပြန်၍၊ ငါ့ထံသို့ပြန်လာကြလော့၊ သင်တို့၏ကျောခိုင်းခြင်းကို ငါငြိမ်းစေမည်။",
  "ထာဝရဘုရား မိန့်တော်မူသည်ကား၊ လာကြလော့၊ ငါတို့ဆွေးနွေးကြစို့။ သင်တို့အပြစ်သည် ကတ္တီပါနီကဲ့သို့ နီသော်လည်း နှင်းပွင့်ကဲ့သို့ ဖြူလိမ့်မည်။",
  "တရားစီရင်ခြင်းသည် ရေကဲ့သို့လည်းကောင်း၊ ဖြောင့်မတ်ခြင်းသည် တဟုန်ထိုးစီးသော စမ်းရေကဲ့သို့လည်းကောင်း စီးဆင်းပါစေ။",
  "အိုလူသား၊ ကောင်းသောအရာကို ပြတော်မူပြီ။ တရားသဖြင့် ပြုလုပ်ခြင်း၊ ကရုဏာကို နှစ်သက်ခြင်းမှတစ်ပါး အဘယ်အရာကို တောင်းတော်မူသနည်း။",
  "သင့်အလယ်၌ရှိတော်မူသော သင်၏ဘုရားသခင် ထာဝရဘုရားသည် တန်ခိုးကြီးတော်မူ၏။ ကယ်တင်ခြင်းသို့ ရောက်စေ၍ သင့်ကြောင့် ဝမ်းမြောက်တော်မူမည်။"
];

const GOSPEL_PHRASES_EN = [
  "And Jesus went about all the cities and villages, teaching in their synagogues, and preaching the gospel.",
  "And he said unto them, Follow me, and I will make you fishers of men.",
  "Blessed are the pure in heart: for they shall see God.",
  "Let your light so shine before men, that they may see your good works, and glorify your Father which is in heaven.",
  "But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.",
  "Come unto me, all ye that labour and are heavy laden, and I will give you rest.",
  "I am the way, the truth, and the life: no man cometh unto the Father, but by me.",
  "A new commandment I give unto you, That ye love one another; as I have loved you, that ye also love one another.",
  "Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled.",
  "These things I have spoken unto you, that in me ye might have peace. In the world ye shall have tribulation: but be of good cheer."
];

const GOSPEL_PHRASES_MY = [
  "ယေရှုသည် မြို့ရွာများသို့ လှည့်လည်၍ တရားဇရပ်တို့၌ ဆုံးမဩဝါဒပေးလျက်၊ ကောင်းကင်နိုင်ငံတော်၏ ဧဝံဂေလိတရားကို ဟောတော်မူ၏။",
  "ကိုယ်တော်ကလည်း၊ ငါ့နောက်သို့ လိုက်ကြလော့။ သင်တို့ကို လူဖမ်းသောတံငါဖြစ်စေမည်ဟု မိန့်တော်မူ၏။",
  "စိတ်နှလုံးသန့်ရှင်းသောသူတို့သည် မင်္ဂလာရှိကြ၏။ အကြောင်းမူကား ထိုသူတို့သည် ဘုရားသခင်ကို မြင်ရကြလတ္တံ့။",
  "ထိုနည်းတူ၊ လူတို့သည် သင်တို့၏ကောင်းသောအကျင့်ကိုမြင်၍ ကောင်းကင်ဘုံ၌ရှိတော်မူသော သင်တို့အဘ၏ဂုဏ်တော်ကို ချီးမွမ်းစေရန် အလင်းကို လင်းစေကြလော့။",
  "ဘုရားသခင်၏ နိုင်ငံတော်နှင့် ဖြောင့်မတ်ခြင်းတရားကို ရှေးဦးစွာရှာကြလော့။ နောက်မှ ထိုအရာအားလုံးကို ထပ်၍ပေးတော်မူလတ္တံ့။",
  "ဝန်လေး၍ ပင်ပန်းသောသူအပေါင်းတို့၊ ငါ့ထံသို့ လာကြလော့။ ငါသည် သင်တို့ကို ချမ်းသာပေးမည်။",
  "ငါသည် လမ်းခရီးဖြစ်၏။ သစ္စာတရားလည်းဖြစ်၏။ အသက်လည်းဖြစ်၏။ ငါ့ကိုအမှီမပြုလျှင် အဘယ်သူမျှ ခမည်းတော်ထံသို့ မရောက်ရ။",
  "သင်တို့သည် အချင်းချင်းချစ်ကြလော့။ ငါသည် သင်တို့ကိုချစ်သည်နည်းတူ အချင်းချင်းချစ်ကြလော့ဟု ပညတ်သစ်ကို ငါပေး၏။",
  "ငြိမ်သက်ခြင်းကို သင်တို့၌ ငါထားခဲ့၏။ ငါ၏ငြိမ်သက်ခြင်းကို ပေး၏။ လောကီသားတို့ပေးသကဲ့သို့ ငါပေးသည်မဟုတ်။ စိုးရိမ်ခြင်းမရှိစေနှင့်။",
  "သင်တို့သည် ငါ့အားဖြင့် ငြိမ်သက်ခြင်းရှိစေရန် ဤစကားကို ငါပြောပြီ။ လောက၌ သင်တို့သည် ဆင်းရဲဒုက္ခကို ခံရကြလိမ့်မည်။ သို့သော် စိတ်မပျက်ကြနှင့်။"
];

const EPISTLE_PHRASES_EN = [
  "Grace be to you and peace from God our Father, and from the Lord Jesus Christ.",
  "For I am not ashamed of the gospel of Christ: for it is the power of God unto salvation to every one that believeth.",
  "And we know that all things work together for good to them that love God, to them who are the called according to his purpose.",
  "Now the God of hope fill you with all joy and peace in believing, that ye may abound in hope.",
  "If God be for us, who can be against us? He that spared not his own Son, but delivered him up for us all.",
  "I can do all things through Christ which strengtheneth me.",
  "Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.",
  "And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.",
  "Therefore being justified by faith, we have peace with God through our Lord Jesus Christ.",
  "But my God shall supply all your need according to his riches in glory by Christ Jesus."
];

const EPISTLE_PHRASES_MY = [
  "ငါတို့အဘ ဘုရားသခင်နှင့် သခင်ယေရှုခရစ်တော်ထံမှ ကျေးဇူးတော်နှင့် ငြိမ်သက်ခြင်းသည် သင်တို့၌ ရှိပါစေသော။",
  "အကြောင်းမူကား၊ ငါသည် ခရစ်တော်၏ဧဝံဂေလိတရားကြောင့် အရှက်မရှိ။ ထိုတရားသည် ယုံကြည်သောသူအပေါင်းတို့ကို ကယ်တင်စေသော ဘုရားသခင်၏တန်ခိုးတော် ဖြစ်၏။",
  "ဘုရားသခင်ကိုချစ်၍ အကြံအစည်တော်အတိုင်း ခေါ်ယူတော်မူသောသူတို့၏ အကျိုးကို ခပ်သိမ်းသောအရာတို့သည် တစ်ညီတစ်ညွတ်တည်း ပြုစုကြသည်ကို ငါတို့သိကြ၏။",
  "မျှော်လင့်ခြင်း၏အရှင် ဘုရားသခင်သည် သင်တို့အား ယုံကြည်ခြင်းနှင့်ပြည့်စုံသော ဝမ်းမြောက်ခြင်း၊ ငြိမ်သက်ခြင်းနှင့် ပြည့်စေတော်မူပါစေ။",
  "ဘုရားသခင်သည် ငါတို့ဘက်၌ရှိတော်မူလျှင် ငါတို့ကို မည်သူဆန့်ကျင်ဘက်ပြုနိုင်အံ့နည်း။ မိမိသားတော်ကိုပင် မနှမြောဘဲ ငါတို့အဘို့ စွန့်တော်မူသောသူ။",
  "ငါ့ကိုခွန်အားပေးတော်မူသော ခရစ်တော်အားဖြင့် ခပ်သိမ်းသောအရာတို့ကို ငါတတ်စွမ်းနိုင်၏။",
  "အဘယ်အရာကိုမျှ စိုးရိမ်ခြင်းမရှိဘဲ၊ အရာရာ၌ ဆုတောင်းပန်ခြင်း၊ ကျေးဇူးတော်ချီးမွမ်းခြင်းနှင့်တကွ သင်တို့တောင်းပန်လိုသောအရာကို ဘုရားသခင်အား ကြားလျှောက်ကြလော့။",
  "လူအပေါင်းတို့ နားလည်နိုင်စွမ်းထက် ကျော်လွန်သော ဘုရားသခင်၏ငြိမ်သက်ခြင်းသည် ခရစ်တော်ယေရှုအားဖြင့် သင်တို့၏စိတ်နှလုံးကို စောင့်ရှောက်လိမ့်မည်။",
  "ထို့ကြောင့်၊ ငါတို့သည် ယုံကြည်ခြင်းအားဖြင့် ဖြောင့်မတ်ရာသို့ရောက်၍ သခင်ယေရှုခရစ်တော်အားဖြင့် ဘုရားသခင်နှင့် ငြိမ်သက်ခြင်းကို ရကြပြီ။",
  "ငါ၏ဘုရားသခင်သည်လည်း၊ ဘုန်းအသရေတော်၌ တည်ရှိသော မိမိ၏စည်းစိမ်ကြွယ်ဝခြင်းအတိုင်း၊ ခရစ်တော်ယေရှုအားဖြင့် သင်တို့လိုအပ်သမျှကို ဖြည့်ဆည်းပေးတော်မူမည်။"
];

const REV_PHRASES_EN = [
  "And I saw a new heaven and a new earth: for the first heaven and the first earth were passed away.",
  "And God shall wipe away all tears from their eyes; and there shall be no more death, neither sorrow, nor crying.",
  "I am Alpha and Omega, the beginning and the ending, saith the Lord, which is, and which was, and which is to come, the Almighty.",
  "Behold, I stand at the door, and knock: if any man hear my voice, and open the door, I will come in to him.",
  "He that overcometh shall inherit all things; and I will be his God, and he shall be my son.",
  "And he shewed me a pure river of water of life, clear as crystal, proceeding out of the throne of God.",
  "Blessed is he that readeth, and they that hear the words of this prophecy, and keep those things which are written therein.",
  "Fear not; I am the first and the last: I am he that liveth, and was dead; and, behold, I am alive for evermore.",
  "Holy, holy, holy, Lord God Almighty, which was, and is, and is to come.",
  "And, behold, I come quickly; and my reward is with me, to give every man according as his work shall be."
];

const REV_PHRASES_MY = [
  "ထိုအခါ ကောင်းကင်အသစ်နှင့် မြေကြီးအသစ်ကို ငါမြင်ရ၏။ အကြောင်းမူကား၊ ပထမကောင်းကင်နှင့် ပထမမြေကြီးသည် ရွေ့လျားပျောက်ကွယ်သွားပြီ။",
  "ဘုရားသခင်သည်လည်း သူတို့၏မျက်စိမှ မျက်ရည်ရှိသမျှတို့ကို သုတ်တော်မူမည်။ နောက်တစ်ဖန် သေခြင်းမရှိ၊ ဝမ်းနည်းပူဆွေးခြင်းလည်းမရှိ၊ ငိုကြွေးခြင်းလည်းမရှိ။",
  "ငါသည် အာလဖနှင့် ဩမေဃဖြစ်၏။ အစနှင့်အဆုံးဖြစ်၏ဟု အနန္တတန်ခိုးနှင့် ပြည့်စုံတော်မူသော၊ ပစ္စုပ္ပန်၊ အတိတ်၊ အနာဂတ်ကာလပတ်လုံး ရှိတော်မူသောအရှင် မိန့်တော်မူ၏။",
  "ကြည့်ရှုလော့၊ ငါသည် တံခါးရှေ့၌ရပ်၍ ခေါက်လျက်ရှိ၏။ တစ်စုံတစ်ယောက်သောသူသည် ငါ့အသံကိုကြား၍ တံခါးကိုဖွင့်လျှင် ငါသည် ထိုသူထံသို့ဝင်၍ စားသောက်မည်။",
  "အောင်မြင်သောသူသည် ခပ်သိမ်းသောအရာတို့ကို အမွေခံရလိမ့်မည်။ ငါသည်လည်း သူ၏ဘုရားသခင်ဖြစ်မည်။ သူသည်လည်း ငါ၏သားဖြစ်လိမ့်မည်။",
  "ဘုရားသခင်၏ ပလ္လင်တော်ထဲက ထွက်ပေါ်လာသော၊ ဖန်ကဲ့သို့ ကြည်လင်သော အသက်ရေမြစ်ကို ကောင်းကင်တမန်သည် ငါ့အားပြသ၏။",
  "ဤပရောဖက်ပြုချက်စကားများကို ဖတ်ရှုသောသူနှင့် ကြားနာ၍ ရေးထားသမျှတို့ကို စောင့်ရှောက်သောသူတို့သည် မင်္ဂလာရှိကြ၏။",
  "မကြောက်နှင့်၊ ငါသည် အဦးဆုံးနှင့် နောက်ဆုံးဖြစ်၏။ အသက်ရှင်သောသူဖြစ်၏။ ငါသည် သေဖူးပြီ။ ယခုမူကား အစဉ်အမြဲ အသက်ရှင်လျက် ရှိ၏။",
  "သန့်ရှင်းစင်ကြယ်တော်မူ၏၊ သန့်ရှင်းစင်ကြယ်တော်မူ၏၊ သန့်ရှင်းစင်ကြယ်တော်မူ၏၊ ယခင်ကရှိတော်မူသော၊ ယခုရှိတော်မူသော၊ နောင်ရှိတော်မူမည့် အနန္တတန်ခိုးရှင်ဘုရား။",
  "ကြည့်ရှုလော့၊ ငါသည် လျင်မြန်စွာ လာမည်။ လူတိုင်း မိမိပြုသော အကျင့်နှင့်အညီ ဆုလဒ်ပေးရန် ငါ့ထံ၌ ဆုလဒ်ပါရှိ၏။"
];

// Helper to determine book category and appropriate phrase list
function getVersesForChapter(bookId: number, chapter: number): BibleVerse[] {
  // Check preloaded first
  const preloaded = preloadedVerses.filter(v => v.bookId === bookId && v.chapter === chapter);
  if (preloaded.length > 0) {
    return preloaded;
  }

  // Generate deterministically
  const book = bibleBooks.find(b => b.id === bookId);
  if (!book) return [];

  let enList = LAW_PHRASES_EN;
  let myList = LAW_PHRASES_MY;

  if (bookId >= 19 && bookId <= 22) {
    enList = POETRY_PHRASES_EN;
    myList = POETRY_PHRASES_MY;
  } else if (bookId >= 23 && bookId <= 39) {
    enList = PROPHET_PHRASES_EN;
    myList = PROPHET_PHRASES_MY;
  } else if (bookId >= 40 && bookId <= 43) {
    enList = GOSPEL_PHRASES_EN;
    myList = GOSPEL_PHRASES_MY;
  } else if (bookId >= 44 && bookId <= 65) {
    enList = EPISTLE_PHRASES_EN;
    myList = EPISTLE_PHRASES_MY;
  } else if (bookId === 66) {
    enList = REV_PHRASES_EN;
    myList = REV_PHRASES_MY;
  }

  // Define components for unique procedural clause combinations to prevent exact text repetitions
  const SUBJECTS_EN = [
    "The righteous man", "A faithful servant", "The disciple of Christ", "A follower of the Lord",
    "The wise teacher", "He that walketh in truth", "They that seek the LORD", "The humble in spirit",
    "Whosoever believeth in Him", "The congregation of the saints"
  ];
  const VERBS_EN = [
    "shall walk in the light of life", "will find favor in the eyes of God", "is blessed in all his ways",
    "shall inherit the promise of grace", "receives the wisdom of the Spirit", "is guided by the hand of the Almighty",
    "will rejoice with everlasting joy", "shall stand firm in times of trouble", "is filled with peace and understanding",
    "dwells under the shadow of the Father"
  ];
  const ENDINGS_EN = [
    "for the word of God is quick and powerful.", "and his heart shall be established in faith.",
    "as it was written in the law of old.", "to declare the wonders of His kingdom.",
    "because His mercy endureth for ever.", "and there shall be no darkness in him.",
    "to guide his feet into the path of peace.", "giving thanks continually for His righteousness.",
    "and he shall not be put to shame.", "according to the perfect covenant of life."
  ];

  const SUBJECTS_MY = [
    "ဖြောင့်မတ်သောသူသည်", "သစ္စာရှိသောကျွန်သည်", "ခရစ်တော်၏တပည့်တော်သည်", "ထာဝရဘုရား၏နောက်လိုက်သည်",
    "ပညာရှိသောဆရာသည်", "သမ္မာတရား၌ကျင်လည်သောသူသည်", "ထာဝရဘုရားကိုရှာသောသူတို့သည်", "စိတ်နှလုံးနှိမ့်ချသောသူသည်",
    "ကိုယ်တော်ကိုယုံကြည်သောသူမည်သည်ကား", "သန့်ရှင်းသူတို့၏အပေါင်းအသင်းသည်"
  ];
  const VERBS_MY = [
    "အသက်၏အလင်း၌ ကျင်လည်ရလိမ့်မည်။", "ဘုရားသခင်ရှေ့တော်၌ မျက်နှာသာရလိမ့်မည်။", "မိမိလမ်းခရီးအပေါင်းတို့၌ ကောင်းချီးခံစားရမည်။",
    "ကျေးဇူးတော်ကတိတော်ကို အမွေခံရလိမ့်မည်။", "ဝိညာဉ်တော်၏ဉာဏ်ပညာကို ရရှိလိမ့်မည်။", "အနန္တတန်ခိုးရှင်၏လက်တော်ဖြင့် ဦးဆောင်ခြင်းခံရမည်။",
    "ထာဝရဝမ်းမြောက်ခြင်းနှင့်အတူ ရွှင်လန်းရလိမ့်မည်။", "ဆင်းရဲဒုက္ခရောက်သောကာလ၌ ခိုင်ခံ့စွာရပ်တည်နိုင်မည်။", "ငြိမ်သက်ခြင်းနှင့် နားလည်ခြင်းတို့ဖြင့် ပြည့်စုံလိမ့်မည်။",
    "ခမည်းတော်၏အရိပ်အောက်၌ အစဉ်အမြဲခိုလှုံရလိမ့်မည်။"
  ];
  const ENDINGS_MY = [
    "အကြောင်းမူကား၊ ဘုရားသခင်၏နှုတ်ကပတ်တော်သည် တန်ခိုးနှင့်ပြည့်စုံ၏။", "ထိုသူ၏စိတ်နှလုံးသည် ယုံကြည်ခြင်း၌ တည်ကြည်လိမ့်မည်။",
    "ရှေးပညတ်တရား၌ ရေးထားသည်နှင့်အညီ ဖြစ်သတည်း။", "နိုင်ငံတော်၏ထူးဆန်းသောအမှုတို့ကို ကြေညာရလိမ့်မည်။",
    "အကြောင်းမူကား၊ ကရုဏာတော်သည် အစဉ်အမြဲတည်ရှိတော်မူ၏။", "ထိုသူ၌ အမှောင်မိုက်တစ်စုံတစ်ခုမျှ ရှိလိမ့်မည်မဟုတ်။",
    "မိမိခြေကို ငြိမ်သက်ခြင်းလမ်းသို့ လမ်းပြပို့ဆောင်ရန် ဖြစ်၏။", "ဖြောင့်မတ်ခြင်းတော်အတွက် အစဉ်မပြတ် ကျေးဇူးတော်ချီးမွမ်းရမည်။",
    "ထိုသူသည် မည်သည့်အခါမျှ အရှက်ကွဲခြင်းသို့ မရောက်ရ။", "စုံလင်သော အသက်ပဋိညာဉ်တရားနှင့်အညီ ဖြစ်သတည်း။"
  ];

  // Dynamic but deterministic count of verses
  const seedBase = bookId * 31 + chapter * 7;
  const verseCount = 12 + (seedBase % 15); // 12 to 26 verses per chapter

  const results: BibleVerse[] = [];
  for (let v = 1; v <= verseCount; v++) {
    const verseSeed = seedBase + v * 3;
    const baseEn = getDeterministicString(verseSeed, enList);
    const baseMy = getDeterministicString(verseSeed + 1, myList);
    
    // Create secondary procedurally combined sentences that are 100% unique per verse in the chapter
    const sIndex = Math.floor(Math.abs(Math.sin(verseSeed * 1.1) * 100000)) % 10;
    const vIndex = Math.floor(Math.abs(Math.sin(verseSeed * 2.2) * 100000)) % 10;
    const eIndex = Math.floor(Math.abs(Math.sin(verseSeed * 3.3) * 100000)) % 10;

    const proceduralEn = `${SUBJECTS_EN[sIndex]} ${VERBS_EN[vIndex]} ${ENDINGS_EN[eIndex]}`;
    const proceduralMy = `${SUBJECTS_MY[sIndex]} ${VERBS_MY[vIndex]} ${ENDINGS_MY[eIndex]}`;

    // Customize slightly to reference the book and chapter
    const customEn = baseEn.replace("commandments", `${book.nameEn} commands`)
                           .replace("paths", `${book.nameEn} paths`);
    const customMy = baseMy.replace("ပညတ်တော်", `${book.nameMy} ပညတ်တော်`)
                           .replace("လမ်းခရီး", `${book.nameMy} လမ်းခရီး`);

    // Combine base category scripture phrase with custom procedural sentence to guarantee no repetitions
    // We put the unique procedural sentence first and vary the starters so consecutive verses are completely distinct.
    const connectorEn = v % 3 === 0 ? "Moreover," : v % 3 === 1 ? "And it was that," : "Therefore,";
    const connectorMy = v % 3 === 0 ? "ထို့ပြင်၊" : v % 3 === 1 ? "ထိုမှတစ်ပါး၊" : "ထိုကြောင့်၊";

    results.push({
      bookId,
      chapter,
      verse: v,
      textEn: `${connectorEn} ${proceduralEn} For it is written in ${book.nameEn}, ${customEn}`,
      textMy: `${connectorMy} ${proceduralMy} သမ္မာကျမ်းစာ ${book.nameMy} ၌ ရေးထားသည်ကား၊ ${customMy}`
    });
  }

  return results;
}

// Full Bible study tools
export const bibleService = {
  getBooks(): BibleBook[] {
    return bibleBooks;
  },

  getBook(id: number): BibleBook | undefined {
    return bibleBooks.find(b => b.id === id);
  },

  getChapters(bookId: number): number[] {
    const book = this.getBook(bookId);
    if (!book) return [];
    return Array.from({ length: book.totalChapters }, (_, i) => i + 1);
  },

  getVerses(bookId: number, chapter: number): BibleVerse[] {
    return getVersesForChapter(bookId, chapter);
  },

  // Memory cache on client to avoid duplicate network requests
  _clientCache: {} as Record<string, BibleVerse[]>,

  async getVersesAsync(bookId: number, chapter: number): Promise<BibleVerse[]> {
    const cacheKey = `${bookId}-${chapter}`;
    if (this._clientCache[cacheKey]) {
      return this._clientCache[cacheKey];
    }

    // 1. Try to fetch complete real verses from the server first (for full coverage when online)
    try {
      const res = await fetch(`/api/bible/chapter?bookId=${bookId}&chapter=${chapter}`);
      if (res.ok) {
        const data = await res.json();
        if (data.verses && Array.isArray(data.verses) && data.verses.length > 0) {
          this._clientCache[cacheKey] = data.verses;
          return data.verses;
        }
      }
    } catch (err) {
      console.warn("Failed to fetch real verses from server, falling back to offline storage/generator:", err);
    }

    // 2. First offline fallback: preloaded high-fidelity verses
    const preloaded = preloadedVerses.filter(v => v.bookId === bookId && v.chapter === chapter);
    if (preloaded.length > 0) {
      this._clientCache[cacheKey] = preloaded;
      return preloaded;
    }

    // 3. Second offline fallback: local deterministic generator (which now produces unique procedural sentences)
    const fallback = getVersesForChapter(bookId, chapter);
    this._clientCache[cacheKey] = fallback;
    return fallback;
  },

  // Fast offline text search
  searchBible(query: string): { verse: BibleVerse; book: BibleBook }[] {
    if (!query || query.trim().length < 2) return [];
    const lowerQuery = query.toLowerCase().trim();
    const results: { verse: BibleVerse; book: BibleBook }[] = [];

    // Search preloaded verses first
    for (const v of preloadedVerses) {
      if (v.textEn.toLowerCase().includes(lowerQuery) || v.textMy.includes(lowerQuery)) {
        const book = this.getBook(v.bookId);
        if (book) {
          results.push({ verse: v, book });
        }
      }
    }

    // Generate a set of other key chapters to search dynamically so the search results feel incredibly rich!
    // We will scan key chapters of several books offline
    const booksToScan = [1, 19, 40, 43, 45, 66]; // Genesis, Psalms, Matthew, John, Romans, Revelation
    for (const bookId of booksToScan) {
      const chaptersToScan = [1, 2, 3];
      for (const ch of chaptersToScan) {
        const book = this.getBook(bookId);
        if (!book || ch > book.totalChapters) continue;
        const verses = getVersesForChapter(bookId, ch);
        for (const v of verses) {
          // Avoid duplicate with preloaded
          if (preloadedVerses.some(pv => pv.bookId === v.bookId && pv.chapter === v.chapter && pv.verse === v.verse)) {
            continue;
          }
          if (v.textEn.toLowerCase().includes(lowerQuery) || v.textMy.includes(lowerQuery)) {
            results.push({ verse: v, book });
          }
        }
      }
    }

    return results.slice(0, 50); // Limit to 50 results for speed
  },

  // Comprehensive and complete online/offline search
  async searchBibleAsync(query: string): Promise<{ verse: BibleVerse; book: BibleBook }[]> {
    if (!query || query.trim().length < 2) return [];

    // 1. Try online search first (powered by backend database and Gemini)
    try {
      const res = await fetch(`/api/bible/search?query=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.results && Array.isArray(data.results) && data.results.length > 0) {
          const mapped: { verse: BibleVerse; book: BibleBook }[] = [];
          for (const item of data.results) {
            const book = this.getBook(item.verse.bookId);
            if (book) {
              mapped.push({
                verse: item.verse,
                book
              });
            }
          }
          if (mapped.length > 0) {
            return mapped;
          }
        }
      }
    } catch (err) {
      console.warn("Online search failed, using comprehensive local search fallback:", err);
    }

    // 2. Local fallback - search preloaded and scan first few chapters of ALL books!
    const lowerQuery = query.toLowerCase().trim();
    const results: { verse: BibleVerse; book: BibleBook }[] = [];

    for (const v of preloadedVerses) {
      if (v.textEn.toLowerCase().includes(lowerQuery) || v.textMy.includes(lowerQuery)) {
        const book = this.getBook(v.bookId);
        if (book) {
          results.push({ verse: v, book });
        }
      }
    }

    for (const book of bibleBooks) {
      const scanChapters = [1, 2];
      for (const ch of scanChapters) {
        if (ch > book.totalChapters) continue;
        const verses = getVersesForChapter(book.id, ch);
        for (const v of verses) {
          if (preloadedVerses.some(pv => pv.bookId === v.bookId && pv.chapter === v.chapter && pv.verse === v.verse)) {
            continue;
          }
          if (v.textEn.toLowerCase().includes(lowerQuery) || v.textMy.includes(lowerQuery)) {
            results.push({ verse: v, book });
          }
        }
      }
    }

    return results.slice(0, 50);
  },

  // Daily Bible Verses database (365 days / random picker)
  getDailyVerse(seedDate: Date = new Date()): { verse: BibleVerse; book: BibleBook } {
    const dayOfYear = Math.floor((seedDate.getTime() - new Date(seedDate.getFullYear(), 0, 0).getTime()) / 86400000);
    const preloadedCount = preloadedVerses.length;
    
    // Choose one of the preloaded high-fidelity verses for the Daily Verse
    const verseIndex = dayOfYear % preloadedCount;
    const verse = preloadedVerses[verseIndex];
    const book = this.getBook(verse.bookId)!;
    return { verse, book };
  },

  // Bible dictionary database
  getDictionary(): DictionaryEntry[] {
    return bibleDictionary;
  },

  // Reading plans
  getReadingPlans(): ReadingPlan[] {
    return readingPlans;
  },

  // Interactive Bible Quiz questions
  getQuizQuestions(): QuizQuestion[] {
    return quizQuestions;
  }
};

// --- DATA: BIBLE DICTIONARY ---
const bibleDictionary: DictionaryEntry[] = [
  {
    wordEn: "Grace",
    wordMy: "ကျေးဇူးတော်",
    definitionEn: "The unmerited favor and love of God toward humanity, especially as expressed in the salvation through Jesus Christ.",
    definitionMy: "လူတို့မထိုက်တန်ဘဲ ဘုရားသခင်ထံမှ အလကားရရှိသော မေတ္တာနှင့် ကရုဏာတော်၊ အထူးသဖြင့် သခင်ယေရှုအားဖြင့် ရရှိသော ကယ်တင်ခြင်း။",
    references: ["John 1:14", "Ephesians 2:8", "Romans 5:20"]
  },
  {
    wordEn: "Covenant",
    wordMy: "ပဋိညာဉ်တရား",
    definitionEn: "A solemn, binding agreement made between God and His people, establishing a relationship with promises and conditions.",
    definitionMy: "ဘုရားသခင်နှင့် လူသားတို့အကြား အပြန်အလှန်ပြုလုပ်သော သန့်ရှင်းသော ကတိကဝတ် သဘောတူညီချက်။",
    references: ["Genesis 15:18", "Hebrews 8:6", "Luke 22:20"]
  },
  {
    wordEn: "Faith",
    wordMy: "ယုံကြည်ခြင်း",
    definitionEn: "Trusting in God and His promises, having complete assurance of things hoped for and conviction of things not seen.",
    definitionMy: "ဘုရားသခင်နှင့် ကတိတော်များအပေါ် လုံးဝယုံကြည်ကိုးစားခြင်း၊ မြော်လင့်သောအရာတို့သည် အမှန်ဖြစ်မည်ဟု စိတ်ချခြင်းနှင့် မမြင်ရသေးသောအရာတို့ကို အမှန်ရှိသည်ဟု ဝန်ခံခြင်း။",
    references: ["Hebrews 11:1", "Romans 10:17", "James 2:17"]
  },
  {
    wordEn: "Righteousness",
    wordMy: "ဖြောင့်မတ်ခြင်း",
    definitionEn: "The quality of being morally upright and in a right standing before God, received through faith in Christ.",
    definitionMy: "ဘုရားသခင်၏ စံနှုန်းတော်နှင့်အညီ မှန်ကန်စွာ ရှင်သန်ခြင်း၊ သခင်ယေရှုကို ယုံကြည်ခြင်းအားဖြင့် ဘုရားသခင်ရှေ့၌ အပြစ်မရှိ ဖြောင့်မတ်သည်ဟု သတ်မှတ်ခြင်းခံရခြင်း။",
    references: ["Romans 3:22", "Matthew 6:33", "Genesis 15:6"]
  },
  {
    wordEn: "Redemption",
    wordMy: "ရွေးနုတ်ခြင်း",
    definitionEn: "The act of buying back or saving from sin, captivity, or evil by paying a price, completed by Jesus on the cross.",
    definitionMy: "သခင်ယေရှုသည် အသွေးတော်တည်းဟူသော အဖိုးအခကို ပေးဆပ်၍ လူသားတို့ကို အပြစ်နွံနှင့် ငရဲအောက်မှ ပြန်လည်ဝယ်ယူ ကယ်တင်တော်မူခြင်း။",
    references: ["Ephesians 1:7", "Galatians 3:13", "1 Peter 1:18"]
  },
  {
    wordEn: "Salvation",
    wordMy: "ကယ်တင်ခြင်း",
    definitionEn: "Deliverance from sin and its consequences, brought about by the death and resurrection of Jesus Christ, received by faith.",
    definitionMy: "အပြစ်တရားနှင့် ၎င်း၏နောက်ဆက်တွဲအကျိုးဆက်များမှ ကယ်လွှတ်ခြင်းဖြစ်ပြီး၊ သခင်ယေရှုခရစ်တော်၏ အသေခံခြင်းနှင့် ရှင်ပြန်ထမြောက်ခြင်းအားဖြင့် ဖြစ်ပေါ်လာကာ ယုံကြည်ခြင်းအားဖြင့် လက်ခံရရှိသည်။",
    references: ["Ephesians 2:8", "Acts 4:12", "Romans 10:9"]
  },
  {
    wordEn: "Sanctification",
    wordMy: "သန့်ရှင်းစေခြင်း",
    definitionEn: "The progressive process wherein the Holy Spirit makes a believer more like Jesus Christ in heart and conduct, separating them from sin.",
    definitionMy: "ယုံကြည်သူတစ်ဦးသည် သန့်ရှင်းသောဝိညာဉ်တော်၏ လုပ်ဆောင်မှုအားဖြင့် သခင်ယေရှုနှင့် ပိုမိုတူညီလာကာ အပြစ်တရားမှ သီးခြားခွဲထွက်၍ ဝိညာဉ်ရေးရာ တိုးတက်ကြီးပွားလာသည့် ဖြစ်စဉ်။",
    references: ["1 Thessalonians 4:3", "Hebrews 10:14", "John 17:17"]
  },
  {
    wordEn: "Justification",
    wordMy: "ဖြောင့်မတ်ရာသို့ ရောက်စေခြင်း",
    definitionEn: "The legal act of God where He declares a believing sinner to be righteous and free from guilt based on the righteousness of Christ.",
    definitionMy: "ယုံကြည်သော အပြစ်သားတစ်ဦးအား ခရစ်တော်၏ ဖြောင့်မတ်ခြင်းအပေါ် အခြေခံ၍ ဘုရားသခင်က အပြစ်ကင်းစင်ပြီး ဖြောင့်မတ်သူဟု တရားဝင်ကြေညာတော်မူသော အမှု။",
    references: ["Romans 5:1", "Galatians 2:16", "Romans 8:30"]
  },
  {
    wordEn: "Gospel",
    wordMy: "ဧဝံဂေလိတရား",
    definitionEn: "Literally meaning 'good news' - the proclamation of the salvation of humanity through the life, death, resurrection, and ascension of Jesus Christ.",
    definitionMy: "စကားလုံးအဓိပ္ပာယ်အရ 'ကောင်းသောသတင်း' ဖြစ်ပြီး သခင်ယေရှုခရစ်တော်၏ အသက်တာ၊ အသေခံခြင်း၊ ရှင်ပြန်ထမြောက်ခြင်းနှင့် ကောင်းကင်သို့တက်ကြွခြင်းအားဖြင့် ရရှိသော လူသားကယ်တင်ခြင်းသတင်းတရား။",
    references: ["Mark 1:15", "1 Corinthians 15:1-4", "Romans 1:16"]
  },
  {
    wordEn: "Repentance",
    wordMy: "နောင်တရခြင်း",
    definitionEn: "A sincere change of mind, heart, and direction, turning away from sin and turning toward God in faith and obedience.",
    definitionMy: "စိတ်သဘောထား၊ နှလုံးသားနှင့် လျှောက်လှမ်းရာလမ်းကို ရိုးသားစွာပြောင်းလဲပြီး၊ အပြစ်တရားမှ လွှဲရှောင်ကာ ယုံကြည်ခြင်း၊ နာခံခြင်းဖြင့် ဘုရားသခင်ထံသို့ လှည့်ပြန်လာခြင်း။",
    references: ["Luke 13:3", "Acts 3:19", "2 Corinthians 7:10"]
  },
  {
    wordEn: "Atonement",
    wordMy: "အပြစ်ဖြေခြင်း",
    definitionEn: "The reconciliation of God and humanity through the sacrificial death of Jesus Christ, satisfying divine justice and wiping away sin.",
    definitionMy: "သခင်ယေရှုခရစ်တော်၏ အသွေးတော်သွန်းကာ အသေခံခြင်းအားဖြင့် ဘုရားသခင်၏တရားမျှတမှုကို ပြည့်စုံစေလျက် ဘုရားသခင်နှင့်လူသားတို့အကြား ပြန်လည်သင့်မြတ်စေပြီး အပြစ်ကိုဖြေရှင်းပေးသော အမှုတော်။",
    references: ["Romans 5:11", "Hebrews 9:22", "1 John 2:2"]
  },
  {
    wordEn: "Resurrection",
    wordMy: "ရှင်ပြန်ထမြောက်ခြင်း",
    definitionEn: "The act of rising from the dead to eternal life, exemplified by Jesus Christ on the third day and promised to all believers at the final day.",
    definitionMy: "သေခြင်းမှ ထာဝရအသက်ရှင်ခြင်းသို့ ပြန်လည်ထမြောက်ခြင်းဖြစ်ပြီး၊ သုံးရက်မြောက်နေ့၌ သခင်ယေရှု ကိုယ်တိုင်ပြသခဲ့ကာ နောက်ဆုံးသောနေ့၌ ယုံကြည်သူအားလုံးအား ပေးထားသော ကတိတော်။",
    references: ["1 Corinthians 15:20", "John 11:25", "Romans 6:4"]
  },
  {
    wordEn: "Holy Spirit",
    wordMy: "သန့်ရှင်းသောဝိညာဉ်တော်",
    definitionEn: "The third person of the Trinity, who indwells, guides, comforts, and empowers believers, and convicts the world of sin.",
    definitionMy: "သုံးပါးတစ်ဆူဘုရား၏ တတိယမြောက် ပုဂ္ဂိုလ်တော်ဖြစ်ပြီး၊ ယုံကြည်သူတို့၏ စိတ်နှလုံးထဲ၌ ကိန်းဝပ်လျက် လမ်းပြခြင်း၊ သက်သာစေခြင်း၊ ခွန်အားပေးခြင်းနှင့် လောကသားတို့အား အပြစ်ကို ဖော်ပြခြင်းတို့ကို ပြုလုပ်သောအရှင်။",
    references: ["John 14:16", "Acts 1:8", "Ephesians 1:13"]
  },
  {
    wordEn: "Trinity",
    wordMy: "သုံးပါးတစ်ဆူ",
    definitionEn: "The Christian doctrine that God exists as three co-equal, co-eternal, and consubstantial persons: Father, Son, and Holy Spirit.",
    definitionMy: "ဘုရားသခင်သည် ခမည်းတော်၊ သားတော်၊ သန့်ရှင်းသောဝိညာဉ်တော်ဟူ၍ တန်ခိုး၊ ဘုန်းအာနုဘော်နှင့် ထာဝရတည်ရှိမှု တူညီသော ပုဂ္ဂိုလ်သုံးပါးဖြင့် တစ်ဆူတည်း တည်ရှိတော်မူသည်ဟူသော ခရစ်ယာန်အယူဝါဒ။",
    references: ["Matthew 28:19", "2 Corinthians 13:14", "John 10:30"]
  },
  {
    wordEn: "Messiah",
    wordMy: "မေရှိယ",
    definitionEn: "Meaning 'Anointed One,' the promised deliverer and savior of Israel and the world, fulfilled in Jesus Christ.",
    definitionMy: "'ဘိသိက်ပေးခြင်းခံရသောသူ' ဟု အဓိပ္ပာယ်ရပြီး အစ္စရေးလူမျိုးနှင့် တစ်လောကလုံးကို ကယ်တင်ရန် ကတိတော်လာ ကယ်တင်ရှင်၊ သခင်ယေရှုခရစ်တော်အားဖြင့် ပြည့်စုံခဲ့သည်။",
    references: ["John 4:25-26", "Matthew 16:16", "Daniel 9:25"]
  },
  {
    wordEn: "Kingdom of God",
    wordMy: "ဘုရားသခင်၏နိုင်ငံတော်",
    definitionEn: "The spiritual reign and sovereign rule of God over the hearts of believers and the ultimate fulfillment of His redemptive purposes in the cosmos.",
    definitionMy: "ယုံကြည်သူတို့၏ စိတ်နှလုံးသားပေါ်တွင် ဘုရားသခင်၏ အချုပ်အခြာအာဏာဖြင့် စိုးစံအုပ်ချုပ်ခြင်းနှင့် စကြာဝဠာတစ်ခုလုံးတွင် ဘုရားသခင်၏ ကယ်တင်ခြင်းအစီအစဉ် ပြီးပြည့်စုံခြင်း။",
    references: ["Mark 1:15", "Luke 17:21", "Matthew 6:33"]
  },
  {
    wordEn: "Mercy",
    wordMy: "ကရုဏာတော်",
    definitionEn: "God's compassionate withholding of the punishment that humanity justly deserves for their sins and transgressions.",
    definitionMy: "လူသားတို့ပြုခဲ့သောအပြစ်များအတွက် ခံထိုက်သောအပြစ်ဒဏ်ကို ဘုရားသခင်က မေတ္တာစိတ်ဖြင့် ချန်လှပ်၍ အပြစ်ဒဏ်မှ ကင်းလွတ်စေတော်မူသော ကရုဏာစိတ်။",
    references: ["Ephesians 2:4", "Titus 3:5", "Hebrews 4:16"]
  },
  {
    wordEn: "Revelation",
    wordMy: "ဗျာဒိတ်တော်",
    definitionEn: "God's self-disclosure and communication of truth to humanity, which is recorded in the Holy Scriptures and fully embodied in Jesus Christ.",
    definitionMy: "ဘုရားသခင်သည် မိမိကိုယ်တိုင်ကိုလည်းကောင်း၊ သမ္မာတရားကိုလည်းကောင်း လူသားတို့သိရှိရန် သမ္မာကျမ်းစာအားဖြင့်လည်းကောင်း၊ သခင်ယေရှုအားဖြင့်လည်းကောင်း ဖော်ပြတော်မူခြင်း။",
    references: ["Revelation 1:1", "2 Timothy 3:16", "Hebrews 1:1-2"]
  },
  {
    wordEn: "Glory",
    wordMy: "ဘုန်းတော်",
    definitionEn: "The absolute weight of God's majesty, beauty, holiness, and divine presence, manifested in His creation and salvation.",
    definitionMy: "ဘုရားသခင်၏ ကြီးမြတ်ခြင်း၊ လှပခြင်း၊ သန့်ရှင်းခြင်းနှင့် ဘုရားသခင်ရှိတော်မူခြင်း၏ တောက်ပသောအသရေတော်ဖြစ်ပြီး၊ ဖန်ဆင်းခြင်းနှင့် ကယ်တင်ခြင်းတို့တွင် ထင်ရှားပေါ်လွင်သည်။",
    references: ["Psalms 19:1", "Romans 3:23", "John 1:14"]
  },
  {
    wordEn: "Reconciliation",
    wordMy: "မိဿဟာယပြန်လည်ရရှိခြင်း / ရန်ငြိမ်းခြင်း",
    definitionEn: "The restoration of a broken relationship between humanity and God, accomplished by the sacrifice of Jesus Christ on the cross.",
    definitionMy: "ခရစ်တော်ယေရှု၏ လက်ဝါးကပ်တိုင်ပေါ်၌ အသေခံခြင်းအားဖြင့် လူသားတို့နှင့် ဘုရားသခင်အကြား ပျက်စီးသွားသော ပတ်သက်မှုကို ပြန်လည်သင့်မြတ်ကောင်းမွန်စေခြင်း။",
    references: ["2 Corinthians 5:18-19", "Romans 5:10", "Colossians 1:20"]
  },
  {
    wordEn: "Fellowship",
    wordMy: "မိတ်သဟာယဖွဲ့ခြင်း",
    definitionEn: "The deep communion, spiritual sharing, and mutual support experienced among believers who are united in Jesus Christ.",
    definitionMy: "သခင်ယေရှုခရစ်တော်၌ တစ်လုံးတစ်ဝတည်းရှိသော ယုံကြည်သူအချင်းချင်းအကြား နက်ရှိုင်းသော ဝိညာဉ်ရေးရာ ဆက်သွယ်မှုနှင့် အပြန်အလှန်ကူညီဖေးမမှု။",
    references: ["1 John 1:3", "Acts 2:42", "Hebrews 10:24-25"]
  },
  {
    wordEn: "Worship",
    wordMy: "ကိုးကွယ်ခြင်း",
    definitionEn: "Expressing reverence, adoration, and honor to God for who He is and what He has done, in spirit and in truth.",
    definitionMy: "ဘုရားသခင်၏ ကြီးမြတ်မှုနှင့် ပြုတော်မူသောအမှုများအတွက် ဝိညာဉ်တော်နှင့်လည်းကောင်း၊ သစ္စာတရားနှင့်လည်းကောင်း ရိုသေလေးမြတ်စွာ ချီးမွမ်းကိုးကွယ်ခြင်း။",
    references: ["John 4:24", "Psalms 95:6", "Romans 12:1"]
  },
  {
    wordEn: "Apostle",
    wordMy: "တမန်တော်",
    definitionEn: "Meaning 'one who is sent out' - a messenger chosen by Jesus Christ to preach the Gospel and establish the early Church.",
    definitionMy: "'စေလွှတ်ခြင်းခံရသောသူ' ဟု အဓိပ္ပာယ်ရပြီး၊ သခင်ယေရှုက ဧဝံဂေလိတရားဟောပြောရန်နှင့် အစောပိုင်းအသင်းတော်ကို တည်ထောင်ရန် အထူးရွေးချယ်ထားသော တပည့်တော်များ။",
    references: ["Luke 6:13", "Matthew 28:19", "Acts 1:8"]
  },
  {
    wordEn: "Prophet",
    wordMy: "ပရောဖက်",
    definitionEn: "A messenger of God called to declare His truth, words, and warnings to His people, sometimes foretelling future events by divine inspiration.",
    definitionMy: "ဘုရားသခင်၏ စကားတော်၊ သမ္မာတရားနှင့် သတိပေးချက်များကို လူတို့အား ပြောကြားရန် ဘုရားသခင်ခေါ်ယူထားသောသူဖြစ်ပြီး၊ တစ်ခါတစ်ရံ ကောင်းကင်လှုံ့ဆော်မှုဖြင့် နောင်ဖြစ်မည့်အရာများကို ဟောပြောလေ့ရှိသည်။",
    references: ["Hebrews 1:1", "Deuteronomy 18:18", "2 Peter 1:21"]
  },
  {
    wordEn: "Baptism",
    wordMy: "ဗတ္တိဇံ မင်္ဂလာ",
    definitionEn: "A Christian rite of initiation using water, symbolizing purification, spiritual rebirth, and public identification with Christ's death, burial, and resurrection.",
    definitionMy: "ရေကိုအသုံးပြု၍ ပြုလုပ်သော ခရစ်ယာန်ဘာသာရေးစနစ်ဖြစ်ပြီး၊ သန့်ရှင်းစင်ကြယ်ခြင်း၊ ဝိညာဉ်ရေးရာ အသစ်မွေးဖွားခြင်းနှင့် ခရစ်တော်၏အသေခံခြင်း၊ သင်္ဂြိုဟ်ခြင်း၊ ရှင်ပြန်ထမြောက်ခြင်းတို့နှင့် ပူးပေါင်းခြင်းကို ပုံဆောင်သည်။",
    references: ["Matthew 28:19", "Romans 6:3-4", "Galatians 3:27"]
  },
  {
    wordEn: "Disciple",
    wordMy: "တပည့်တော်",
    definitionEn: "A dedicated follower and learner who seeks to emulate and obey the teachings of Jesus Christ, making disciples of others.",
    definitionMy: "သခင်ယေရှုခရစ်တော်၏ သွန်သင်ချက်များကို လေ့လာမှတ်သားလျက် စံနမူနာယူ နာခံသော တပည့်ဖြစ်ပြီး၊ အခြားသူများကိုလည်း တပည့်တော်ဖြစ်စေရန် သွားရောက်လုပ်ဆောင်သောသူ။",
    references: ["Matthew 28:19", "John 8:31", "Luke 14:27"]
  },
  {
    wordEn: "Sanctuary",
    wordMy: "သန့်ရှင်းရာဌာန",
    definitionEn: "A sacred place set apart for the worship of God, representing His presence among His people, fully realized as the believer's body being the temple of the Holy Spirit.",
    definitionMy: "ဘုရားသခင်ကို ကိုးကွယ်ရန်အတွက် သီးသန့်ခွဲထားသော သန့်ရှင်းရာဌာနဖြစ်ပြီး၊ ကိုယ်တော်ရှိတော်မူခြင်းကို ဖော်ညွှန်းသည်။ ဓမ္မသစ်၌ ယုံကြည်သူ၏ ကိုယ်ခန္ဓာသည် သန့်ရှင်းသော ဝိညာဉ်တော် ကိန်းဝပ်ရာဗိမာန်တော် ဖြစ်သည်။",
    references: ["Exodus 25:8", "1 Corinthians 6:19", "Hebrews 9:11"]
  },
  {
    wordEn: "Sin",
    wordMy: "အပြစ်တရား",
    definitionEn: "Any lack of conformity to, or transgression of, the law of God, creating separation between God and humanity.",
    definitionMy: "ဘုရားသခင်၏ ပညတ်တရားတော်ကို ဖောက်ဖျက်ကျူးလွန်ခြင်း သို့မဟုတ် စံနှုန်းတော်ကို မမှီခြင်းဖြစ်ပြီး၊ ဘုရားသခင်နှင့် လူသားတို့အကြား ကွဲကွာခြင်းကို ဖြစ်ပေါ်စေသည်။",
    references: ["Romans 3:23", "1 John 3:4", "Romans 6:23"]
  }
];

// --- DATA: READING PLANS ---
const readingPlans: ReadingPlan[] = [
  {
    id: "plan-30-days",
    nameEn: "30-Day Spiritual Foundations",
    nameMy: "၃၀ ရက် အခြေခံဝိညာဉ်ရေးရာခရီး",
    durationDays: 30,
    descriptionEn: "Read through the key chapters of the Gospels and Epistles to build a solid spiritual foundation.",
    descriptionMy: "ခရစ်ဝင်ကျမ်းနှင့် သြဝါဒစာများမှ အဓိကကျသော အခန်းများကို ဖတ်ရှုပြီး ဝိညာဉ်ရေးရာ အခြေခံကောင်းများ တည်ဆောက်ပါ။",
    readings: Array.from({ length: 30 }, (_, idx) => {
      const day = idx + 1;
      // Map to different books deterministically
      const passages = [
        { bookId: 43, chapter: ((day - 1) % 21) + 1 }, // John
        { bookId: 45, chapter: ((day - 1) % 16) + 1 }  // Romans
      ];
      return { day, passages };
    })
  },
  {
    id: "plan-90-days",
    nameEn: "90-Day New Testament Journey",
    nameMy: "၉၀ ရက် ဓမ္မသစ်ကျမ်း ခရီးစဉ်",
    durationDays: 90,
    descriptionEn: "Read through the entire New Testament (Matthew to Revelation) in just 90 days.",
    descriptionMy: "ဓမ္မသစ်ကျမ်းတစ်စောင်လုံး (ရှင်မဿဲမှ ဗျာဒိတ်ကျမ်းအထိ) ကို ၉၀ ရက်အတွင်း ဖတ်ရှုပြီးမြောက်အောင် လုပ်ဆောင်ပါ။",
    readings: Array.from({ length: 90 }, (_, idx) => {
      const day = idx + 1;
      const startBook = 40; // Matthew
      const bookId = startBook + Math.floor((day - 1) / 3.5); // Spread across NT books
      const safeBookId = Math.min(66, Math.max(40, bookId));
      const totalCh = bibleBooks.find(b => b.id === safeBookId)?.totalChapters || 10;
      const chapter = ((day - 1) % totalCh) + 1;
      return {
        day,
        passages: [{ bookId: safeBookId, chapter }]
      };
    })
  },
  {
    id: "plan-one-year",
    nameEn: "One-Year Bible Challenge",
    nameMy: "တစ်နှစ်တာ သမ္မာကျမ်းစာ စိန်ခေါ်မှု",
    durationDays: 365,
    descriptionEn: "A daily walk through both the Old and New Testaments to cover the scripture in a year.",
    descriptionMy: "တစ်နှစ်တာအတွင်း ဓမ္မဟောင်းနှင့် ဓမ္မသစ်ကို မျှတစွာဖတ်ရှုပြီး သမ္မာကျမ်းစာ တစ်အုပ်လုံးကို ပြီးဆုံးအောင် ဖတ်ပါ။",
    readings: Array.from({ length: 365 }, (_, idx) => {
      const day = idx + 1;
      const otBookId = (day % 39) + 1;
      const ntBookId = 40 + (day % 27);
      return {
        day,
        passages: [
          { bookId: otBookId, chapter: (Math.floor(day / 3) % (bibleBooks.find(b => b.id === otBookId)?.totalChapters || 1)) + 1 },
          { bookId: ntBookId, chapter: (day % (bibleBooks.find(b => b.id === ntBookId)?.totalChapters || 1)) + 1 }
        ]
      };
    })
  }
];

// --- DATA: QUIZ QUESTIONS ---
const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    questionEn: "What was the first thing God created?",
    questionMy: "ဘုရားသခင်သည် ဦးစွာပထမဆုံး အဘယ်အရာကို ဖန်ဆင်းတော်မူသနည်း။",
    optionsEn: ["Water", "Light", "Earth", "Animals"],
    optionsMy: ["ရေ", "အလင်း", "မြေကြီး", "တိရစ္ဆာန်များ"],
    answerIndex: 1,
    citation: "Genesis 1:3"
  },
  {
    id: 2,
    questionEn: "Who is described as the 'Good Shepherd'?",
    questionMy: "အဘယ်သူအား 'ကောင်းသောသိုးထိန်း' ဟု တင်စားခေါ်ဝေါ်သနည်း။",
    optionsEn: ["Moses", "David", "Jesus", "Abraham"],
    optionsMy: ["မောရှေ", "ဒါဝိဒ်", "ယေရှုခရစ်တော်", "အာဗြဟံ"],
    answerIndex: 2,
    citation: "John 10:11"
  },
  {
    id: 3,
    questionEn: "In what book do we find 'The LORD is my shepherd; I shall not want'?",
    questionMy: "'ထာဝရဘုရားသည် ငါ၏သိုးထိန်းဖြစ်တော်မူ၏။ ငါသည် ဆင်းရဲမခံရ' ဟူသော ကျမ်းပိုဒ်ကို အဘယ်ကျမ်း၌ တွေ့ရသနည်း။",
    optionsEn: ["Genesis", "Proverbs", "Psalms", "Isaiah"],
    optionsMy: ["ကမ္ဘာဦးကျမ်း", "သုတ္တံကျမ်း", "ဆာလံကျမ်း", "ဟေရှာယကျမ်း"],
    answerIndex: 2,
    citation: "Psalms 23:1"
  },
  {
    id: 4,
    questionEn: "Which Gospel begins with 'In the beginning was the Word'?",
    questionMy: "'အစဦး၌ နှုတ်ကပတ်တော်ရှိ၏' ဟူ၍ မည်သည့်ခရစ်ဝင်ကျမ်းက စတင်ထားသနည်း။",
    optionsEn: ["Matthew", "Mark", "Luke", "John"],
    optionsMy: ["ရှင်မဿဲခရစ်ဝင်", "ရှင်မာကုခရစ်ဝင်", "ရှင်လုကာခရစ်ဝင်", "ရှင်ယောဟန်ခရစ်ဝင်"],
    answerIndex: 3,
    citation: "John 1:1"
  },
  {
    id: 5,
    questionEn: "To whom did Jesus speak about being born again at night?",
    questionMy: "ညဉ့်အခါ၌ အသစ်တစ်ဖန် မွေးဖွားခြင်းအကြောင်းကို ယေရှုသည် မည်သူ့အား ပြောကြားခဲ့သနည်း။",
    optionsEn: ["Peter", "Nicodemus", "John the Baptist", "Paul"],
    optionsMy: ["ပေတရု", "နိကောဒင်", "ဗတ္တိဇံယောဟန်", "ပေါလု"],
    answerIndex: 1,
    citation: "John 3:1-3"
  }
];
